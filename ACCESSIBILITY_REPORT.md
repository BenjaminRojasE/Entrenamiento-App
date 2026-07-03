# Auditoría de accesibilidad — WCAG 2.1 nivel AA

**Fecha:** 2026-07-02 · **Herramientas:** axe-core 4.12 (`@axe-core/playwright`) + chequeos automatizados propios en Playwright · **Alcance:** todos los flujos críticos de la app (los mismos que cubre `tests/e2e/flujos.spec.ts`).

## Contexto

La usuaria objetivo es una **adulta mayor con dolor físico**. Eso ordenó las prioridades de la
auditoría: contraste de color, tamaño de texto y de zonas táctiles, zoom, navegación por teclado
y textos alternativos. Un fallo de contraste aquí no es cosmético: el contenido rojo de la app
es justamente el de **seguridad clínica** ("Rojo: Parar", "No debe pasar", "Modo suave activado").

## Qué se evaluó

Escaneo axe-core con las reglas `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` en **7 estados** de la app:

| Estado | Test |
|---|---|
| Carga inicial (Fase 1 activa) | A11Y-01 |
| Modo dolor "Hoy me duele más" activado | A11Y-02 |
| Modo mejora "Hoy ando mejor" (Fase 2) | A11Y-03 |
| Fase 3 (Mantener) activa | A11Y-04 |
| Tarjeta de ejercicio con detalles expandidos | A11Y-05 |
| Checklist con progreso parcial | A11Y-06 |
| Vista móvil (375 px) | A11Y-07 |

Más chequeos dirigidos a la usuaria objetivo (A11Y-08 a A11Y-14): reflow a 320 px (1.4.10),
zoom no bloqueado (1.4.4), touch targets de los controles críticos, texto base ≥ 16 px,
operación completa por teclado del flujo del semáforo de dolor (2.1.1), foco visible (2.4.7)
y textos alternativos en imágenes e iframes de video (1.1.1).

## Violaciones encontradas

Todas las violaciones que reportó axe fueron de **contraste de color (WCAG 1.4.3, nivel AA)**,
con impacto `serious`. Se corrigieron todas; el detalle:

| ID | Severidad | Elemento | Criterio | Medido | Estado |
|---|---|---|---|---|---|
| AXE-01 | Serious | Texto `--danger` en "Rojo: Parar", "No debe pasar" (×4 tarjetas), "Qué evitar por ahora" y "Modo suave activado" | 1.4.3 Contraste (mínimo) | 4.07–4.45 : 1 (requiere 4.5) | ✅ Corregido |
| AXE-02 | Serious | Botón activo "Hoy me duele más": texto blanco sobre rojo `--danger` | 1.4.3 | 4.12 : 1 | ✅ Corregido |
| AXE-03 | Serious | Botón activo "Hoy ando mejor": texto blanco sobre verde `--success` | 1.4.3 | 2.79 : 1 | ✅ Corregido |
| AXE-04 | Serious | Hover de "Ver más detalles" y del botón "Volver arriba" del header: texto claro sobre acento turquesa (el override `hover:text-foreground` anulaba el `hover:text-accent-foreground` del design system) | 1.4.3 | 2.04 : 1 | ✅ Corregido |
| AXE-05 | Serious | Hover de los botones outline del semáforo: heredaban texto oscuro del variant sobre fondo oscuro `danger/10` – `success/10` | 1.4.3 | ~2.2 : 1 | ✅ Corregido |

Hallazgos adicionales de la revisión manual (semántica para lector de pantalla, sin impacto visual):

| ID | Severidad | Elemento | Criterio | Estado |
|---|---|---|---|---|
| MAN-01 | Menor | Viñetas decorativas `•` y `✕` de las listas, círculos del semáforo y círculos con letra (Z/F/C/Ca) se anunciaban al lector de pantalla como caracteres sueltos | 1.1.1 Contenido no textual | ✅ Corregido (`aria-hidden`) |
| MAN-02 | Menor | Barra de progreso del checklist era un `div` sin semántica | 1.3.1 Información y relaciones | ✅ Corregido (`role="progressbar"` + `aria-valuenow/min/max`) |
| MAN-03 | Menor | "Ver más detalles" no comunicaba su estado expandido/colapsado | 4.1.2 Nombre, función, valor | ✅ Corregido (`aria-expanded`) |

## Correcciones aplicadas (sin cambiar el diseño)

1. **`--danger` más luminoso** ([globals.css](app/globals.css)): `oklch(0.60 0.22 25)` → `oklch(0.66 0.22 25)`.
   Mismo tono y saturación; solo la luminosidad mínima para superar 4.5:1 sobre los fondos
   oscuros de la app. Resuelve AXE-01 en los 7 elementos afectados.
