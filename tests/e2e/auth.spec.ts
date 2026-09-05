import { test, expect } from '@playwright/test'

test.describe('Authentication & Role Selection Suite', () => {
  test('Login page loads with correct branding and default student view', async ({ page }) => {
    await page.goto('/login')

    // Page title and branding
    await expect(page).toHaveTitle(/Digital Portal of AI&DS|VSB/)
    await expect(page.locator('text=Digital Portal of AI&DS').first()).toBeVisible()

    // Default student role is selected
    const registerInput = page.locator('input[placeholder*="Register"], input[placeholder*="9225"]')
    await expect(registerInput).toBeVisible()
  })

  test('Switching role tabs dynamically adapts input fields', async ({ page }) => {
    await page.goto('/login')

    // 1. Switch to Faculty
    const facultyTab = page.getByRole('button', { name: '📚 Faculty' })
    await facultyTab.click()
    await expect(page.getByText('Faculty Name')).toBeVisible()
    await expect(page.getByText('Login to Faculty Portal')).toBeVisible()

    // 2. Switch to Class Advisor
    const advisorTab = page.getByRole('button', { name: '🛡️ Advisor' })
    await advisorTab.click()
    await expect(page.getByText('Class Advisor Name')).toBeVisible()

    // 3. Switch to HOD
    const hodTab = page.getByRole('button', { name: '🏛️ HOD' })
    await hodTab.click()
    await expect(page.getByText('Head of Department')).toBeVisible()

    // 4. Switch to Admin
    const adminTab = page.getByRole('button', { name: '⚙️ Admin' })
    await adminTab.click()
    await expect(page.getByText('Administrator Email')).toBeVisible()
  })

  test('Invalid credentials show user-friendly Access Denied error', async ({ page }) => {
    await page.goto('/login')

    const facultyTab = page.getByRole('button', { name: '📚 Faculty' })
    await facultyTab.click()

    const nameInput = page.locator('input[placeholder*="Karthik"]').first()
    const passwordInput = page.locator('input[type="password"]').first()
    const submitBtn = page.getByRole('button', { name: 'Login to Faculty Portal' })

    await nameInput.fill('NonExistentFaculty_XYZ')
    await passwordInput.fill('WrongPassword123')
    await submitBtn.click()

    // Expect an Access Denied alert to appear
    await expect(page.getByText('Access Denied')).toBeVisible({ timeout: 8000 })
  })
})
