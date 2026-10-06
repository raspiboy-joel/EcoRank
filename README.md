# ♻️ EcoRank

**Plataforma web del basurero inteligente.** Cada estudiante genera un **código QR permanente**. Al reciclar, escanea su QR en el lector del basurero, **selecciona manualmente el tipo de residuo** (🟢 plástico, 🟤 papel y cartón, 🟠 orgánico), lo deposita en el compartimiento correspondiente y el sistema **suma sus puntos automáticamente**. Un ranking individual en vivo motiva la competencia sana dentro del salón.

Construido con **React + Vite + Tailwind** (frontend) y **Express + SQLite** (backend).

## ✨ Funciones

- 🪪 Registro con nombre, número de lista y **salón** (el estudiante lo escribe manualmente, ej: "10° A") → QR permanente (descargable e imprimible).
- 🆔 **UUID permanente** por estudiante: es la referencia principal que relaciona toda su información (perfil, historial, estadísticas) y la que usan los dispositivos externos al leer el QR.
- 🗒️ **Historial de reciclajes** (tabla `reciclajes`): cada identificación por QR genera un registro nuevo, del que salen la cantidad real de reciclajes, los gráficos personales y las estadísticas.
- 🏆 **Ranking individual**: podio 🥇🥈🥉, buscador, filtro por salón, 4 ordenamientos y animaciones al cambiar de posición.
- 🌍 **Dashboard de Impacto Ambiental**: estadísticas generales, tarjetas por categoría con porcentajes, y gráficos (Chart.js) circular, de barras y de evolución de 14 días.
- 🏅 **Sistema de logros**: 5 insignias que se desbloquean en el perfil.
- 👤 **Perfil mejorado**: avatar con iniciales, salón, gráfico personal, logros e historial.
- 🌐 **Bilingüe (🇪🇸/🇺🇸)** con i18next — preparado para más idiomas (`client/src/i18n/`).
- 🌙 **Modo claro/oscuro** con memoria en LocalStorage y transiciones suaves.
- 🛠️ **Panel admin**: estadísticas, ver/editar el salón de cada estudiante, **filtrar por salón**, modificar puntos, eliminar, reiniciar ranking y exportar **CSV, Excel y PDF** (el salón va incluido en los tres formatos).

> ℹ️ Esta versión se usa en **un solo salón de clases**: no hay ranking ni competencia entre salones. El campo salón se almacena únicamente para dejar el sistema **preparado para expandirse** a otros salones o a toda la escuela.

## 🚀 Cómo ejecutar el proyecto

Necesitas **Node.js 18 o superior**.

### Opción A — Un solo comando (recomendada)

```bash
# 1. Instalar todo (solo la primera vez)
npm run install-all

# 2. Iniciar servidor + web al mismo tiempo
npm run dev
```

### Opción B — Dos terminales

```bash
# Terminal 1: el servidor (API + base de datos)
cd server
npm install
npm run dev        # → http://localhost:3001

# Terminal 2: la página web
cd client
npm install
npm run dev        # → http://localhost:5173
```

Abre **http://localhost:5173** en el navegador.

> 💡 **Datos de ejemplo para demostraciones** (feria, presentación):
> `npm run seed` crea 16 estudiantes con reciclajes de los últimos 14 días.
> Para empezar de cero, borra `server/database/ecorank.db` o usa "Reiniciar ranking" en el admin.

### Modo producción (todo en un solo puerto)

```bash
cd client && npm run build   # genera client/dist
cd ../server && npm start    # sirve API + web en http://localhost:3001
```

## 🔐 Panel de administrador

- Entra desde el enlace **Admin** del pie de página (`/admin`).
- Contraseña por defecto: **`ecorank123`**.
- Para cambiarla sin tocar código: `ADMIN_PASSWORD=miClave npm run dev` (dentro de `/server`).

## 🗂️ Categorías y puntos

| Tipo | Ejemplos | Puntos |
|---|---|---|
| 🟢 Plástico | Botellas, tapas, envases | **10** |
| 🟤 Papel y Cartón | Hojas, cajas, cuadernos | **8** |
| 🟠 Orgánico | Restos de comida, frutas, vegetales | **5** |

Solo estas tres categorías son válidas (se definen en `server/config.js`). Cualquier otro material es rechazado por la API para mantener limpias las estadísticas.

## 📡 API REST — Raspberry Pi y lectura automática de QR

El sistema está preparado para recibir reciclajes desde dispositivos externos (una **Raspberry Pi con cámara web** y sensores del basurero). Flujo esperado:

1. La Raspberry Pi lee el QR del estudiante con la cámara.
2. Obtiene su identificador único.
3. Envía el **UUID** a la API del sistema.
4. La API busca al estudiante correspondiente.
5. Se registra un nuevo reciclaje en el historial.
6. Se actualizan los puntos automáticamente y se responde con la confirmación y las estadísticas.

### `POST /api/recycle`

```json
{ "uuid": "xxxxxxxx-xxxx-xxxx-xxxx", "material": "plastico" }
```

- La identificación es **por UUID** (nunca por nombre ni número de lista). Por compatibilidad también se acepta `studentId` con el id legible (`ecorank-00024`) o el **contenido completo del QR** (`{"id":"ecorank-00024"}`): la API lo resuelve sola al estudiante y a su UUID.
- `material` acepta: `plastico`, `papel`, `organico` (con tildes/mayúsculas y sinónimos en inglés). Los puntos se asignan solos; un material fuera de las 3 categorías responde `400`.

Respuesta:

```json
{
  "ok": true,
  "mensaje": "♻️ Reciclaje registrado: +10 puntos para Ana Pérez (plastico).",
  "puntos_obtenidos": 10,
  "estudiante": {
    "uuid": "xxxxxxxx-...", "id": "ecorank-00024", "nombre": "Ana Pérez",
    "salon": "10° A", "puntos": 120, "total_reciclajes": 13, "posicion": 2
  }
}
```

### 🔐 Endpoint seguro (opcional)

Define la variable `DEVICE_API_KEY` al iniciar el servidor y el dispositivo deberá enviar esa clave en el header `x-api-key`:

```bash
DEVICE_API_KEY=miClaveDelBasurero npm run dev
```

Sin la variable, el endpoint queda abierto (útil durante el desarrollo en la red local).

Ejemplo en Python (Raspberry Pi):

```python
import requests

API = "http://IP_DEL_SERVIDOR:3001/api/recycle"
CLAVE = "miClaveDelBasurero"  # la misma DEVICE_API_KEY del servidor

def registrar_reciclaje(uuid_estudiante, material_seleccionado):
    """Se llama cuando la cámara leyó el QR y se identificó al estudiante."""
    r = requests.post(
        API,
        json={"uuid": uuid_estudiante, "material": material_seleccionado},
        headers={"x-api-key": CLAVE},
        timeout=5,
    )
    print(r.json())
```

### Resto de endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/students` | Registrar (nombre, numero_lista, **salon** manual) → QR + UUID permanentes |
| `GET` | `/api/students` | Lista de estudiantes |
| `GET` | `/api/ranking` | Ranking individual (incluye salón y posición) |
| `GET` | `/api/stats` | 🌍 Estadísticas: generales, por categoría y evolución 14 días |
| `GET` | `/api/student/:id` | Perfil: posición, resumen por material, total de reciclajes e historial |
| `GET` | `/api/health` | ¿Está vivo el servidor? |
| `POST` | `/api/admin/login` | Verificar contraseña |
| `GET` | `/api/admin/students` | 🔐 Lista completa (uuid, qr_data, reciclajes) |
| `PUT` | `/api/admin/student/:id` | 🔐 Editar nombre, lista, **salón** y puntos (el QR y el UUID nunca cambian) |
| `DELETE` | `/api/admin/student/:id` | 🔐 Eliminar estudiante |
| `POST` | `/api/admin/reset` | 🔐 Reiniciar ranking |
| `GET` | `/api/admin/export` | 🔐 Exportar CSV |

Las rutas 🔐 requieren el header `x-admin-password`.

## 📁 Estructura del proyecto

```
ecorank/
├── server/                  # Backend (Express + SQLite)
│   ├── index.js             # Arranque del servidor
│   ├── config.js            # ⚙️ Categorías oficiales y validación del salón
│   ├── seed.js              # Datos de ejemplo para demos (npm run seed)
│   ├── database/db.js       # Esquema de la base de datos
│   ├── controllers/         # Lógica: estudiantes, reciclaje, stats, admin
│   ├── routes/              # Declaración de rutas de la API
│   └── middleware/          # Protección del panel admin
└── client/                  # Frontend (React + Vite + Tailwind)
    └── src/
        ├── i18n/            # 🌐 es.json / en.json (+ instrucciones para más idiomas)
        ├── context/         # 🌙 Tema claro/oscuro
        ├── utils/           # Constantes, logros, configuración de Chart.js
        ├── components/      # Navbar, QRCard, StatCard, Avatar, Insignias...
        └── pages/           # Home, ComoUsar, Registro, Ranking, Impacto, Perfil, Admin
```

## 🗄️ Base de datos

SQLite en un solo archivo (`server/database/ecorank.db`), creado automáticamente.

- **estudiantes**: `id` (va en el QR), **`uuid`** (identificador único permanente, referencia principal del sistema), `nombre`, `numero_lista`, **`salon`**, `qr_data`, `puntos`, `fecha_registro`.
- **reciclajes**: historial de actividad → `id`, **`uuid_estudiante`**, `material`, **`puntos_obtenidos`**, `fecha`. Cada identificación por QR crea una fila nueva; de aquí salen la cantidad real de reciclajes, los gráficos personales, las estadísticas y el registro completo de actividad.

> 🔄 Si tienes una base de datos de una versión anterior (historial con `estudiante_id`), el servidor la **migra automáticamente** al nuevo formato al arrancar, sin perder datos.

Notas de diseño:

- El QR **no contiene el nombre**, solo el identificador único (evita duplicados y falsificaciones).
- Registrarse dos veces con el mismo nombre y número de lista devuelve **el mismo QR de siempre**.
- El salón es texto libre escrito por el estudiante (máx. 30 caracteres); el admin puede corregirlo si alguien se equivocó.
- El **UUID nunca cambia**: aunque el admin edite nombre, lista o salón, el QR y el UUID siguen siendo los mismos.

## 🧩 Preparado para el futuro

- **Más salones o toda la escuela**: el salón ya se guarda con cada estudiante y el admin puede filtrar por salón; activar rankings entre salones en el futuro solo requiere agregar las vistas.
- **Basurero inteligente**: la API por UUID ya está lista para integrarse con la Raspberry Pi, la cámara web y los sensores.
- **Más idiomas**: instrucciones paso a paso en `client/src/i18n/index.js`.
- **Más logros**: agrega la regla en `client/src/utils/logros.js` y sus textos en los diccionarios.
- **Base de datos**: SQLite puede migrarse a MySQL/PostgreSQL sin cambiar la lógica.
