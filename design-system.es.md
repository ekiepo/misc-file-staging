# Dauer Manufacturing: Sistema de Diseño Morpheus y Guía de Migración

Este documento sirve como especificación maestra para el ecosistema de documentación del producto Morpheus de Dauer Manufacturing. Define los tokens del sistema de diseño, los patrones de layout principales y las instrucciones paso a paso para convertir diseños web heredados o hojas de especificaciones impresas en esta identidad digital premium, responsiva y lista para impresión.

---

## 1. Tokens del Sistema de Diseño

Estos tokens representan la fuente de la verdad para la identidad visual de Morpheus. Todos los estilos se definen localmente usando variables personalizadas de CSS para garantizar portabilidad.

### 🎨 Paleta de Colores
Los colores se dividen entre escalas base y mapeos semánticos.

| Variable del Token | Valor Hex | Propósito / Mapeo semántico |
| :--- | :--- | :--- |
| `--dauer-orange-500` | `#f7941d` | **Naranja de Marca (PMS 138C)**. Usado para detalles de acento, enlaces, botones y bordes en foco. |
| `--dauer-orange-600` | `#dd7f0e` | Estado hover más oscuro para interacciones con el naranja de marca. |
| `--dauer-charcoal-950` | `#1c1b1a` | Gris/negro ultrafuerte para encabezados en modo oscuro o widgets KLE. |
| `--dauer-charcoal-900` | `#2b2b2b` | **Gris Profundo (90%K)**. Color primario de texto (tinta) y encabezados oscuros. |
| `--dauer-charcoal-500` | `#6f6f6f` | Carbón atenuado neutro, copias secundarias / etiquetas. |
| `--dauer-charcoal-400` | `#8a8a8a` | Gris claro (40%K), para metadatos o subtítulos secundarios. |
| `--dauer-charcoal-300` | `#9a9a9a` | Placeholders terciarios y elementos de texto inactivos. |
| `--dauer-paper-0` | `#ffffff` | **Base de Hoja**. Blanco puro, usado exclusivamente para las páginas del documento (`.sheet`). |
| `--dauer-paper-50` | `#f1efea` | Neutro cálido ligeramente teñido. Usado para slots de imagen, bordes o alternancia de filas de tabla. |
| `--dauer-paper-100` | `#e2dfd8` | Divisores finos, bordes ligeros y contornos. |
| `--dauer-paper-200` | `#d8d6cf` | **Fondo de Deskpad**. La capa neutra cálida que flota las páginas. |

---

## 2. Estándares Tipográficos
Debido a restricciones de licenciamiento web, el sistema de diseño utiliza sustitutos de alta calidad de Google Fonts que igualan las proporciones de las tipografías de impresión física.

* **Fuente Display (`--font-display`)**: `'Archivo Expanded', Helvetica, Arial, sans-serif` (Sustituto de *HelveticaNeue 73 Bold Extended Oblique*)
* **Fuente de Cuerpo (`--font-body`)**: `'Archivo', Helvetica, Arial, sans-serif` (Sustituto de *HelveticaNeue 63 Medium Extended*)
* **Ajuste para Datos (`--text-data-variant`)**: `tabular-nums` (Impone espaciado uniforme para números en tablas de especificaciones)

### Escala Tipográfica
La jerarquía se especifica en puntos tipográficos (`pt`) para escalado directo en impresión, pero mapea 1-a-1 con píxeles en contextos digitales.

* **Titular de Producto (Hero)**: `46pt` (`--text-display-hero`) - Extra bold / Black (`800` o `900`), todo en mayúsculas.
* **Título de Sección**: `22pt` (`--text-display-lg`) - Bold (`700`), todo en mayúsculas.
* **Encabezado de Subsección**: `13pt` (`--text-display-sm`) - Semibold/Bold (`600` o `700`).
* **Texto de Cuerpo (Por defecto)**: `8pt` (`--text-body-md`) - Regular (`400`). El límite mínimo es **`8px`** en pantallas digitales para preservar la legibilidad.
* **Leyendas / Notas al pie**: `6.5pt` (`--text-caption`) - Color atenuado (`--dauer-charcoal-400`).
* **Etiquetas Eyebrow**: `7.5pt` (`--text-eyebrow-size`), peso `700`, tracking `0.22em`. Siempre en mayúsculas.

---

