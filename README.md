# Criollo Drones
Herramienta para el calculo de parametros operativos de drones agricolas y la generacion de reportes de aplicacion.

## Objetivo
Apoyar la planificacion y el control de labores de pulverizacion con drones, centralizando calculos, validaciones y reportes en una sola aplicacion.

## Funcionalidades principales
- Definicion de parametros de aplicacion y pulverizacion.
- Control de prestacion y verificacion de picos.
- Calculo de volumen de aplicacion y velocidad de trabajo.
- Calculo de peso recolectado.
- Gestion de insumos y listas de insumos.
- Generacion y detalle de reportes.
- Exportacion de reportes a PDF y opcion de compartir (en plataformas nativas).

## Tecnologias
- React 18 + Vite
- Framework7 (UI)
- Capacitor (integracion nativa)
- pdfmake (reportes PDF)
- recharts (graficos)
- Playwright (tests E2E)
- Vitest (tests unitarios)

## Requisitos
- Node.js (version LTS recomendada)
- npm

## Instalacion
```bash
npm install
```

## Scripts utiles
- `npm run dev`: inicia el entorno de desarrollo.
- `npm run build`: genera el build de produccion.
- `npm run preview`: previsualiza el build.
- `npm run test:unit`: ejecuta pruebas unitarias.
- `npm run test:ui`: ejecuta pruebas E2E en Chromium.
- `npm run playwright`: abre el generador de pruebas de Playwright.

Nota: el script `postinstall` ajusta el archivo de Gradle de `@capacitor-community/keep-awake` para compatibilidad con Android.

## Estructura del proyecto
- `src/App.jsx`: configuracion general de Framework7 y rutas de la app.
- `src/views/`: pantallas principales (Home, Params, Control, Volume, Velocity, Reports, etc.).
- `src/components/`: componentes reutilizables (tablas, selectores, sliders, etc.).
- `src/context/`: contexto y modelo de estado de la aplicacion.
- `src/entities/`: logica de dominio (API, Model, PDF, Timer).
- `src/data/`: datos base (picos, tamanos de gota, etc.).

## Reportes
Los reportes se generan con `pdfmake` e incluyen parametros de aplicacion, verificaciones, resultados y resumenes. En plataformas nativas, se soporta guardado y compartido mediante Capacitor.

## Trabajo con Capacitor (opcional)
Si necesitas compilar para Android/iOS:
1. Construye el proyecto web: `npm run build`
2. Sincroniza con Capacitor: `npx cap sync`
3. Abre el proyecto nativo: `npx cap open android`

## Pruebas
- Unitarias: `npm run test:unit`
- E2E (Chromium): `npm run test:ui`

## Notas
- La configuracion principal de Capacitor esta en `capacitor.config.ts`.
- La app esta pensada para funcionar tanto en web como en entornos nativos.
