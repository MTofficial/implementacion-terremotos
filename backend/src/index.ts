import express from "express";
import cors from "cors";
import cron from "node-cron";
import { syncEarthquakes } from "./services/tembloresServicio";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Endpoint 1: Sincronización Manual
app.get("/api/sync", async (req, res) => {
  try {
    const result = await syncEarthquakes();
    res.json({ message: "Sincronización exitosa", data: result });
  } catch (error) {
    res.status(500).json({ error: "Fallo al sincronizar" });
  }
});

// Endpoint 2: Listado con Filtros (Magnitud y Tiempo)
app.get("/api/sismos", async (req, res) => {
  try {
    const { minMag, dias } = req.query;

    // 1. Preparamos los filtros
    const magnitudMinima = minMag ? parseFloat(minMag as string) : 0;

    // Objeto condicional para construir el "WHERE" de Prisma
    const whereClause: any = {
      magnitude: { gte: magnitudMinima },
    };

    // Si nos envían el filtro de días, calculamos la fecha límite
    if (dias && parseInt(dias as string) > 0) {
      const limiteFecha = new Date();
      limiteFecha.setDate(limiteFecha.getDate() - parseInt(dias as string));
      whereClause.date = { gte: limiteFecha };
    }

    // 2. Ejecutamos la consulta en la base de datos
    const sismos = await prisma.earthquake.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
    });

    res.status(200).json(sismos);
  } catch (error) {
    console.error("Error en /api/sismos:", error);
    res.status(500).json({ error: "Error interno al obtener los sismos" });
  }
});

// Endpoint 3: Estadísticas Básicas
app.get("/api/stats", async (req, res) => {
  try {
    const { minMag, dias } = req.query;
    const magnitudMinima = minMag ? parseFloat(minMag as string) : 0;
    
    // 1. Construimos el mismo filtro que usa la tabla
    const whereClause: any = {
      magnitude: { gte: magnitudMinima },
    };

    if (dias && parseInt(dias as string) > 0) {
      const limiteFecha = new Date();
      limiteFecha.setDate(limiteFecha.getDate() - parseInt(dias as string));
      whereClause.date = { gte: limiteFecha };
    }

    // 2. Aplicamos el filtro a las estadísticas agregadas
    const stats = await prisma.earthquake.aggregate({
      where: whereClause,
      _avg: { magnitude: true },
      _max: { magnitude: true },
      _count: { id: true },
    });

    // 3. Aplicamos el filtro para buscar el sismo más fuerte
    const sismoMasFuerte = await prisma.earthquake.findFirst({
      where: whereClause,
      orderBy: { magnitude: "desc" },
    });

    res.json({
      totalSismos: stats._count.id,
      promedioMagnitud: stats._avg.magnitude
        ? parseFloat(stats._avg.magnitude.toFixed(1))
        : 0,
      magnitudMaxima: stats._max.magnitude || 0,
      sismoMasFuerte: sismoMasFuerte?.location || "N/A",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al calcular estadísticas" });
  }
}); 

// --- NUEVO: Automatización (Cron Job) ---
// La expresión '*/15 * * * *' significa "Ejecutar cada 15 minutos"
cron.schedule("*/15 * * * *", async () => {
  console.log("⏳ Ejecutando sincronización automática (Cron Job)...");
  try {
    const result = await syncEarthquakes();
    console.log(
      `✅ Sincronización automática completada. Nuevos: ${result.totalProcesados}, Borrados: ${result.registrosBorrados}`,
    );
  } catch (error) {
    console.error("❌ Fallo en la sincronización automática:", error);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
  console.log(`⏱️  Cron Job configurado: Sincronización cada 15 minutos.`);
});