## 3. Espaciado y Geometría de Página
Cada página del documento simula una hoja impresa estándar, lo que requiere márgenes y estructuras de padding exactos.

* **Ancho de Página de Impresión**: `8.5in` (`--page-size-letter-w`)
* **Alto de Página de Impresión**: `11in` (`--page-size-letter-h`)
* **Margen de Página (Gutter de seguridad)**: `0.5in` (`--page-margin`)
* **Padding de Deskpad**: `0.55in` (`--page-deskpad-padding`) - El espacio entre hojas en escritorio está estrictamente sincronizado a **`0.4in`**.
* **Radios de Esquina**: Mantener esquinas cuadradas. Solo se permiten radios pequeños en esquinas de tarjetas (`4px` / `6px` / `8px`), nunca en forma de pastilla.
* **Sombras**: Las hojas en pantalla flotan con `0 2px 14px rgba(0,0,0,.13)` (`--page-sheet-shadow`).

---

## 4. Patrones de Layout Principales

Para lograr consistencia al convertir código heredado, construye los componentes alrededor de estos patrones estructurales:

### A. Layout de Doble Estado (Pantalla vs. Impresión)
Una piedra angular de este sistema es usar el mismo código HTML fuente para renderizar dos representaciones visuales distintas:

1. **Estado de Pantalla Digital (Escritorio/Tablet)**:
   * Los documentos se renderizan dentro de un contenedor cálido de página (`.deskpad`) que representa el espacio de trabajo físico.
   * Las secciones se apilan unas sobre otras. En estado de pantalla, se comportan como paneles de acordeón interactivos (etiquetas `<details>`).
   * En escritorio (`>= 900px`), los encabezados de acordeón (`.sheet-section__summary`) se ocultan vía CSS y se renderizan como bloques totalmente expandidos.
2. **Estado de Impresión Física (`@media print`)**:
   * Se ocultan colores del deskpad, contenedores de fondo, barras de encabezado y botones de impresión (`display: none !important`).
   * Las páginas quiebran naturalmente usando `page-break-after: always;`.
   * El documento flota sobre la hoja blanca pura con márgenes de `0.5in`.

### B. Campos de Formulario Interactivos (Tipo/Modelo/Proyecto)
Las hojas de especificaciones incluyen bloques de formulario que permiten entrada en pantalla sin afectar el layout de impresión.

* **Elementos Editables**: Usa elementos `<span>` configurados con `contenteditable="plaintext-only"` y `spellcheck="false"`.
* **Prevenir Saltos de Línea**: Evita que la tecla Enter agregue nuevas líneas o envuelva contenido capturando la pulsación: `onkeydown="if(event.key === 'Enter') event.preventDefault()"`.
* **Consistencia de Estilo**: Asegura que los campos tengan `outline: none;` al enfocar, y que el texto se alinee al borde inferior (`border-bottom: 1px solid var(--color-text-primary)`).

### C. Patrón CSS para Campos Escritos
```css
.fill-field__line {
  flex: 1;
  border-bottom: 1px solid var(--color-text-primary);
  height: 14px;
  outline: none;
  font-family: var(--font-body);
  font-size: 0.75rem;
  line-height: 1;
  padding: 0 4px;
  cursor: text;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
}
```

### D. Sección de Demostración en Video
Si presentas videos de hardware o tutoriales, colócalos en un contenedor dedicado al final de la página del portal:

* **Estructura HTML**:
    ```html
    <section class="video-showcase-section">
      <h3 class="video-showcase-section__title">Título de la Demostración</h3>
      <div class="video-container">
        <video class="video-element" controls loop muted playsinline>
          <source src="assets/videos/video.mov" type="video/quicktime">
          <source src="assets/videos/video.mp4" type="video/mp4">
        </video>
      </div>
    </section>
    ```
* **Reglas CSS**:
    * El contenedor tiene `border-radius: 12px`, `overflow: hidden`, `background-color: #000` y una sombra suave.
    * El elemento de video dentro debe tener `width: 100%` y `height: auto` para adaptarse naturalmente a su relación de aspecto sin saltos de layout.

---

## 5. Guía Paso a Paso para Convertir Contenido Heredado

Cuando recibas una hoja de especificaciones o página de manual heredada, sigue estos pasos para refactorizarla al estándar moderno de Morpheus:

