# hernandezsilva

Aplicación web para la gestión de pacientes, doctores y citas de una clínica,
desarrollada para el módulo de Desarrollo de Interfaces Web.

Frontend en **Vue 3** con **Vue Router** y **Pinia**, estilos en CSS personalizado,
backend en **Express** y persistencia en **MongoDB** mediante **Mongoose**.
El empaquetado se hace con **Vite**.

## Requisitos

- Node.js 20 o superior
- Docker (para levantar MongoDB en local)

## Puesta en marcha

1. Instalar las dependencias:

   ```bash
   npm install
   ```

2. Copiar `.env.example` a `.env` y rellenar los valores:

   ```bash
   copy .env.example .env
   ```

3. Levantar la base de datos:

   ```bash
   docker compose up -d
   ```

4. Arrancar el frontend y el backend a la vez:

   ```bash
   npm start
   ```

El frontend queda en `http://localhost:5173` y la API en `http://localhost:3000`.

> El servidor Express lee `backend/data/municipios.json` y
> `backend/data/especialidades.json` con una ruta relativa al directorio de
> trabajo, por lo que `npm start` debe ejecutarse siempre desde la raíz del
> proyecto.

## Scripts disponibles

| Script | Descripción |
| --- | --- |
| `npm start` | Arranca Vite y el servidor Express a la vez |
| `npm run dev` | Arranca solo el servidor de desarrollo de Vite |
| `npm run build` | Genera la versión de producción en `dist/` |
| `npm run preview` | Sirve localmente la versión de producción |
| `npm run lint` | Analiza el código con ESLint |

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `API_URL` | URL base de la API del backend |
| `PORT` | Puerto en el que escucha el servidor Express |
| `MONGO_URI` | Cadena de conexión a MongoDB |

El archivo `.env` **no** se sube al repositorio. Se usa `.env.example` como plantilla.

## Endpoints de la API

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/pacientes` | Listado de pacientes |
| `GET` | `/api/pacientes/:dni` | Paciente por DNI |
| `POST` | `/api/pacientes` | Crear un paciente (DNI normalizado y sin duplicados) |
| `PUT` | `/api/pacientes/:dnipac` | Modificar un paciente |
| `DELETE` | `/api/pacientes/:dnipac` | Eliminar un paciente |
| `GET` | `/api/doctores` | Listado de doctores |
| `GET` | `/api/doctores/:id` | Doctor por `_id` o `iddoc` |
| `POST` | `/api/doctores` | Crear un doctor |
| `PUT` | `/api/doctores/:id` | Modificar un doctor |
| `DELETE` | `/api/doctores/:id` | Eliminar un doctor |
| `GET` | `/api/citas` | Listado de citas, con paciente y doctor ya resueltos |
| `POST` | `/api/citas` | Crear una cita (acepta DNI del paciente e `iddoc` del doctor) |
| `PUT` | `/api/citas/:id` | Modificar una cita |
| `DELETE` | `/api/citas/:id` | Eliminar una cita |
| `GET` | `/api/especialidades` | Especialidades médicas para los formularios |
| `GET` | `/api/municipios` | Provincias y municipios para los formularios |

Las citas guardan referencias a los `_id` del paciente y del doctor, y las rutas
las devuelven ya resueltas con `populate`, para que el frontend reciba los datos
y no solo los identificadores.

## Estructura del proyecto

```
backend/
  data/        municipios.json y especialidades.json
  modelos/     esquemas de Mongoose (Paciente, Doctor, Cita)
  rutas/       rutas de la API
  server.js    servidor Express y conexión a MongoDB
src/
  api/         llamadas a la API con axios
  assets/      imágenes
  components/  componentes Vue
  router/      definición de las rutas de la aplicación
  store/       stores de Pinia (pacientes y doctores)
  utils/       alertas con SweetAlert2 y generación de PDF
  App.vue      layout principal
  main.js      punto de entrada
```

## Rutas de la aplicación

| Ruta | Vista |
| --- | --- |
| `/` | Inicio |
| `/servicios` | Servicios médicos |
| `/xestionpacientes` | Gestión de pacientes |
| `/xestion-doctores` | Gestión de doctores |
| `/xestion-citas` | Gestión de citas |
| `/sobrenos` | Sobre nosotros |
| `/avisolegal` | Aviso legal |
| `/politica-privacidad` | Política de privacidad |
| `*` | Página de error 404 |

## Funcionalidades

- Alta, consulta, modificación y baja de pacientes, doctores y citas.
- Validación de DNI/NIE/CIF con letra de control y validación en tiempo real
  de correo y teléfono.
- Selección de provincia y municipio a partir de `municipios.json`.
- Avisos y confirmaciones con SweetAlert2 (`src/utils/alertas.js`).
- Exportación de las tres listas a PDF con jsPDF (`src/utils/pdf.js`).
- Detección de pacientes duplicados por DNI en el backend (HTTP 409).
