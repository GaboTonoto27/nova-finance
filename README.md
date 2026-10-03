# NOVA — Personal Finance Intelligence

Aplicación de finanzas personales enfocada en jóvenes colombianos, construida como proyecto de ingeniería que integra desarrollo full-stack, análisis de datos e inteligencia artificial.

> **Estado actual:** v0.4.5.5 — Saldo inicial con período configurable, sistema de intentos (3/periodo) e historial de cambios. Aviso proactivo y botón "Deshacer" en desarrollo.

---

## 🎯 Visión

NOVA busca transformar la manera en que un joven administra su dinero, combinando:

- Interfaz moderna y humana (inspirada en productos fintech contemporáneos)
- Arquitectura escalable (React + TypeScript + Firebase)
- Análisis de datos financieros (Python + Pandas — próximamente)
- Inteligencia artificial responsable (Gemini — próximamente)
- Aplicación web responsive y app Android nativa

---

## 🧱 Stack tecnológico

| Capa | Tecnología | Estado |
|---|---|---|
| Frontend | React 18 + TypeScript | ✅ Implementado |
| Estilos | Tailwind CSS 4 + CSS variables | ✅ Implementado |
| Moneda base | COP (peso colombiano) | ✅ Implementado |
| Idioma | Español (Colombia) | ✅ Implementado |
| Temas | Oscuro / Claro con persistencia | ✅ Implementado |
| Backend | Firebase Auth + Firestore | ✅ Implementado |
| Animaciones | Motion (Framer Motion) | ✅ Implementado |
| Iconos | Lucide React | ✅ Implementado |
| Analítica | Python + Pandas + NumPy | ⏳ Próximamente |
| IA | Gemini API | ⏳ Próximamente |
| Mobile | Kotlin + Jetpack Compose | ⏳ Próximamente |
| Deploy | Cloud Run + dominio propio | ⏳ Próximamente |

---

## 📂 Estructura del proyecto
nova-finance/
├── src/
│ ├── components/common/ # Componentes reutilizables
│ ├── context/ # Contextos globales (Auth, Theme, Alert)
│ ├── data/ # Datos estáticos y copy
│ ├── firebase/ # Servicios de Firestore
│ ├── hooks/ # Custom hooks
│ ├── types/ # Contratos TypeScript
│ ├── utils/ # Utilidades puras
│ ├── views/ # Vistas por sección
│ ├── App.tsx # Orquestador de rutas
│ └── index.css # Sistema de diseño
├── firestore.rules # Reglas de seguridad
├── index.html
└── package.json

---

## 🚀 Cómo ejecutar el proyecto

```bash
# Instalar dependencias (usar --legacy-peer-deps si hay conflicto)
npm install --legacy-peer-deps

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build

# Verificar tipos
npm run lint

🗺️ Roadmap
✅ v0.1 — Fundación: UI, navegación, sistema de diseño, COP, español

✅ v0.2 — Autenticación: Firebase Auth (login, registro, recuperación)

✅ v0.3 — Movimientos reales: CRUD transacciones, presupuestos y metas en Firestore

✅ v0.4 — Datos avanzados: categorías personalizadas, intentos de saldo

⏳ v0.4.5.5 — Aviso proactivo + botón "Deshacer" con memoria local

⏳ v0.4.6 — Responsive + PWA

⏳ v0.4.7 — CRUD movimientos (refinamiento)

⏳ v0.4.8 — CRUD tarjetas

⏳ v0.5 — Ciencia de datos (Python + Pandas)

⏳ v0.6 — IA (Gemini Insights)

⏳ v0.7 — Android (Kotlin + Compose)

⏳ v1.0 — Producción (deploy + dominio)

🔒 Nota de seguridad
npm audit reporta 4 vulnerabilidades high provenientes de la dependencia transitiva @grpc/grpc-js incluida dentro de firebase@11.x.

Análisis:

No es una vulnerabilidad introducida por NOVA.

No es explotable en la arquitectura actual (Firestore usa HTTPS vía SDK oficial, no gRPC directo).

El fix oficial requiere degradar Firebase de v11 a v9, lo cual rompería autenticación y acceso a datos.

La vulnerabilidad afecta configuraciones avanzadas de servidores gRPC con mTLS, que NOVA no utiliza.

Decisión: Se documenta y se espera el fix oficial de Google. Se revisará periódicamente.

👤 Autor
Gabriel Múnera
Proyecto personal de ingeniería y ciencias de datos.
Colombia, 2026.
