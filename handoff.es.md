# Documentación de Entrega del Proyecto: Hojas de Producto y Manual de Usuario de Morpheus

¡Bienvenido/a! Este espacio de trabajo contiene la documentación de producto de alta gama, responsiva y lista para impresión de las luminarias de acento inteligente Morpheus de Dauer Manufacturing (Uplight y Downlight) y el Manual de Usuario de Morpheus.

---

## 1. Visión General del Sistema y Arquitectura

El espacio de trabajo consta de un portal principal de aterrizaje, tres páginas de documento, dos hojas de estilo personalizadas y un script de compilación:

### Portal Principal y Hojas
* **[index.html](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/index.html)**: El portal principal que enlaza a las hojas de especificaciones y al manual de usuario. Incluye el widget de animación KLE Reveal integrado y responsivo.
* **[spec-sheets - 1/uplight.html](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/uplight.html)**: La hoja de especificaciones y pedidos para la luminaria Morpheus Smart Uplight.
* **[spec-sheets - 1/downlight.html](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/downlight.html)**: La hoja de especificaciones y pedidos para la luminaria Morpheus Smart Downlight.
* **[spec-sheets - 1/manual.html](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/manual.html)**: El Manual de Usuario de Morpheus compilado, de 11 páginas, responsivo y listo para imprimir.

### Hojas de Estilo
* **[assets/spec-sheet.css](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/assets/spec-sheet.css)**: Contiene el reset, encabezado de navegación, sistemas de grillas y parámetros de impresión compartidos por las hojas de especificaciones de Uplight y Downlight.
* **[assets/manual.css](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/assets/manual.css)**: Contiene sobreescrituras personalizadas específicamente adaptadas para el diseño del Manual de Usuario, paginación, grillas de impresión y espaciados.

### Compilación / Pipeline de Build
* **[spec-sheets - 1/manual-clean.html](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/manual-clean.html)**: El documento HTML fuente del Manual de Usuario. **No edites `manual.html` directamente** para cambios de contenido; realiza los cambios aquí.
* **[spec-sheets - 1/build_manual.js](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/build_manual.js)**: Script compilador en Node.js. Ejecuta `node build_manual.js` para compilar y generar el `manual.html` final.

---

## 2. Logros Clave y Resoluciones

1. **Base de Código Limpia (Eliminación de QR en Base64)**:
   * **Problema**: El HTML crudo estaba inflado (200KB+) con vectores SVG codificados en URL incrustados para los códigos QR de los capítulos.
   * **Solución**: Se reemplazaron las referencias en base64 por enlaces de ruta que apuntan directamente a recursos vectoriales locales: `assets/img/manual/qr-cX.svg`. El tamaño del archivo HTML compilado ahora es de **40KB** y es legible para humanos.

2. **Diseño y Espaciado Unificados**:
   * **Pestañas de resumen de acordeón ocultas en escritorio**: Se eliminaron las barras grises de acordeón (`.sheet-section__summary`) en pantallas `>= 900px` para todas las páginas. Ahora se renderizan como hojas apiladas con sombras de papel, desplazándose fluidamente como una vista previa de impresión en PDF.
   * **Consistencia en el espacio entre hojas**: Se sincronizaron los espacios entre hojas en Uplight, Downlight y el Manual a `0.4in` para pantallas de escritorio.

3. **Correcciones de Márgenes en Portada (Pág. 1) y Especificaciones (Pág. 3)**:
   * **Problema**: Al imprimir, la parte inferior de la Página 1 (dibujo de dimensiones) y la Página 3 (grilla de montajes e imágenes de accesorios) se desbordaban y chocaban con las líneas del pie de página.
   * **Solución**: Se estableció un límite de `max-height: 1.05in` en el dibujo de dimensiones. Se redujeron las imágenes de accesorios de la Página 3 a `70px` x `50px`, se ajustaron los paddings de las celdas de tabla a `3.5px` y se redujeron los encabezados de sección.

4. **Correcciones de Desbordamiento del Viewport en Móvil**:
   * **Problema**: Los grandes tamaños de padding, las propiedades de la imagen de portada (ancho forzado inline `width: 340px`), los elementos del encabezado de información y los contenedores del pie con QR causaban desplazamiento horizontal en puntos de quiebre móviles.
   * **Solución**: Se eliminaron los anchos inline de las imágenes, se ocultó el botón de acción de impresión por debajo de `< 480px`, se apilaron verticalmente los layouts de información y se redujeron los márgenes del viewport para adaptarse limpiamente a anchos de hasta `320px`.

5. **Desplazamiento con Separación Precisa**:
   * **Problema**: Al saltar a anclas de capítulo o tema, el contenido quedaba oculto bajo la barra de navegación fija, cortando los títulos.
   * **Solución**: Se configuraron todas las clases e IDs de destino (`.sheet-section`, `.chapter-lead-card`, `.topic-row`, `#beam-angle`, `#ordering-info`) con `scroll-margin-top: 86px` para mantener una separación limpia bajo el encabezado.

6. **Páginas Ampliadas en Móvil y Botón de Regreso (Solo Manual)**:
   * **Problema**: Los acordeones colapsables en móvil obligaban a abrir pestañas una por una, reduciendo la legibilidad del manual.
   * **Solución**: Se modificó `build_manual.js` para compilar las hojas del manual dentro de contenedores `div` simples en lugar de acordeones `<details>`. En móvil, las páginas quedan abiertas por defecto. Se añadió un botón flotante fijo para volver al TOC (`.floating-toc-btn`) con `opacity: 0.4` en la esquina inferior derecha para navegación rápida.

