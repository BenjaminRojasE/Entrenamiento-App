# BUGS.md — Bugs encontrados durante la auditoría QA

Fecha de auditoría: 2026-07-02. Estado del código auditado: versión previa a los fixes
(commit inicial "estado original" en git). Cada bug fue documentado **antes** de arreglarse.

---

## BUG-001 — El modo de dolor no se puede desactivar (queda pegado)

- **Severidad**: Alta (impacta la regla clínica SC-1 en la dirección opuesta: sobre-restringe)
- **Archivo**: `app/page.tsx` (`handlePainMode`)
- **Pasos para reproducir**:
  1. Abrir la app.
  2. Clic en "Hoy me duele más" → Fase 2 y 3 se deshabilitan (correcto).
  3. Volver a hacer clic en "Hoy me duele más" (o intentar volver al estado inicial).
- **Esperado**: Re-clic en el botón activo desactiva el modo y vuelve a 'normal',
  re-habilitando los tabs (confirmado con el dueño: comportamiento toggle).
- **Actual**: No existe ninguna transición de vuelta a 'normal'. El modo queda fijo hasta
  recargar la página; en modo dolor, Fase 2 y 3 quedan bloqueadas indefinidamente aunque el
  dolor haya pasado, y el usuario no entiende por qué.
- **Fix**: `nextPainMode()` en `lib/training-logic.ts` implementa el toggle; `page.tsx` lo usa.

## BUG-002 — El checklist diario y los ejercicios "Hecho" no persisten

- **Severidad**: Alta (rompe la promesa del producto: "Marca lo que hagas cada día para llevar tu registro")
- **Archivo**: `app/page.tsx` (estado solo en `useState`, sin storage)
- **Pasos para reproducir**:
  1. Marcar 3 ítems del checklist y un ejercicio como "Hecho".
  2. Recargar la página (o cerrar y volver a abrir, algo normal en un teléfono).
- **Esperado**: El registro del día se mantiene durante el mismo día calendario y se
  reinicia automáticamente al día siguiente (confirmado con el dueño).
- **Actual**: Todo el progreso se pierde en cada recarga.
- **Fix**: persistencia en `localStorage` con clave por fecha local (`YYYY-MM-DD`);
  lógica pura de serialización/expiración en `lib/training-logic.ts` (`parseDailyState`),
  testeada unitariamente. Si el JSON guardado está corrupto o es de otro día, se parte limpio.

## BUG-003 — "Hoy ando mejor" degrada de Fase 3 a Fase 2

- **Severidad**: Media (lógica de fases incorrecta, sin riesgo clínico directo)
- **Archivo**: `app/page.tsx` (`handlePainMode`: `setActivePhase('fase2')` incondicional)
- **Pasos para reproducir**:
  1. En modo normal, ir al tab "Fase 3: Mantener".
  2. Clic en "Hoy ando mejor".
- **Esperado**: Alguien que ya está en fase de mantención y anda mejor debería quedarse en
  Fase 3. El salto a Fase 2 solo tiene sentido desde Fase 1 (regla SC-3: como máximo sugiere
  Fase 2, nunca Fase 3, y tampoco retrocede a quien ya avanzó).
- **Actual**: La fase activa cambia incondicionalmente a Fase 2, retrocediendo al usuario.
- **Fix**: `resolvePhaseForMode('feeling-better', fase)` solo promueve fase1 → fase2 y
  mantiene fase2/fase3 tal cual.

## BUG-004 — `ignoreBuildErrors: true` esconde errores de TypeScript en el build

- **Severidad**: Baja (deuda de calidad; riesgo de shippear código roto sin enterarse)
- **Archivo**: `next.config.mjs`
- **Pasos para reproducir**: introducir cualquier error de tipos en `app/page.tsx` y correr
  `pnpm build` → el build pasa igual.
- **Esperado**: El build falla ante errores de tipos (y el CI los detecta).
- **Actual**: Los errores de tipos se ignoran silenciosamente (default de v0).
- **Fix**: se elimina `typescript.ignoreBuildErrors` (verificado que `tsc --noEmit` pasa
  limpio antes del cambio) y el CI corre `tsc --noEmit` explícitamente.

## BUG-005 — El viewport bloquea el zoom (accesibilidad)

- **Severidad**: Media (app de salud, usuaria probablemente necesita agrandar texto)
- **Archivo**: `app/layout.tsx` (`viewport: { maximumScale: 1, userScalable: false }`)
- **Pasos para reproducir**: abrir la app en un móvil e intentar hacer pinch-zoom.
- **Esperado**: El zoom debe estar permitido (WCAG 1.4.4: el texto debe poder escalarse).
- **Actual**: `user-scalable=no` + `maximum-scale=1` impiden el zoom por completo.
- **Fix**: se eliminan `maximumScale` y `userScalable` del export `viewport`.

---

## Observaciones (no clasificadas como bug, no se tocan)

- "Cuándo pasar de fase" es solo texto informativo; el avance de fase no se valida con datos
  del usuario. Es coherente con el diseño actual (decisión humana/kinesiólogo), pero si algún
  día se automatiza, las reglas SC del TEST_PLAN.md aplican.
- Los videos de YouTube embebidos dependen de que los videos sigan existiendo; fuera del
  alcance de los tests (solo se testea la construcción de la URL de embed/thumbnail).
- El botón "Reiniciar checklist" borra sin pedir confirmación; aceptable para este alcance.

## Estado final

| Bug | Estado | Cubierto por |
|-----|--------|--------------|
| BUG-001 | ✅ Corregido | U-04, E-05 |
| BUG-002 | ✅ Corregido | U-08, E-08 |
| BUG-003 | ✅ Corregido | U-03, E-04b |
| BUG-004 | ✅ Corregido | `pnpm typecheck` + build en CI |
| BUG-005 | ✅ Corregido | (manual: viewport sin bloqueo de zoom) |

Verificación post-fix: 37/37 unitarios (Vitest) y 10/10 E2E (Playwright) en verde;
`pnpm build` pasa con la validación de TypeScript activada.
