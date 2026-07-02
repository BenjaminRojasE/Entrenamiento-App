# Entrenamiento Lisve

[![CI](https://github.com/BenjaminRojasE/Entrenamiento-App/actions/workflows/ci.yml/badge.svg)](https://github.com/BenjaminRojasE/Entrenamiento-App/actions/workflows/ci.yml)

Guía web de rehabilitación lumbo-glútea para hacer ejercicios en casa de forma segura y
progresiva. La app organiza el tratamiento en **tres fases** (Calmar → Fortalecer → Mantener),
incluye un **semáforo de dolor** que adapta la rutina al estado del día, un **checklist diario**
con registro persistente, y fichas de ejercicio con video, dosis y señales de alerta.

Construida con **Next.js 16, React 19, TypeScript y Tailwind 4** (UI shadcn/Radix). Es una app
real en uso por una paciente real — no un proyecto de práctica — y por eso el eje de este repo
es la **auditoría QA** que se le hizo: aquí un bug no es solo un defecto de software, puede
significar que una persona con dolor agudo haga ejercicios de fortalecimiento que la empeoren.

## La regla que gobierna todo: seguridad clínica primero

Antes de escribir un solo test se identificaron, junto al dueño del producto, las tres reglas
que **nunca** pueden romperse. Están marcadas `[SC]` en la suite y son bloqueantes de release:

| ID | Regla inviolable |
|----|------------------|
| SC-1 | Con "Hoy me duele más" activo, **solo la Fase 1 es accesible** — sin importar en qué fase estaba el usuario. |
| SC-2 | Las señales de alarma (dolor eléctrico, debilidad nueva, fiebre ⇒ suspender y consultar) se renderizan **siempre**. |
| SC-3 | "Hoy ando mejor" sugiere como máximo Fase 2: **nunca activa Fase 3 directamente** ni retrocede a quien ya avanzó. |

Cada regla está cubierta en dos niveles: como test unitario de la lógica pura y como test E2E
sobre la UI real (atributos `disabled`, contenido visible, fase activa).

## Estrategia de testing

El detalle completo está en [TEST_PLAN.md](TEST_PLAN.md); el razonamiento fue:

**1. Hacer la lógica testeable primero.** Toda la lógica de negocio vivía incrustada en el
componente de la página. Se extrajo a módulos puros — [`lib/training-logic.ts`](lib/training-logic.ts)
(transiciones del modo dolor, gating de fases, progreso del checklist, duración estimada,
persistencia diaria) y [`lib/youtube.ts`](lib/youtube.ts) — sin cambiar comportamiento, salvo
los bugs documentados. Lógica pura = tests rápidos, deterministas y sin mocks.

**2. Unitarios (Vitest) para las decisiones.** 37 tests cubren las matrices completas de
decisión: cada combinación modo × fase, toggles del semáforo, casos borde del checklist
(lista vacía, claves ajenas, doble toggle) y expiración del registro diario (mismo día /
otro día / JSON corrupto). Son los tests que protegen las reglas SC al menor costo posible.

**3. E2E (Playwright) para los flujos reales.** 10 tests recorren la app como la usuaria:
cargar la página, activar el modo dolor y verificar que los tabs quedan realmente
deshabilitados, marcar el checklist, **recargar la página y comprobar que el registro
sobrevive**. Los E2E existen porque un unitario no puede detectar que un `disabled` no llegó
al DOM o que la hidratación de localStorage rompe el render.

**4. Documentar antes de arreglar.** Cada bug se reprodujo y documentó en
[BUGS.md](BUGS.md) (severidad, pasos, esperado vs. actual) antes de tocar el código, y el
estado original quedó preservado como primer commit del repo para trazabilidad.

## Bugs encontrados y corregidos

Detalle completo con pasos de reproducción en [BUGS.md](BUGS.md).

| ID | Severidad | Resumen | Cubierto por |
|----|-----------|---------|--------------|
| BUG-001 | Alta | El modo de dolor quedaba "pegado": no había forma de volver al estado normal, dejando Fase 2 y 3 bloqueadas indefinidamente. | U-04, E-05 |
| BUG-002 | Alta | El checklist diario y los ejercicios marcados se perdían al recargar, contradiciendo la promesa de "llevar tu registro". Ahora persiste por día calendario en localStorage. | U-08, E-08 |
| BUG-003 | Media | "Hoy ando mejor" retrocedía a Fase 2 a quien ya estaba en Fase 3 de mantención. | U-03, E-04b |
| BUG-005 | Media | El viewport bloqueaba el pinch-zoom (`user-scalable=no`) — crítico en una app de salud (WCAG 1.4.4). | Revisión manual |
| BUG-004 | Baja | `ignoreBuildErrors: true` ocultaba errores de TypeScript en el build de producción. | `typecheck` + build en CI |

**Resultado final: 47/47 tests en verde** (37 unitarios + 10 E2E) con los cinco fixes aplicados.

## CI/CD

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) corre en cada push y pull request:

1. **Typecheck** (`tsc --noEmit`) — los errores de tipos ya no pueden pasar desapercibidos.
2. **Tests unitarios** (Vitest).
3. **Build de producción** (Next.js con validación de TypeScript activada).
4. **Tests E2E** (Playwright + Chromium contra la app levantada).
5. Si algo falla, el **reporte HTML de Playwright** se sube como artifact para diagnóstico.

## Cómo correr todo localmente

Requisitos: Node.js 20+ y pnpm 10.

```bash
pnpm install
pnpm exec playwright install chromium   # una sola vez

pnpm dev          # app en desarrollo
pnpm test:unit    # unitarios (pnpm test:unit:watch en desarrollo)
pnpm test:e2e     # E2E — levanta next dev en el puerto 3100 por sí solo
pnpm test         # suite completa
pnpm typecheck    # solo tipos
pnpm build        # build de producción
```

Nota: los E2E usan el puerto **3100** para no chocar con otros servicios locales en `:3000`.

## Documentación de la auditoría

- [TEST_PLAN.md](TEST_PLAN.md) — plan de pruebas: casos, prioridades y tipo (unitario vs E2E).
- [BUGS.md](BUGS.md) — los 5 bugs con severidad, reproducción y verificación post-fix.
- [PROGRESS.md](PROGRESS.md) — bitácora de la auditoría, incluidas decisiones e incidentes
  (p. ej., la primera corrida E2E que falló por un conflicto de puerto con otra app local).