7. **Reversión del Tamaño de las Hojas del Manual**:
   * **Problema**: Redimensionar las hojas del manual al `90%` del ancho en escritorio provocó desalineaciones respecto a Uplight y Downlight.
   * **Solución**: Se restauraron los tamaños de hoja del manual en escritorio para que coincidan con Uplight y Downlight (`width: 8.5in !important` y `height: 11in !important`), preservando exactamente los límites de vista previa de tamaño carta.

8. **Sincronización de Tablas de Ángulo de Haz**:
   * **Problema**: Los valores de la tabla "Ángulo de Haz y Salida de Lúmenes" en `uplight.html` y `downlight.html` no coincidían con los valores maestros definidos en `manual.html`.
   * **Solución**: Se mapearon los valores de la tabla desde `manual.html` a ambas hojas de especificaciones. Dado que el diseño de columnas difiere (con columnas de corriente y salida desplazadas), los valores se asignaron columna por columna. También se actualizó la potencia de cálculo de carga a `32.28 VA` para mantener consistencia matemática.

9. **Sincronización de Características Inteligentes (Pág. 4)**:
   * **Problema**: Los títulos, descripciones y enlaces de video de las tarjetas de características en la página 4 divergían entre `uplight.html` y `downlight.html`.
   * **Solución**: Se sincronizaron todas las tarjetas de características en la página 4 de `downlight.html` (por ejemplo, Optics, Dimming y Scenes: URLs de video y descripciones) para que coincidan con las ediciones realizadas en `uplight.html`.

10. **Optimización de la Animación KLE e Integración en el Portal**:
    * **Problema**: La página independiente de la animación "KLE Reveal" estaba muy inflada (258KB) debido a recursos de imagen base64 `588x588` y paquetes de fuentes woff2 incrustados en el manifiesto de la página.
    * **Solución**: Se redimensionó el recurso de imagen de la cabeza del luminario a su tamaño real de renderizado (`44x44` píxeles, reduciéndolo de 98KB a 3.9KB) y se reemplazaron las fuentes base64 por una importación desde Google Fonts CDN. Esto redujo el tamaño de la página independiente a **16KB** (una **reducción del 93.7%**). Luego, la animación optimizada se incrustó como una tarjeta oscura premium directamente en [index.html](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/index.html).

11. **Ajuste de Imágenes de Tarjetas (index.html)**:
    * **Problema**: Las imágenes hero de los luminarios en las tarjetas del portal se recortaban y quedaban partes fuera de cuadro.
    * **Solución**: Se configuraron las imágenes de las tarjetas de documento (`.doc-card__image`) para usar `object-fit: contain` y evitar cualquier recorte.

12. **Ajustes de Visibilidad Solo en Impresión**:
    * **Problema**: El botón flotante de impresión en el manual seguía siendo visible en las copias impresas.
    * **Solución**: Se configuraron las hojas de estilo de impresión para ocultar completamente el botón de acción flotante (`@media print { .print-button { display: none !important; } }`) y mantener las páginas impresas limpias.

13. **Restricción de Tamaño de Fuente Mínimo**:
    * **Problema**: Los pies de figura y subtextos estaban configurados demasiado pequeños en pantalla (6.5px), lo cual era ilegible.
    * **Solución**: Se impuso un umbral mínimo de 8px para vistas en pantalla (por ejemplo, en `.figure-cell_caption` y subpies), sin alterar las propiedades del diseño en medios de impresión físicos.

---

## 3. Guías para Desarrolladores y Lecciones Aprendidas

> [!IMPORTANT]
> **Modificaciones de Contenido**: 
> Realiza siempre las actualizaciones de contenido/diseño del manual dentro de [manual-clean.html](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/manual-clean.html). Una vez completadas, ejecuta el script de compilación dentro del directorio `spec-sheets`:
> ```bash
> node build_manual.js
> ```

> [!IMPORTANT]
> **Seguridad en Compilación con Regex**:
> Al editar encabezados o etiquetas estructurales en `manual-clean.html`, ten en cuenta que el script de compilación [build_manual.js](file:///Users/dannysanchez/Temp%20Share%20Repo/misc-file-staging/spec-sheets%20-%201/build_manual.js) usa patrones de reemplazo con expresiones regulares. Asegúrate de que los reemplazos soporten espacios variables (`\s*`) y elementos de cierre, ya que cambios de formato menores pueden provocar desajustes en las regex.

> [!TIP]
> **Mapeo de Tablas**:
> Al sincronizar valores de tablas entre hojas de especificaciones y el manual, no asumas índices de columna idénticos. Revisa cuidadosamente los encabezados (por ejemplo, `Delivered Lumens @ 50%` vs `Output ~32%` en niveles de corriente).

> [!TIP]
> **Sincronización de Layout e Impresión**:
> Para asegurar que la visualización en pantalla y la salida impresa permanezcan perfectamente sincronizadas, escribe el CSS de alcance global en `assets/spec-sheet.css` o `assets/manual.css`, y usa sobreescrituras específicas de impresión dentro de los bloques `@media print` solo cuando escales elementos a los límites físicos de la página.
