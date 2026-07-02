// Lógica de negocio pura del plan de entrenamiento.
// Reglas de seguridad clínica (ver TEST_PLAN.md):
//   SC-1: con dolor ("hurts-more") solo la Fase 1 es accesible.
//   SC-3: "feeling-better" sugiere como máximo Fase 2; nunca activa Fase 3
//         ni retrocede a quien ya está en Fase 3.

export type PainMode = 'normal' | 'hurts-more' | 'feeling-better'
export type PhaseId = 'fase1' | 'fase2' | 'fase3'

export const PHASES: readonly PhaseId[] = ['fase1', 'fase2', 'fase3']

/**
 * Transición del modo de dolor al pulsar un botón del semáforo.
 * Comportamiento toggle: pulsar el modo ya activo vuelve a 'normal'.
 */
export function nextPainMode(
  current: PainMode,
  clicked: Exclude<PainMode, 'normal'>,
): PainMode {
  return current === clicked ? 'normal' : clicked
}

/** SC-1: en modo dolor solo se permite la Fase 1. */
export function isPhaseAllowed(mode: PainMode, phase: PhaseId): boolean {
  if (mode === 'hurts-more') return phase === 'fase1'
  return true
}

/**
 * Fase activa resultante tras un cambio de modo.
 * - 'hurts-more'      → siempre Fase 1 (SC-1).
 * - 'feeling-better'  → promueve solo fase1 → fase2; nunca lleva a fase3
 *                       ni degrada desde fase3 (SC-3).
 * - 'normal'          → conserva la fase actual.
 */
export function resolvePhaseForMode(mode: PainMode, currentPhase: PhaseId): PhaseId {
  if (mode === 'hurts-more') return 'fase1'
  if (mode === 'feeling-better') return currentPhase === 'fase1' ? 'fase2' : currentPhase
  return currentPhase
}

export interface ChecklistProgress {
  completed: number
  total: number
  percent: number
}

/** Progreso del checklist; solo cuentan ítems que pertenecen a la lista. */
export function checklistProgress(
  checked: Record<string, boolean>,
  items: readonly string[],
): ChecklistProgress {
  const completed = items.filter(item => checked[item]).length
  const total = items.length
  const percent = total === 0 ? 0 : (completed / total) * 100
  return { completed, total, percent }
}

/** Duración estimada de la rutina del día. En modo dolor manda la rutina corta. */
export function estimateDuration(mode: PainMode, phase: PhaseId): string {
  if (mode === 'hurts-more' || phase === 'fase1') return '8-12 min'
  if (phase === 'fase2') return '15-20 min'
  return '20-30 min'
}

// --- Persistencia diaria (registro del día en localStorage) ---

export interface DailyState {
  date: string
  checkedItems: Record<string, boolean>
  exercisesDone: Record<string, boolean>
}

export const DAILY_STATE_STORAGE_KEY = 'entrenamiento-lisve/daily-state'

/** Clave de fecha local YYYY-MM-DD (el registro es por día calendario local). */
export function todayKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function emptyDailyState(date: string): DailyState {
  return { date, checkedItems: {}, exercisesDone: {} }
}

/**
 * Restaura el estado guardado si corresponde al día actual; ante datos de otro
 * día, ausentes o corruptos, parte con el día limpio.
 */
export function parseDailyState(raw: string | null, today: string): DailyState {
  if (!raw) return emptyDailyState(today)
  try {
    const parsed = JSON.parse(raw) as Partial<DailyState>
    if (
      parsed &&
      parsed.date === today &&
      typeof parsed.checkedItems === 'object' && parsed.checkedItems !== null &&
      typeof parsed.exercisesDone === 'object' && parsed.exercisesDone !== null
    ) {
      return {
        date: today,
        checkedItems: parsed.checkedItems as Record<string, boolean>,
        exercisesDone: parsed.exercisesDone as Record<string, boolean>,
      }
    }
  } catch {
    // JSON corrupto: se ignora y se parte limpio
  }
  return emptyDailyState(today)
}

export function serializeDailyState(state: DailyState): string {
  return JSON.stringify(state)
}