2. **Botón rojo activo usa el token `--destructive`** ([page.tsx](app/page.tsx)): el design system ya
   define ese rojo más oscuro precisamente para botones rellenos con texto blanco (≈ 5.7:1). Resuelve AXE-02.
3. **Botón verde activo usa texto oscuro** (`text-primary-foreground`, ≈ 6.9:1), el mismo patrón
   del botón primario relleno de la app ("Empezar rutina"). Resuelve AXE-03.
4. **Hovers restaurados al comportamiento del design system**: los overrides `hover:text-foreground`
   pasaron a `hover:text-accent-foreground` (texto oscuro sobre acento, como define el variant
   `ghost` de shadcn), y los botones outline del semáforo conservan su color en hover
   (`hover:text-danger` / `hover:text-success`). Resuelve AXE-04 y AXE-05.
5. **Semántica invisible**: `aria-hidden` en decoración, `role="progressbar"` y `aria-expanded`
   (MAN-01/02/03).

## Lo que ya estaba bien

- `lang="es"` en el documento; jerarquía de encabezados coherente (h1 → h2 → h3 → h4).
- Zoom no bloqueado en el viewport (el `user-scalable=no` se había eliminado en BUG-005).
- Sin scroll horizontal a 320 px de ancho (1.4.10 Reflow).
- Texto base de 16 px y párrafos principales ≥ 16 px.
- Imágenes con `alt` descriptivo; iframes de video con `title`; íconos lucide con `aria-hidden`.
- Checkboxes con nombre accesible vía `<label>`; tabs Radix con teclado y `aria-selected`.
- Foco visible (ring de 3 px) y flujo del semáforo 100 % operable con teclado.
- Touch targets de los controles críticos ≥ 24 px, con ítems del checklist ≥ 44 px.

## Reportado — requiere decisión de diseño (no se tocó)

| ID | Observación | Referencia |
|---|---|---|
| DES-01 | Los tabs de fase usan `text-xs` (12 px) en móvil. Cumple AA (el zoom funciona), pero para una adulta mayor se recomienda ≥ 14–16 px también en móvil. | 1.4.4 / buenas prácticas |
| DES-02 | El checkbox "Hecho" de las tarjetas de ejercicio mide 24×24 px (mínimo aceptable). El objetivo recomendado para motricidad reducida es 44×44 px (nivel AAA 2.5.5). En el checklist diario el `<label>` amplía el área táctil; en las tarjetas el área es menor. | 2.5.5 (AAA) |
| DES-03 | Los ítems completados del checklist usan tachado (`line-through`), que puede costar de leer con baja visión. Alternativa: atenuar + ícono de check sin tachar. | Buenas prácticas |
| DES-04 | Los videos de YouTube embebidos dependen de que cada video tenga subtítulos; no es controlable desde la app. Si algún video no los tiene, incumpliría 1.2.2. La app mitiga con instrucciones completas en texto. | 1.2.2 |
| DES-05 | `scroll-behavior: smooth` y las animaciones no respetan `prefers-reduced-motion`. No es requisito AA, pero es mejora de bajo costo para usuarios con sensibilidad vestibular. | 2.3.3 (AAA) |
| DES-06 | El botón rojo activo ahora usa `--destructive` (rojo más oscuro que `--danger`). Funciona y pasa AA; si diseño quiere un solo rojo, habría que definir un par fondo/texto propio para `--danger`. | Consistencia de tokens |

## Tests automatizados y CI

- Nueva suite: [tests/e2e/accesibilidad.spec.ts](tests/e2e/accesibilidad.spec.ts) — 14 tests
  (7 escaneos axe por estado + 7 chequeos dirigidos). Cualquier regresión WCAG 2.1 A/AA en estos
  estados **rompe el build**.
- Script dedicado: `pnpm test:a11y`. La suite también corre dentro de `pnpm test:e2e`, que es lo
  que ejecuta el paso "Tests E2E y accesibilidad (Playwright)" de
  [.github/workflows/ci.yml](.github/workflows/ci.yml) en cada push y pull request.
- Nota de implementación: antes de cada escaneo se congelan las transiciones CSS, porque axe
  puede muestrear un color a mitad de transición y producir falsos positivos de contraste.

## Resultado

**61/61 tests en verde** (37 unitarios + 10 E2E de flujos + 14 de accesibilidad), con 8
violaciones corregidas y 6 observaciones de diseño documentadas arriba.