### Paso 1: Inicializa Tokens y Viewports
1. Importa las tres hojas de tokens (`colors.css`, `typography.css`, `spacing.css`) al inicio de tu hoja de estilos usando `@import`.
2. Configura la regla global de box-sizing (`box-sizing: border-box;`) para todos los elementos.
3. Agrega la meta viewport estándar en el `<head>` de tu documento HTML:
    ```html
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ```

### Paso 2: Define la Geometría de Página y el Contenedor Deskpad
1. Envuelve las hojas o páginas del manual dentro de un wrapper `main` o `body` que herede el estilo del deskpad:
    ```css
    body {
      background: var(--color-surface-page);
      font-family: var(--font-body);
      color: var(--color-text-primary);
    }
    ```
2. Configura cada elemento `.sheet` con ancho `8.5in` y alto `11in` en pantallas de escritorio. Establece márgenes, paddings y propiedades de fondo:
    ```css
    .sheet {
      width: var(--page-size-letter-w);
      height: var(--page-size-letter-h);
      padding: var(--page-margin);
      background: var(--color-surface-sheet);
      box-shadow: var(--page-sheet-shadow);
      margin: 0.4in auto;
      position: relative;
    }
    ```

### Paso 3: Refactoriza el Bloque de Título y Encabezados
1. Estructura el bloque de título con un layout estandarizado. Inserta el logo de la marca arriba a la izquierda y la numeración de página arriba a la derecha.
2. Usa la tipografía `Archivo Expanded` para el nombre del luminario y el subtítulo en mayúsculas.
3. Agrega una etiqueta eyebrow en mayúsculas y con tracking por encima de las secciones secundarias:
    ```css
    .eyebrow {
      font-family: var(--font-body);
      font-size: var(--text-eyebrow-size);
      font-weight: var(--text-eyebrow-weight);
      letter-spacing: var(--text-eyebrow-tracking);
      color: var(--color-text-accent);
      text-transform: uppercase;
    }
    ```

### Paso 4: Configura las Áreas Editables
1. Ubica las entradas de metadatos (Tipo, Modelo, Proyecto) en la parte superior de las hojas.
2. Conviértelas de líneas estáticas o inputs vacíos a spans con `contenteditable="plaintext-only"` como se muestra en la sección de patrones.
3. Verifica que no aparezcan outlines azules ni cambios de borde durante la edición, y que la tecla "Enter" sea ignorada.

### Paso 5: Estructura y Comprime las Tablas
1. Formatea todas las tablas de especificaciones con un layout compacto y paddings de celda entre `3.5px` y `5px`.
2. Aplica `font-variant-numeric: tabular-nums` para alinear números limpiamente.
3. Mantén bordes delgados y limpios (`border-bottom: 1px solid var(--color-border)`).
4. Elimina gradientes pesados o bordes internos oscuros y gruesos.

### Paso 6: Crea Overrides para Impresión
1. Al final de la hoja de estilos, agrega un bloque `@media print`.
2. Elimina todas las sombras, propiedades de fondo, espacios entre páginas y contenedores de encabezado.
3. Fuerza quiebres de página precisos:
    ```css
    @media print {
      body, html {
        background: none;
        color: #000;
      }
      .sheet {
        margin: 0 !important;
        box-shadow: none !important;
        page-break-after: always;
        page-break-inside: avoid;
        width: 100% !important;
        height: 100% !important;
      }
      .print-button, .floating-toc-btn {
        display: none !important;
      }
    }
    ```

---

## 6. Lista de Verificación para Revisión

Antes de completar la transformación al sistema de diseño, realiza estas comprobaciones:

* [ ] **Viewport**: Reduce el viewport a `320px` de ancho. Asegúrate de que no aparezca scrollbar horizontal.
* [ ] **Umbral de Tamaño de Fuente**: Verifica que ningún texto de cuerpo en pantallas digitales se renderice por debajo de `8px` (las leyendas pueden escalar más pequeñas solo para impresión).
* [ ] **Márgenes de Impresión**: Abre la vista previa de impresión (`Ctrl+P` / `Cmd+P`). Comprueba que los elementos de la Página 1 (dimensiones) y Página 3 (accesorios) no choquen con las líneas del pie de página ni se derramen a páginas adicionales.
* [ ] **Estabilidad de Entrada**: Enfoca las líneas de texto editables. Verifica que no aparezcan outlines azules activos y que al tipear no se desplacen layouts adyacentes.
