import { describe, expect, it } from 'vitest'
import {
  PHASES,
  type PainMode,
  type PhaseId,
  nextPainMode,
  isPhaseAllowed,
  resolvePhaseForMode,
  checklistProgress,
  estimateDuration,
  todayKey,
  parseDailyState,
  serializeDailyState,
  emptyDailyState,
} from '@/lib/training-logic'

describe('isPhaseAllowed [SC-1] (U-01)', () => {
  it('en modo dolor solo permite fase1', () => {
    expect(isPhaseAllowed('hurts-more', 'fase1')).toBe(true)
    expect(isPhaseAllowed('hurts-more', 'fase2')).toBe(false)
    expect(isPhaseAllowed('hurts-more', 'fase3')).toBe(false)
  })

  it.each<PainMode>(['normal', 'feeling-better'])('en modo %s permite todas las fases', (mode) => {
    for (const phase of PHASES) {
      expect(isPhaseAllowed(mode, phase)).toBe(true)
    }
  })
})

describe('resolvePhaseForMode con dolor [SC-1] (U-02)', () => {
  it.each<PhaseId>([...PHASES])('fuerza fase1 desde %s', (phase) => {
    expect(resolvePhaseForMode('hurts-more', phase)).toBe('fase1')
  })
})

describe('resolvePhaseForMode con mejoría [SC-3] (U-03)', () => {
  it('promueve fase1 → fase2', () => {
    expect(resolvePhaseForMode('feeling-better', 'fase1')).toBe('fase2')
  })

  it('mantiene fase2 (no salta a fase3)', () => {
    expect(resolvePhaseForMode('feeling-better', 'fase2')).toBe('fase2')
  })

  it('mantiene fase3 (no degrada a quien ya avanzó)', () => {
    expect(resolvePhaseForMode('feeling-better', 'fase3')).toBe('fase3')
  })

  it('nunca retorna fase3 si el usuario no estaba ya en fase3', () => {
    expect(resolvePhaseForMode('feeling-better', 'fase1')).not.toBe('fase3')
    expect(resolvePhaseForMode('feeling-better', 'fase2')).not.toBe('fase3')
  })
})

describe('nextPainMode — toggle (U-04)', () => {
  it('desde normal activa el modo cliqueado', () => {
    expect(nextPainMode('normal', 'hurts-more')).toBe('hurts-more')
    expect(nextPainMode('normal', 'feeling-better')).toBe('feeling-better')
  })

  it('re-clic sobre el modo activo vuelve a normal (fix BUG-001)', () => {
    expect(nextPainMode('hurts-more', 'hurts-more')).toBe('normal')
    expect(nextPainMode('feeling-better', 'feeling-better')).toBe('normal')
  })

  it('clic sobre el otro modo cambia de modo directamente', () => {
    expect(nextPainMode('hurts-more', 'feeling-better')).toBe('feeling-better')
    expect(nextPainMode('feeling-better', 'hurts-more')).toBe('hurts-more')
  })
})

describe('resolvePhaseForMode en modo normal (U-05)', () => {
  it.each<PhaseId>([...PHASES])('conserva la fase %s', (phase) => {
    expect(resolvePhaseForMode('normal', phase)).toBe(phase)
  })
})

describe('checklistProgress (U-06)', () => {
  const items = ['a', 'b', 'c', 'd', 'e']

  it('sin nada marcado', () => {
    expect(checklistProgress({}, items)).toEqual({ completed: 0, total: 5, percent: 0 })
  })

  it('progreso parcial', () => {
    const result = checklistProgress({ a: true, c: true }, items)
    expect(result.completed).toBe(2)
    expect(result.percent).toBe(40)
  })

  it('todo marcado', () => {
    const checked = Object.fromEntries(items.map(i => [i, true]))
    expect(checklistProgress(checked, items)).toEqual({ completed: 5, total: 5, percent: 100 })
  })

  it('ítems desmarcados (toggle doble) no cuentan', () => {
    expect(checklistProgress({ a: false, b: true }, items).completed).toBe(1)
  })

  it('claves ajenas a la lista no inflan el conteo', () => {
    expect(checklistProgress({ zzz: true }, items).completed).toBe(0)
  })

  it('lista vacía no divide por cero', () => {
    expect(checklistProgress({}, []).percent).toBe(0)
  })
})

describe('estimateDuration (U-07)', () => {
  it('modo dolor siempre es la rutina corta, sin importar la fase', () => {
    for (const phase of PHASES) {
      expect(estimateDuration('hurts-more', phase)).toBe('8-12 min')
    }
  })

  it.each<[PhaseId, string]>([
    ['fase1', '8-12 min'],
    ['fase2', '15-20 min'],
    ['fase3', '20-30 min'],
  ])('en modo normal, %s dura %s', (phase, expected) => {
    expect(estimateDuration('normal', phase)).toBe(expected)
  })
})

describe('persistencia diaria (U-08)', () => {
  const today = '2026-07-02'
  const savedState = {
    date: today,
    checkedItems: { 'Hice mi calentamiento suave': true },
    exercisesDone: { 'Puente corto': true },
  }

  it('todayKey usa fecha local YYYY-MM-DD', () => {
    expect(todayKey(new Date(2026, 6, 2, 23, 59))).toBe('2026-07-02')
    expect(todayKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('restaura el estado guardado del mismo día', () => {
    const raw = serializeDailyState(savedState)
    expect(parseDailyState(raw, today)).toEqual(savedState)
  })

  it('resetea si el estado guardado es de otro día', () => {
    const raw = serializeDailyState({ ...savedState, date: '2026-07-01' })
    expect(parseDailyState(raw, today)).toEqual(emptyDailyState(today))
  })

  it('resetea con null (primera visita)', () => {
    expect(parseDailyState(null, today)).toEqual(emptyDailyState(today))
  })

  it('resetea con JSON corrupto', () => {
    expect(parseDailyState('{no es json', today)).toEqual(emptyDailyState(today))
    expect(parseDailyState('"un string"', today)).toEqual(emptyDailyState(today))
    expect(parseDailyState(JSON.stringify({ date: today }), today)).toEqual(emptyDailyState(today))
  })
})
