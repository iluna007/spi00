# Fuentes

Coloca aquí las fuentes que quieras usar en la app.

La app está configurada para usar **IBM BIOS** (o fuentes del Oldschool PC Font Pack):

- Opción 1: Archivos sueltos en esta carpeta:
  - `IBM_BIOS.woff2` o `IBM_BIOS.woff` o `IBM_BIOS.ttf`

- Opción 2: Si usas el [Oldschool PC Font Pack](https://int10h.org/oldschool-pc-fonts/), descomprime el pack y deja la carpeta `oldschool_pc_font_pack_v2.2_web` aquí, o ajusta la ruta en `src/index.css` (variable `--font-app` y `@font-face`).

Cualquier fuente en `public/fonts` puede referenciarse en CSS con `url('/fonts/nombre.woff2')`.
