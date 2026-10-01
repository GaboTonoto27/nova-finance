# NOVA — Personal Finance Intelligence

Aplicación de finanzas personales enfocada en jóvenes colombianos, construida como proyecto de ingeniería que integra desarrollo full-stack, análisis de datos e inteligencia artificial.

> **Estado actual:** Fase 01 — Fundación visual y sistema de diseño.

---

## 🎯 Visión

NOVA busca transformar la manera en que un joven administra su dinero, combinando:

- Interfaz moderna y humana (inspirada en productos fintech contemporáneos)
- Arquitectura escalable (React + TypeScript)
- Análisis de datos financieros (Python + Pandas — próximamente)
- Inteligencia artificial responsable (Gemini — próximamente)
- Aplicación web responsive y app Android nativa

---

## 🧱 Stack tecnológico

| Capa | Tecnología | Estado |
|------|-----------|--------|
| Frontend | React + TypeScript | ✅ Implementado |
| Estilos | CSS variables + sistema de temas | ✅ Implementado |
| Moneda base | COP (peso colombiano) | ✅ Implementado |
| Idioma | Español (Colombia) | ✅ Implementado |
| Temas | Oscuro / Claro con persistencia | ✅ Implementado |
| Backend | Firebase (Auth + Firestore) | ⏳ Fase 02 |
| Analítica | Python + Pandas + NumPy | ⏳ Fase 03 |
| IA | Gemini API | ⏳ Fase 04 |
| Mobile | Kotlin + Jetpack Compose | ⏳ Fase 05 |
| Deploy | Cloud Run + dominio propio | ⏳ Fase 06 |

---

## 📂 Estructura del proyecto
nova-finance/
├── src/
│ ├── components/
│ │ └── common/ # Componentes reutilizables
│ ├── views/ # Vistas por sección
│ ├── context/ # Contextos (tema, etc.)
│ ├── data/ # Datos mock y copy
│ ├── types/ # Tipos y contratos TypeScript
│ ├── App.tsx # Orquestador de rutas
│ └── index.css # Sistema de diseño
├── index.html
└── package.json


---

## 🚀 Cómo ejecutar el proyecto

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build

🗺️ Roadmap
v0.1 — Fundación ✅ UI, navegación, sistema de diseño, COP, español

v0.2 — Autenticación ⏳ Firebase Auth + Firestore

v0.3 — Movimientos reales ⏳ CRUD persistente

v0.4 — Analítica ⏳ Python + Pandas

v0.5 — IA ⏳ Gemini Insights

v0.6 — Android ⏳ Kotlin + Compose

v1.0 — Producción ⏳ Deploy público

👤 Autor
Gabriel Múnera
Proyecto personal de ingeniería y ciencias de datos.
Colombia, 2026.
