# Feria — Marketplace v2

Marketplace multi-vendedor con:
- **Diseño personalizable por tienda**: cada vendedor elige una paleta de colores y escribe el texto de su portada.
- **Datos persistentes de verdad**: usa Netlify Blobs (incluido gratis en tu cuenta de Netlify), así que los productos y tiendas no se pierden al recargar.
- **Tienda pública**: cada tienda tiene su propia URL (`/t/nombre-de-la-tienda`) que podés compartir con compradores.

## Estructura

- `/` → panel general (lista de tiendas, crear tienda nueva)
- `/tienda/:id` → panel del vendedor (cargar productos + editar diseño)
- `/t/:slug` → tienda pública, la que ve el comprador

## Desplegar

1. Sube todo el contenido de esta carpeta a tu repositorio de GitHub (reemplazando lo que había antes).
2. En Netlify, si ya tenías el sitio conectado, un nuevo push a `main` dispara un redeploy automático. Si es la primera vez, importa el repo igual que antes.
3. Netlify detecta la función en `netlify/functions/data.js` automáticamente y habilita Netlify Blobs sin configuración extra.

## Nota importante

Netlify Blobs funciona automáticamente en producción (una vez desplegado en Netlify), pero no funciona si corrés el proyecto en tu computador con `npm run dev` sin la CLI de Netlify. Para ver la persistencia real, probá directo en la URL de Netlify una vez desplegado.
