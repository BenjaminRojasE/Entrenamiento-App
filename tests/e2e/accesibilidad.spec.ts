import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Auditoría de accesibilidad WCAG 2.1 nivel AA con axe-core.
 * Usuario objetivo: adulto mayor con dolor físico, por eso además de los
 * escaneos automáticos hay chequeos de touch targets, zoom/reflow,
 * tamaño de texto y navegación por teclado.
 */

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

const tabFase2 = (page: Page) => page.getByRole('tab', { name: /Fortalecer/ })
const tabFase3 = (page: Page) => page.getByRole('tab', { name: /Mantener/ })
const btnDueleMas = (page: Page) => page.getByRole('button', { name: 'Hoy me duele más' })
const btnAndoMejor = (page: Page) => page.getByRole('button', { name: 'Hoy ando mejor' })

function formatViolations(violations: { id: string; impact?: string | null; description: string; nodes: { target: unknown[] }[] }[]) {
  return violations
    .map(v => `[${v.impact}] ${v.id}: ${v.description}\n  Elementos: ${v.nodes.map(n => n.target.join(' ')).join(' | ')}`)
    .join('\n')
}

async function expectNoViolations(page: Page) {
  // Congelar transiciones/animaciones para que axe no capture colores
  // intermedios de una transición CSS (falsos positivos de contraste)
  await page.addStyleTag({
    content: '*, *::before, *::after { transition: none !important; animation: none !important; }',
  })
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
  expect(formatViolations(results.violations), 'No debe haber violaciones WCAG 2.1 A/AA').toBe('')
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test.describe('Escaneo axe-core WCAG 2.1 A/AA por estado de la app', () => {
  test('A11Y-01 carga inicial (Fase 1 activa)', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Entrenamiento Lisve' })).toBeVisible()
    await expectNoViolations(page)
  })

  test('A11Y-02 modo dolor "Hoy me duele más" activado', async ({ page }) => {
    await btnDueleMas(page).click()
    await expect(page.getByText(/Modo suave activado/)).toBeVisible()
    await expectNoViolations(page)
  })

  test('A11Y-03 modo mejora "Hoy ando mejor" (Fase 2 activa)', async ({ page }) => {
    await btnAndoMejor(page).click()
    await expect(page.getByText(/Puedes probar ejercicios de Fase 2/)).toBeVisible()
    await expectNoViolations(page)
  })

  test('A11Y-04 Fase 3 (Mantener) activa', async ({ page }) => {
    await tabFase3(page).click()
    await expect(page.getByText('Caminata progresiva')).toBeVisible()
    await expectNoViolations(page)
  })

  test('A11Y-05 tarjeta de ejercicio con detalles expandidos', async ({ page }) => {
    await page.getByRole('button', { name: 'Ver más detalles' }).first().click()
    await expect(page.getByText('Subir suave, sin apretar hombros ni contener la respiración.')).toBeVisible()
    await expectNoViolations(page)
  })

  test('A11Y-06 checklist con progreso parcial', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Hice mi calentamiento suave' }).click()
    await expect(page.getByText('Hoy completaste 1 de 5')).toBeVisible()
    await expectNoViolations(page)
  })

  test('A11Y-07 vista móvil (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await expect(page.getByRole('heading', { name: 'Entrenamiento Lisve' })).toBeVisible()
    await expectNoViolations(page)
  })
})

