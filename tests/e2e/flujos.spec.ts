import { test, expect, type Page } from '@playwright/test'

const tabFase1 = (page: Page) => page.getByRole('tab', { name: /Calmar/ })
const tabFase2 = (page: Page) => page.getByRole('tab', { name: /Fortalecer/ })
const tabFase3 = (page: Page) => page.getByRole('tab', { name: /Mantener/ })
const btnDueleMas = (page: Page) => page.getByRole('button', { name: 'Hoy me duele más' })
const btnAndoMejor = (page: Page) => page.getByRole('button', { name: 'Hoy ando mejor' })

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('E-01 [SC-2] carga inicial: fases, fase 1 activa y señales de alarma visibles', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Entrenamiento Lisve' })).toBeVisible()

  await expect(tabFase1(page)).toBeVisible()
  await expect(tabFase2(page)).toBeVisible()
  await expect(tabFase3(page)).toBeVisible()
  await expect(tabFase1(page)).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByText('Esfinge / Extensión suave')).toBeVisible()

  // Señales de alarma: SIEMPRE visibles (regla clínica SC-2)
  await expect(page.getByText('Rojo: Parar')).toBeVisible()
  await expect(
    page.getByText(/eléctrico hacia la pierna, debilidad nueva o empeoramiento importante/),
  ).toBeVisible()
  await expect(
    page.getByText(/dolor eléctrico a la pierna, debilidad nueva, fiebre o síntomas raros, suspender y consultar/),
  ).toBeVisible()
})

test('E-02 [SC-1] "Hoy me duele más" bloquea Fase 2 y 3 y fuerza Fase 1', async ({ page }) => {
  await btnDueleMas(page).click()

  await expect(page.getByText(/Modo suave activado/)).toBeVisible()
  await expect(tabFase1(page)).toHaveAttribute('aria-selected', 'true')
  await expect(tabFase2(page)).toBeDisabled()
  await expect(tabFase3(page)).toBeDisabled()
  await expect(page.getByText('Hoy: 8-12 min')).toBeVisible()
})

test('E-03 [SC-1] estando en Fase 3, "Hoy me duele más" vuelve forzado a Fase 1', async ({ page }) => {
  await tabFase3(page).click()
  await expect(tabFase3(page)).toHaveAttribute('aria-selected', 'true')

  await btnDueleMas(page).click()

  await expect(tabFase1(page)).toHaveAttribute('aria-selected', 'true')
  await expect(tabFase2(page)).toBeDisabled()
  await expect(tabFase3(page)).toBeDisabled()
})

test('E-04 [SC-3] "Hoy ando mejor" activa Fase 2 desde Fase 1 y nunca Fase 3', async ({ page }) => {
  await btnAndoMejor(page).click()

  await expect(page.getByText(/Puedes probar ejercicios de Fase 2/)).toBeVisible()
  await expect(tabFase2(page)).toHaveAttribute('aria-selected', 'true')
  await expect(tabFase3(page)).toHaveAttribute('aria-selected', 'false')
})

test('E-04b [SC-3] "Hoy ando mejor" no degrada a quien ya está en Fase 3', async ({ page }) => {
  await tabFase3(page).click()
  await btnAndoMejor(page).click()

  await expect(tabFase3(page)).toHaveAttribute('aria-selected', 'true')
})

test('E-05 toggle: re-clic en "Hoy me duele más" vuelve a normal y re-habilita tabs', async ({ page }) => {
  await btnDueleMas(page).click()
  await expect(tabFase2(page)).toBeDisabled()

  await btnDueleMas(page).click()

  await expect(page.getByText(/Modo suave activado/)).toBeHidden()
  await expect(tabFase2(page)).toBeEnabled()
  await expect(tabFase3(page)).toBeEnabled()
  await tabFase2(page).click()
  await expect(tabFase2(page)).toHaveAttribute('aria-selected', 'true')
})

test('E-06 navegación normal de fases con sus ejercicios y duración estimada', async ({ page }) => {
  await expect(page.getByText('Hoy: 8-12 min')).toBeVisible()

  await tabFase2(page).click()
  await expect(page.getByText('Puente corto')).toBeVisible()
  await expect(page.getByText('Hoy: 15-20 min')).toBeVisible()

  await tabFase3(page).click()
  await expect(page.getByText('Caminata progresiva')).toBeVisible()
  await expect(page.getByText('Hoy: 20-30 min')).toBeVisible()
})

test('E-07 checklist: contador, marcar rutina completa y reiniciar', async ({ page }) => {
  await expect(page.getByText('Hoy completaste 0 de 5')).toBeVisible()

  await page.getByRole('checkbox', { name: 'Hice mi calentamiento suave' }).click()
  await page.getByRole('checkbox', { name: 'Caminé un poco durante el día' }).click()
  await expect(page.getByText('Hoy completaste 2 de 5')).toBeVisible()

  await page.getByRole('button', { name: 'Marcar rutina completa' }).click()
  await expect(page.getByText('Hoy completaste 5 de 5')).toBeVisible()

  await page.getByRole('button', { name: 'Reiniciar checklist' }).click()
  await expect(page.getByText('Hoy completaste 0 de 5')).toBeVisible()
})

test('E-08 persistencia diaria: el registro sobrevive una recarga', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Hice mi calentamiento suave' }).click()
  await page.getByRole('checkbox', { name: 'Terminé sin quedar peor' }).click()
  const primerHecho = page.getByRole('checkbox', { name: 'Hecho' }).first()
  await primerHecho.click()
  await expect(page.getByText('Hoy completaste 2 de 5')).toBeVisible()

  await page.reload()

  await expect(page.getByText('Hoy completaste 2 de 5')).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Hice mi calentamiento suave' })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Terminé sin quedar peor' })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Hecho' }).first()).toBeChecked()
})

test('E-09 tarjeta de ejercicio: marcar "Hecho" y expandir detalles', async ({ page }) => {
  const primerHecho = page.getByRole('checkbox', { name: 'Hecho' }).first()
  await primerHecho.click()
  await expect(primerHecho).toBeChecked()

  await page.getByRole('button', { name: 'Ver más detalles' }).first().click()
  await expect(page.getByText('Subir suave, sin apretar hombros ni contener la respiración.')).toBeVisible()
})
