# TEST_PLAN.md — Plan de pruebas "Entrenamiento Lisve"

App de rehabilitación lumbo-glútea guiada en casa. El riesgo principal no es técnico sino
**clínico**: si la app deja hacer ejercicios de fortalecimiento a una persona con dolor agudo,
o esconde las señales de alarma, puede causar daño real. Por eso los tests se priorizan por
riesgo clínico primero y funcionalidad después.

## Reglas de seguridad clínica (inviolables — confirmadas con el dueño)

| ID | Regla |
|----|-------|
| SC-1 | Con "Hoy me duele más" activo, **solo Fase 1 es accesible** (tabs Fase 2 y 3 deshabilitados, fase activa forzada a Fase 1, sin importar en qué fase estaba). |
| SC-2 | Las señales de alarma se renderizan **siempre**: semáforo rojo ("dolor fuerte, eléctrico, debilidad ⇒ parar y consultar") y advertencia de "Antes de empezar" (fiebre / dolor eléctrico ⇒ suspender y consultar). |
| SC-3 | "Hoy ando mejor" puede sugerir como máximo Fase 2. **Nunca activa Fase 3 directamente** (y no degrada a quien ya está en Fase 3). |

Cualquier cambio futuro que rompa un test marcado `[SC]` es un bloqueante de release.

## Arquitectura de pruebas

- **Unitarios (Vitest, entorno node)** sobre lógica pura extraída a `lib/training-logic.ts`
  y `lib/youtube.ts`. La lógica estaba incrustada en `app/page.tsx`; se extrae sin cambiar
  comportamiento (salvo los bugs documentados en BUGS.md).
- **E2E (Playwright, Chromium)** sobre la app real (`next dev`) cubriendo los flujos de usuario
  completos, incluidas las reglas SC a nivel de UI real (atributos `disabled`, contenido visible,
  persistencia tras recarga).

## Casos unitarios (Vitest) — `tests/unit/`

| ID | Caso | Prioridad |
|----|------|-----------|
| U-01 `[SC-1]` | `isPhaseAllowed`: matriz completa modo × fase — con 'hurts-more' solo fase1 permitida; con 'normal'/'feeling-better' todas permitidas | Crítica |
| U-02 `[SC-1]` | `resolvePhaseForMode('hurts-more', X)` = fase1 para X ∈ {fase1, fase2, fase3} | Crítica |
| U-03 `[SC-3]` | `resolvePhaseForMode('feeling-better', fase1)` = fase2; desde fase2 se mantiene fase2; desde fase3 se mantiene fase3 (nunca retorna fase3 desde fase1/fase2, nunca degrada) | Crítica |
| U-04 | `nextPainMode`: toggle — clic sobre el modo activo vuelve a 'normal'; clic sobre el otro modo cambia de modo; desde 'normal' activa el modo cliqueado | Alta |
| U-05 | `resolvePhaseForMode('normal', X)` = X (volver a normal no cambia la fase) | Alta |
| U-06 | `checklistProgress`: 0 marcados, parcial, todos, ítems desmarcados (toggle doble), lista vacía (sin división por cero), claves ajenas a la lista no cuentan | Alta |
| U-07 | `estimateDuration`: matriz modo × fase (modo dolor siempre 8-12 min; fase2 15-20; fase3 20-30) | Media |
| U-08 | Persistencia diaria: `parseDailyState` restaura estado del mismo día; resetea si la fecha guardada es de otro día; resetea con JSON corrupto o null; `todayKey` usa fecha local YYYY-MM-DD | Alta |
| U-09 | `getYouTubeEmbedUrl`: URLs de shorts, watch, watch con parámetros extra, URL no-YouTube (passthrough) | Media |
| U-10 | `getYouTubeThumbnail`: id extraído correcto; string vacío para URL no reconocida | Baja |

## Casos E2E (Playwright) — `tests/e2e/`

| ID | Caso | Prioridad |
|----|------|-----------|
| E-01 `[SC-2]` | Al cargar: título, 3 tabs visibles, Fase 1 activa por defecto, y las señales de alarma visibles (texto del semáforo rojo y advertencia "Antes de empezar") | Crítica |
| E-02 `[SC-1]` | Clic "Hoy me duele más": mensaje de modo suave visible, tabs Fase 2 y 3 con `disabled`, tab activo = Fase 1 | Crítica |
| E-03 `[SC-1]` | Estando en Fase 3, clic "Hoy me duele más" ⇒ vuelve forzado a Fase 1 y bloquea 2/3 | Crítica |
| E-04 `[SC-3]` | Clic "Hoy ando mejor" desde Fase 1 ⇒ activa Fase 2 (no Fase 3); estando en Fase 3 no degrada | Crítica |
| E-05 | Toggle de modo: re-clic en "Hoy me duele más" vuelve a normal y re-habilita los tabs (fix BUG-001) | Alta |
| E-06 | Navegación normal de fases: sin modo activo se puede entrar a Fase 2 y Fase 3 y se ven sus ejercicios; duración estimada cambia (8-12 / 15-20 / 20-30 min) | Alta |
| E-07 | Checklist: marcar ítems actualiza contador "X de 5"; "Marcar rutina completa" ⇒ 5 de 5; "Reiniciar checklist" ⇒ 0 de 5 | Alta |
| E-08 | Persistencia diaria: marcar checklist + un ejercicio "Hecho", recargar página ⇒ el estado se mantiene (fix BUG-002) | Alta |
| E-09 | Tarjeta de ejercicio: checkbox "Hecho" marca la tarjeta; "Ver más detalles" expande tip/cuándo usarlo/progreso | Media |

## Fuera de alcance (por ahora)

- Tests de reproducción real de videos de YouTube (dependencia externa; solo se testea la
  construcción de URLs).
- Tests visuales/regresión de estilos.
- Tests de accesibilidad automatizados (se anota como mejora en BUGS.md lo encontrado a mano).

## Ejecución

- `pnpm test:unit` — Vitest.
- `pnpm test:e2e` — Playwright (levanta `next dev` solo).
- CI: GitHub Actions corre lint de tipos, unitarios y E2E en cada push (ver `.github/workflows/ci.yml`).