test.describe('Prioridades para adulto mayor', () => {
  test('A11Y-08 [WCAG 1.4.10 Reflow] sin scroll horizontal a 320px de ancho', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await expect(page.getByRole('heading', { name: 'Entrenamiento Lisve' })).toBeVisible()

    const overflow = await page.evaluate(() => {
      const el = document.scrollingElement!
      return el.scrollWidth - el.clientWidth
    })
    expect(overflow, 'La página no debe desbordar horizontalmente a 320px').toBeLessThanOrEqual(0)
  })

  test('A11Y-09 [WCAG 1.4.4] el zoom no está bloqueado en el viewport meta', async ({ page }) => {
    const content = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(content).not.toMatch(/user-scalable\s*=\s*(no|0)/i)
    expect(content).not.toMatch(/maximum-scale\s*=\s*1(\.0*)?\b/i)
  })

  test('A11Y-10 touch targets: controles críticos con área táctil suficiente (>= 24px, meta 44px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })

    const criticalControls = [
      btnDueleMas(page),
      btnAndoMejor(page),
      page.getByRole('tab', { name: /Calmar/ }),
      page.getByRole('button', { name: 'Marcar rutina completa' }),
      page.getByRole('button', { name: 'Reiniciar checklist' }),
    ]
    for (const control of criticalControls) {
      await control.scrollIntoViewIfNeeded()
      const box = await control.boundingBox()
      expect(box, 'El control debe ser visible').not.toBeNull()
      expect(box!.height, `Altura táctil insuficiente en: ${await control.textContent()}`).toBeGreaterThanOrEqual(24)
    }

    // Los checkboxes miden 24px pero viven dentro de un <label> clickeable
    // que amplía el área táctil efectiva; se valida el área del label.
    const firstChecklistLabel = page.locator('label', { hasText: 'Hice mi calentamiento suave' })
    const labelBox = await firstChecklistLabel.boundingBox()
    expect(labelBox!.height).toBeGreaterThanOrEqual(44)
  })

  test('A11Y-11 tamaño de texto base legible (>= 16px en párrafos principales)', async ({ page }) => {
    const heroFontSize = await page
      .getByText(/Esta es tu guía personal/)
      .evaluate(el => parseFloat(getComputedStyle(el).fontSize))
    expect(heroFontSize).toBeGreaterThanOrEqual(16)

    const bodyFontSize = await page.evaluate(() => parseFloat(getComputedStyle(document.body).fontSize))
    expect(bodyFontSize).toBeGreaterThanOrEqual(16)
  })

  test('A11Y-12 [WCAG 2.1.1] flujo crítico operable solo con teclado', async ({ page }) => {
    // Llegar con Tab hasta "Hoy me duele más" y activarlo con Enter
    const btn = btnDueleMas(page)
    let reached = false
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab')
      if (await btn.evaluate(el => el === document.activeElement)) {
        reached = true
        break
      }
    }
    expect(reached, '"Hoy me duele más" debe ser alcanzable con Tab').toBe(true)

    await page.keyboard.press('Enter')
    await expect(page.getByText(/Modo suave activado/)).toBeVisible()
    await expect(tabFase2(page)).toBeDisabled()

    // Desactivar el modo dolor con Enter de nuevo (toggle)
    await page.keyboard.press('Enter')
    await expect(tabFase2(page)).toBeEnabled()
  })

  test('A11Y-13 [WCAG 2.4.7] el foco es visible en los controles principales', async ({ page }) => {
    const btn = btnDueleMas(page)
    await btn.focus()
    const hasFocusIndicator = await btn.evaluate(el => {
      const style = getComputedStyle(el)
      const outlineVisible = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0
      const boxShadowVisible = style.boxShadow !== 'none' && style.boxShadow !== ''
      return outlineVisible || boxShadowVisible
    })
    expect(hasFocusIndicator, 'El botón enfocado debe tener indicador visible de foco').toBe(true)
  })

  test('A11Y-14 [WCAG 1.1.1] imágenes e iframes con texto alternativo', async ({ page }) => {
    const images = page.locator('img')
    for (let i = 0; i < await images.count(); i++) {
      const alt = await images.nth(i).getAttribute('alt')
      expect(alt, `La imagen ${i} debe tener alt descriptivo`).toBeTruthy()
    }

    // Al reproducir un video, el iframe debe tener título accesible
    await page.getByRole('button', { name: /Ver video de/ }).first().click()
    const iframe = page.locator('iframe').first()
    await expect(iframe).toBeVisible()
    expect(await iframe.getAttribute('title')).toBeTruthy()
  })
})
