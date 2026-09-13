# SINERGIA Ocupacional

Migración de sinergiaocupacional.com a **Astro + PocketBase**.

## Stack

- [Astro](https://astro.build) — sitio estático de una sola página (landing)
- [Tailwind CSS](https://tailwindcss.com) — estilos, replicando el diseño original
- [PocketBase](https://pocketbase.io) — contenido del sitio (servicios, cursos, equipo, clientes…) y almacenamiento de los mensajes del formulario de contacto

> **Requisito:** PocketBase **>= 0.23** (se recomienda la última versión). El seed script y
> la migración usan `_superusers`, `@request.body` en las reglas y la colección única
> `settings`, que solo existen en esa versión en adelante.

## Contenido y fuente de datos

Todo el contenido del sitio vive en colecciones de PocketBase. En `src/lib/site-content.ts`
está la copia completa del contenido del sitio actual como *fallback*: si `PUBLIC_POCKETBASE_URL`
no está configurada o PocketBase no responde, el sitio se compila con ese contenido embebido.
En `src/lib/content.ts` está el cargador que, en tiempo de build, lee las colecciones y solo
usa el contenido estático cuando algo falla.

### Colecciones

| Colección    | Uso                                                                  |
| ------------ | -------------------------------------------------------------------- |
| `settings`   | Registro único: teléfonos, email, dirección, videos, mapa y las imágenes del sitio (logo, favicon, fondo de portada, fotos de "Sobre Nosotros") |
| `techniques` | Las 3 técnicas de enseñanza de la sección "Sobre Nosotros"            |
| `services`   | Los 3 servicios                                                       |
| `courses`    | Cursos del portafolio (con imagen)                                    |
| `team`       | Miembros del equipo (con foto)                                        |
| `clients`    | Clientes (con logo)                                                   |
| `why_items`  | Frases de los 3 carruseles de "Porque elegirnos"                      |
| `counters`   | Contadores animados                                                   |
| `messages`   | Mensajes del formulario de contacto (creación pública, lectura solo admin) |

Las colecciones de contenido son de **lectura pública** (`id != ""`), `messages` solo admite
creación pública con los campos limitados y su lectura es exclusiva del administrador.

Todas las imágenes del sitio (logo, favicon, fondo del hero, fotos de «Sobre Nosotros»,
cursos, equipo y logos de clientes) se sirven desde los campos `file` de PocketBase;
los iconos de sección son SVGs de Font Awesome embebidos en `src/lib/icon-paths.ts`.

## Configuración

1. `cp .env.example .env`
2. Llene `PUBLIC_POCKETBASE_URL` con la URL de su instancia.
3. (Solo para sembrar datos) `POCKETBASE_ADMIN_EMAIL` y `POCKETBASE_ADMIN_PASSWORD`.

### Crear las colecciones

Opción A — con el script (recomendado): `npm run seed` crea las colecciones si no existen
y además inserta el contenido del sitio. Ejecutar de nuevo solo inserta lo que falte;
use `npm run seed -- --force` para limpiar y volver a sembrar (se conservan las imágenes
que ya suba en el admin).

Opción B — con migraciones: copie `pb_migrations/1700000000_init_collections.js` a la
carpeta `pb_migrations/` de su instancia de PocketBase y reinicie PocketBase. Después
`npm run seed` para poblar los datos.

El email del sitio usa `contacto@sinergiaocupacional.com` como marcador de posición:
cámbielo en `settings` dentro del admin de PocketBase (o en el fallback
`DEFAULT_EMAIL` de `src/lib/site-content.ts`) y recompile.

El seed también sincroniza el esquema de `settings` añadiendo los campos `file`
(`logo`, `favicon`, `hero_bg`, `about_img1`, `about_img2`) si faltan, y sube las
imágenes de cursos, equipo y clientes (ubicadas en `public/images/` y
`public/%5Bimg%5D/`) a registros que aún no tengan ese archivo.

### Formulario de contacto

El formulario se envía directamente a la colección `messages` de PocketBase desde el
navegador (usa `PUBLIC_POCKETBASE_URL`). Los mensajes quedan visibles en el admin de
PocketBase en `messages`.

## Desarrollo

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # sitio estático en dist/
npm run preview    # previsualizar el build
npm run check      # revisión de tipos con astro check
npm run download:assets  # volver a descargar las imágenes del sitio original
```

## Despliegue

El sitio es 100 % estático; súbalo a Netlify, Vercel, Cloudflare Pages u otro host
estático. En el host defina `PUBLIC_POCKETBASE_URL` como variable de entorno y
recompile para reflejar los cambios de contenido de PocketBase.

## Estructura

```
src/
  layouts/Layout.astro        # head, fuentes, estilos, scripts
  components/                 # secciones de la página
  lib/
    site-content.ts           # tipos + contenido de respaldo del sitio actual
    content.ts                # cargador de contenido (PocketBase + fallback)
    pocketbase.ts             # cliente de PocketBase
  pages/index.astro           # página principal
  scripts/main.js             # carrusel, contadores, menú móvil, modal, form
  styles/global.css           # tema Tailwind (colores/fuentes del diseño original)
scripts/
  seed-pocketbase.ts          # crea colecciones y siembra contenido
  download-assets.sh          # descarga imágenes de sinergiaocupacional.com
pb_migrations/                # migración de colecciones para PocketBase
public/                       # imágenes, favicon
```

## Colores / fuentes del diseño original

- Primario: `#157eb3`, oscuro `#105e85`, hover `#0d4e6f`
- Encabezados: `#283d50`, textos: `#556877`, fondo de sección: `#ecf5ff`
- Acento dorado (portafolio): `#fed136`
- Tipografías: **Montserrat** (títulos) y **Open Sans** (texto)