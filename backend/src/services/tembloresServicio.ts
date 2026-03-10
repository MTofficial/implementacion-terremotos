import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const syncEarthquakes = async () => {
  try {
    const response = await axios.get('https://api.boostr.cl/earthquakes/recent.json');
    const earthquakes = response.data.data;

    console.log(`Datos recibidos. ${earthquakes.length} registros...`);

    let nuevos = 0;
    for (const quake of earthquakes) {
      // Extraemos el número de la URL de "info"
      const urlParts = quake.info.split('/');
      const externalId = urlParts[urlParts.length - 1].replace('.html', '');

      if (!externalId) continue;

      await prisma.earthquake.upsert({
        where: { externalId: externalId },
        update: {
          magnitude: parseFloat(quake.magnitude) || 0,
        },
        create: {
          externalId: externalId,
          title: quake.place, 
          magnitude: parseFloat(quake.magnitude) || 0,
          location: quake.place,
          date: new Date(`${quake.date}T${quake.hour}`),
          latitude: parseFloat(quake.latitude) || 0,
          longitude: parseFloat(quake.longitude) || 0,
        },
      });
      nuevos++;
    }

    /*
    // filtro para mantener solo 2 dias
    const limiteDias = new Date();
    limiteDias.setDate(limiteDias.getDate() - 2);

    const eliminados = await prisma.earthquake.deleteMany({
      where: {
        date: {
          lt: limiteDias // utiliza lt para indicar menor que la fecha limite (less than)
        }
      }
    });
    */
    // console.log(`Limpieza: ${eliminados.count} registros antiguos eliminados.`);

    return { success: true, totalProcesados: nuevos, registrosBorrados: 0 };
  } catch (error) {
    console.error('Error en la sincronización:', error);
    throw error;
  }
};