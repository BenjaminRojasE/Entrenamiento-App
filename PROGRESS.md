# PROGRESS.md — Notas de trabajo QA

## 2026-07-02

### 1. Exploración del repo (hecho)
- App Next.js 16 + React 19 de una sola página (`app/page.tsx`), generada con v0.
- Lógica de negocio identificada:
  - **Fases**: fase1 (Calmar) / fase2 (Fortalecer) / fase3 (Mantener) como tabs.
  - **Modo dolor (semáforo interactivo)**: "Hoy me duele más" fuerza fase1 y deshabilita
    tabs de fase2/fase3; "Hoy ando mejor" salta a fase2.
  - **Checklist diario**: 5 ítems, contador, barra de progreso, marcar todo / reiniciar.
  - **Duración estimada** según fase/modo.
  - El semáforo verde/amarillo/rojo y "Cuándo pasar de fase" son contenido educativo (sin lógica).
- Toda la lógica vive incrustada en el componente → hay que extraerla a `lib/` para testearla unitariamente.

### 2. Decisiones confirmadas con el usuario (hecho)
- Modo dolor debe ser **toggle** (re-clic vuelve a normal) → el comportamiento actual es bug.
- Reglas clínicas inviolables (tests críticos):
  1. Modo "me duele más" ⇒ solo Fase 1 accesible.
  2. Señales de alarma (semáforo rojo + advertencia "dolor eléctrico/debilidad/fiebre ⇒ suspender
     y consultar") siempre visibles.
  3. "Hoy ando mejor" nunca lleva a Fase 3 directamente.
- Falta de persistencia del checklist es **bug** → implementar localStorage con reseteo diario.
- OK para `git init` + commit local + workflow de GitHub Actions.

### 3. Setup de entorno (hecho)
- La máquina no tenía Node.js → instalado Node 24.18.0 LTS vía winget.
- `corepack enable` falló por permisos (Program Files) → pnpm 10 instalado vía `npm i -g pnpm@10`.
- `pnpm install` OK (lockfile al día, 186 paquetes).

### 4. Plan de pruebas y bugs (hecho)
- TEST_PLAN.md escrito: 10 casos unitarios + 10 E2E, priorizados por riesgo clínico
  (reglas SC-1/SC-2/SC-3 marcadas como inviolables).
- 5 bugs documentados en BUGS.md ANTES de arreglarlos (BUG-001 a BUG-005).
- `git init` + commit del estado original para dejar trazabilidad del antes/después.

### 5. Refactor testeable + fixes (hecho)
- Lógica pura extraída a `lib/training-logic.ts` (modo dolor, fases, checklist,
  duración, persistencia diaria) y `lib/youtube.ts` (embed/thumbnail).
- `app/page.tsx` ahora consume la lib; fixes aplicados:
  - BUG-001: `nextPainMode` con comportamiento toggle.
  - BUG-002: registro diario en localStorage (clave `entrenamiento-lisve/daily-state`,
    se resetea al cambiar el día; hidratación en cliente para evitar mismatch SSR).
  - BUG-003: `resolvePhaseForMode` solo promueve fase1→fase2, no degrada fase3.
  - BUG-004: `ignoreBuildErrors` eliminado de next.config.mjs (tsc estaba limpio).
  - BUG-005: viewport sin `maximumScale`/`userScalable` (zoom permitido).

### 6. Tests (hecho)
- Vitest configurado (`vitest.config.ts`, alias `@`, entorno node): **37/37 en verde**.
- Playwright configurado (`playwright.config.ts`, Chromium, webServer `next dev`).
- Incidente: la primera corrida E2E falló completa porque el puerto 3000 de esta
  máquina lo ocupa otra app y Playwright (con `reuseExistingServer`) testeó contra
  esa app ajena. Fix: los E2E usan el puerto 3100. **10/10 en verde**.
- `pnpm build` verificado con validación de TypeScript activada.

### 7. CI (hecho)
- `.github/workflows/ci.yml`: en cada push y PR corre typecheck → unitarios →
  build → E2E (Chromium con deps) y sube el reporte de Playwright si algo falla.

### 8. Cómo correr todo localmente
- `pnpm install` (una vez: `pnpm exec playwright install chromium`)
- `pnpm test:unit` — unitarios; `pnpm test:unit:watch` en desarrollo.
- `pnpm test:e2e` — E2E (levanta `next dev` en :3100 solo).
- `pnpm test` — todo. `pnpm typecheck` — tipos.

Nota de entorno: esta máquina no tenía Node; quedó instalado Node 24 LTS (winget)
y pnpm 10 (npm global). El repo git quedó local (sin remote); para conectarlo:
`git remote add origin <url>` + `git push -u origin master`.
