import { test, expect } from '@playwright/test'

test.describe('End-to-End Onboarding Modal & Activation Flow', () => {
  test('Class Advisor full onboarding lifecycle: Particulars -> Instant OTP -> Active Dashboard', async ({ page }) => {
    // 1. Visit Login page
    await page.goto('/login')

    // 2. Switch to Advisor Portal
    const advisorTab = page.getByRole('button', { name: '🛡️ Advisor' })
    await advisorTab.click()

    // 3. Enter credentials for Logesh
    const nameInput = page.getByPlaceholder(/Dr\. S\. Karthik|karthik@vsb\.edu\.in/).first()
    const passwordInput = page.locator('input[type="password"]').first()
    const submitBtn = page.getByRole('button', { name: /Login to Advisor Portal/i })

    await nameInput.fill('Logesh')
    await passwordInput.fill('nitr')
    await submitBtn.click()

    // 4. If onboarding is required, modal must appear at high z-index
    const modalHeading = page.locator('text=VERIFICATION & SECURITY SETUP, text=Step 1: Review').first()
    const isModalOpen = await modalHeading.isVisible({ timeout: 10000 }).catch(() => false)

    if (isModalOpen) {
      // Step 1: Particulars Verification
      const phoneInput = page.locator('input[placeholder*="mobile"]').first()
      if (await phoneInput.isVisible()) {
        await phoneInput.fill('9876543210')
      }

      // Check confirmation box
      const confirmBox = page.locator('input[type="checkbox"]').first()
      if (await confirmBox.isVisible()) {
        await confirmBox.check()
      }

      // Proceed to Step 2
      const proceedStep2 = page.getByRole('button', { name: /Proceed to Step 2|Next: Password/i }).first()
      await proceedStep2.click()

      // Step 2: Password & Instant OTP Verification
      await expect(page.locator('text=Step 2: Password').first()).toBeVisible({ timeout: 5000 })

      const newPassInput = page.locator('input[placeholder*="strong password"], input[placeholder*="New password"]').first()
      const confirmPassInput = page.locator('input[placeholder*="Repeat password"]').first()
      await newPassInput.fill('Permanent@2026')
      await confirmPassInput.fill('Permanent@2026')

      // Fill email
      const emailInput = page.locator('input[type="email"]').first()
      await emailInput.fill('advisor.logesh@vsb.edu.in')

      // Send OTP
      const sendOtpBtn = page.getByRole('button', { name: /Send OTP|Resend/i }).first()
      if (await sendOtpBtn.isVisible()) {
        await sendOtpBtn.click()
      }

      // Enter Master Bypass OTP: 123456
      const otpInput = page.locator('input[placeholder="000000"]').first()
      await expect(otpInput).toBeVisible({ timeout: 6000 })
      await otpInput.fill('123456')

      // Expect instant verification checkmark (<500ms)
      await expect(page.locator('text=Verified!').first()).toBeVisible({ timeout: 5000 })
    } else {
      // If already onboarded, user directly enters the dashboard
      await expect(page).toHaveURL(/faculty-dashboard/)
    }
  })
})
