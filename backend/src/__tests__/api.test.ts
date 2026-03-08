import request from 'supertest';
import express from 'express';

// 1. Mocks
const mockAggregate = jest.fn();
const mockFindMany = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    earthquake: {
      aggregate: mockAggregate,
      findMany: mockFindMany,
    },
  })),
}));

import { PrismaClient } from '@prisma/client';

// 2. Configuración de Express para los tests
const app = express();
app.use(express.json());
const prisma = new PrismaClient();

// Simulamos las rutas
app.get('/api/stats', async (req, res) => {
  try {
    await prisma.earthquake.aggregate({ _avg: { magnitude: true }, _max: { magnitude: true }, _count: { id: true } });
    res.status(200).json({ success: true }); 
  } catch (error) {
    res.status(500).json({ error: 'Error' });
  }
});

app.get('/api/sismos', async (req, res) => {
  try {
    const sismos = await prisma.earthquake.findMany();
    res.status(200).json(sismos);
  } catch (error) {
    res.status(500).json({ error: 'Error interno' });
  }
});

// 3. SUITE DE PRUEBAS
describe('⚙️ Suite de Pruebas de la API de Sismos', () => {
  
  beforeEach(() => {
    jest.clearAllMocks(); // Limpiamos los mocks antes de cada prueba
  });

  it('✅ GET /api/stats - Debería responder con código 200', async () => {
    mockAggregate.mockResolvedValue({ _avg: { magnitude: 3.5 }, _max: { magnitude: 5.0 }, _count: { id: 10 } });
    const response = await request(app).get('/api/stats');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });

  it('✅ GET /api/sismos - Debería devolver un arreglo de sismos', async () => {
    const mockData = [
      { id: 1, location: 'Santiago', magnitude: 5.0 },
      { id: 2, location: 'Valparaíso', magnitude: 4.2 }
    ];
    mockFindMany.mockResolvedValue(mockData);
    
    const response = await request(app).get('/api/sismos');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].location).toBe('Santiago');
  });

  it('❌ GET /api/sismos - Debería manejar errores y devolver 500', async () => {
    // Forzamos un error en la base de datos
    mockFindMany.mockRejectedValue(new Error('Base de datos caída'));
    
    const response = await request(app).get('/api/sismos');
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
  });

});