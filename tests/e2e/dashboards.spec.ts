import { test, expect } from '@playwright/test'

test.describe('Portal Navigation & Security Guard Suite', () => {
  test('Unauthenticated user navigating to /dashboard is safely redirected to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL('**/login**')
    await expect(page).toHaveURL(/login/)
  })

  test('Unauthenticated user navigating to /faculty-dashboard is safely redirected to /login', async ({ page }) => {
    await page.goto('/faculty-dashboard')
    await page.waitForURL('**/login**')
    await expect(page).toHaveURL(/login/)
  })

  test('Unauthenticated user navigating to /hod-dashboard is safely redirected to /login', async ({ page }) => {
    await page.goto('/hod-dashboard')
    await page.waitForURL('**/login**')
    await expect(page).toHaveURL(/login/)
  })

  test('Unauthenticated user navigating to /admin/dashboard is safely redirected to /login', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForURL('**/login**')
    await expect(page).toHaveURL(/login/)
  })

  test('Public PWA and asset resources are healthy', async ({ request }) => {
    const iconRes = await request.get('/icon-192.png')
    expect(iconRes.status()).toBe(200)

    const manifestRes = await request.get('/manifest.json')
    expect(manifestRes.status()).toBe(200)

    const emblemRes = await request.get('/college-emblem.png')
    expect(emblemRes.status()).toBe(200)
  })
})
