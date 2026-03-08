# 🌍 Sismología Chile - Monitor en Tiempo Real

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

Solución Fullstack para la ingesta, almacenamiento y visualización de datos sísmicos en Chile, consumiendo la API de Boostr. Desarrollado como prueba técnica con un enfoque en escalabilidad, buenas prácticas y tipado estricto.

---

## 🏗️ Arquitectura y Justificación Técnica

Para este proyecto se optó por una arquitectura basada en microservicios ligeros (Frontend y Backend separados), priorizando el rendimiento y la mantenibilidad:

* **Backend (Node.js + Express):** Seleccionado por su eficiencia en operaciones de entrada/salida no bloqueantes. Es ideal para el consumo de APIs externas mediante `axios` y la ejecución fluida de tareas programadas en segundo plano con `node-cron`.
* **Base de Datos (PostgreSQL + Prisma ORM):** Se utilizó una base de datos relacional SQL para garantizar la integridad absoluta de los datos estructurados. Prisma fue elegido por su tipado estricto con TypeScript, facilitando las agregaciones complejas (promedios, máximos) directamente en el motor de base de datos. Se emplea la lógica de `upsert` mediante un `externalId` único para evitar la duplicidad de registros.
* **Frontend (React + Tailwind CSS v4):** React permite una renderización eficiente del DOM al actualizar la tabla de datos y el mapa interactivo. Tailwind CSS se utilizó por su enfoque de utilidades ("utility-first"), reduciendo drásticamente el peso del CSS final y acelerando el desarrollo de la interfaz.
* **Visualización (React-Leaflet):** Se integró para cumplir con el bonus visual, otorgando contexto geográfico interactivo, vital para el monitoreo de eventos sísmicos en Chile.

---

## 🚀 Instrucciones de Ejecución (Entorno Local)

### Requisitos Previos
* **Node.js** (v20 o superior)
* **Docker** y **Docker Compose** instalados y ejecutándose.

### Paso 1: Levantar la Base de Datos
Abre una terminal en la raíz del proyecto y ejecuta:
```bash
docker-compose up -d ```

Paso 2: Configurar el Backend
Abre una terminal en la carpeta backend e instala las dependencias, aplica las migraciones y levanta el servidor:

Bash

cd backend
npm install
npx prisma migrate dev
npm run dev
Nota: El backend incluye un Cron Job que sincroniza datos automáticamente cada 15 minutos y purga registros con más de 48 horas de antigüedad.

Paso 3: Configurar el Frontend
Abre una nueva terminal en la carpeta frontend, instala las dependencias y levanta la interfaz:

Bash

cd frontend
npm install
npm run dev
🌐 El dashboard estará disponible en: http://localhost:5173

👥 Colaboradores del Repositorio
Este repositorio ha sido configurado para evaluación por parte del equipo técnico:

@Cockfla

@isaulcr

@CyL-Fruit