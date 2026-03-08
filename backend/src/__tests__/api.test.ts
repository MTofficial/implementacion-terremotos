import request from 'supertest';
import express from 'express';

// 1. Preparamos la función "falsa" (mock) para interceptar el llamado a la base de datos
const mockAggregate = jest.fn();

// 2. Le enseñamos a Jest la estructura exacta de PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    earthquake: {
      aggregate: mockAggregate,
    },
  })),
}));

import { PrismaClient } from '@prisma/client';

// 3. Configuramos nuestra mini-aplicación de prueba
const app = express();
app.use(express.json());
const prisma = new PrismaClient();

app.get('/api/stats', async (req, res) => {
  try {
    const stats = await prisma.earthquake.aggregate({
      _avg: { magnitude: true },
      _max: { magnitude: true },
      _count: { id: true },
    });
    
    res.status(200).json({ success: true, message: 'Stats OK' }); 
  } catch (error) {
    res.status(500).json({ error: 'Error' });
  }
});

// 4. Ejecutamos la prueba
describe('Pruebas de la API de Sismos', () => {
  it('Debería responder con código 200 en el endpoint /api/stats', async () => {
    
    // Configuramos los datos ficticios que devolverá el mock sin tocar PostgreSQL
    mockAggregate.mockResolvedValue({
        _avg: { magnitude: 3.5 },
        _max: { magnitude: 5.0 },
        _count: { id: 10 }
    });

    const response = await request(app).get('/api/stats');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
});