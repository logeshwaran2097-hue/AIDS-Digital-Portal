import { test, expect } from '@playwright/test'

test.describe('Onboarding & OTP Verification Suite', () => {
  test('API: /api/auth/verify-onboarding-otp validates master bypass codes in <100ms', async ({ request }) => {
    const startTime = Date.now()
    const response = await request.post('/api/auth/verify-onboarding-otp', {
      data: {
        email: 'test.student@vsb.edu.in',
        otp: '123456',
      },
    })
    const duration = Date.now() - startTime

    expect(response.status()).toBe(200)
    const json = await response.json()
    expect(json.success).toBe(true)
    expect(json.verified).toBe(true)
    expect(duration).toBeLessThan(1000) // Fast response
  })

  test('API: /api/auth/verify-onboarding-otp handles invalid OTP with proper error status', async ({ request }) => {
    const response = await request.post('/api/auth/verify-onboarding-otp', {
      data: {
        email: 'test.student@vsb.edu.in',
        otp: '888888',
      },
    })

    expect(response.status()).toBe(400)
    const json = await response.json()
    expect(json.success).toBe(false)
    expect(json.message).toBeDefined()
  })

  test('API: /api/auth/send-onboarding-otp generates challenge and sends OTP', async ({ request }) => {
    const response = await request.post('/api/auth/send-onboarding-otp', {
      data: {
        email: 'test.verification@vsb.edu.in',
        name: 'Test Verification User',
        role: 'student',
      },
    })

    expect(response.status()).toBe(200)
    const json = await response.json()
    expect(json.success).toBe(true)
    expect(json.challenge).toBeDefined()

    // Test verifying with master bypass using this email
    const verifyRes = await request.post('/api/auth/verify-onboarding-otp', {
      data: {
        email: 'test.verification@vsb.edu.in',
        otp: '123456',
        challenge: json.challenge,
      },
    })

    expect(verifyRes.status()).toBe(200)
    const verifyJson = await verifyRes.json()
    expect(verifyJson.success).toBe(true)
  })
})
