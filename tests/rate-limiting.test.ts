/**
 * Rate Limiting, Serverless Shared Store, and Paid API Quotas Test Suite
 */
import { checkRateLimit, rateLimitResponse, checkApiUsageQuota, quotaExceededResponse, getClientIp } from '../src/lib/rateLimit'
import { prisma } from '../src/lib/prisma'

function mockRequest(ip: string, headers: Record<string, string> = {}) {
  return new Request('https://portal.vsb.ac.in/api/test', {
    method: 'POST',
    headers: new Headers({
      'x-forwarded-for': ip,
      'content-type': 'application/json',
      ...headers,
    }),
  })
}

async function runTests() {
  console.log('\n🔒 RUNNING DISTRIBUTED RATE LIMITING & PAID API QUOTA TEST SUITE...\n')
  let passed = 0
  let failed = 0

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`)
      passed++
    } else {
      console.error(`  ✗ FAIL: ${testName}`)
      failed++
    }
  }

  try {
    // Clean up test keys
    const testPrefix = `test_rl_${Date.now()}`
    await prisma.rateLimit.deleteMany({
      where: { key: { contains: testPrefix } },
    }).catch(() => {})

    // TEST 1: Client IP Extraction
    {
      const req1 = mockRequest('203.0.113.195, 70.41.3.18')
      const extractedIp = getClientIp(req1)
      assert(extractedIp === '203.0.113.195', 'Client IP correctly parsed from multi-hop x-forwarded-for header')

      const req2 = new Request('https://test.com', {
        headers: new Headers({ 'cf-connecting-ip': '198.51.100.42' }),
      })
      assert(getClientIp(req2) === '198.51.100.42', 'Client IP correctly parsed from Cloudflare cf-connecting-ip header')
    }

    // TEST 2: IP-based Rate Limiting & Threshold Trigger
    {
      const testIp = '192.0.2.1'
      const endpoint = `${testPrefix}_ip_test`
      const limit = 3
      const windowSeconds = 60

      let finalResult: any = null
      for (let i = 1; i <= limit + 1; i++) {
        const req = mockRequest(testIp)
        finalResult = await checkRateLimit(req, limit, windowSeconds, endpoint)
      }

      assert(!finalResult.allowed, `Exceeding IP limit (${limit} requests) triggers rate limit (allowed=false)`)
      assert(finalResult.type === 'ip', 'Triggered limit is classified as IP type')
      assert(finalResult.retryAfter > 0, `Returns valid retryAfter seconds (${finalResult.retryAfter}s)`)

      // Verify HTTP 429 response structure
      const response = rateLimitResponse(finalResult)
      assert(response.status === 429, 'Returns HTTP 429 Too Many Requests status')
      assert(response.headers.get('Retry-After') !== null, 'Includes standard Retry-After header')
      assert(response.headers.get('X-RateLimit-Limit') === String(limit), 'Includes standard X-RateLimit-Limit header')
      assert(response.headers.get('X-RateLimit-Remaining') === '0', 'Includes standard X-RateLimit-Remaining: 0 header')
    }

    // TEST 3: User/Account-based Rate Limiting Across Multiple IPs (Distributed Attack Protection)
    {
      const endpoint = `${testPrefix}_user_test`
      const targetUser = `student_${Date.now()}@vsb.ac.in`
      const limit = 2
      const windowSeconds = 60

      // Attacker switches IP for every request targeting the same user account
      const req1 = mockRequest('198.51.100.1')
      const res1 = await checkRateLimit(req1, limit, windowSeconds, endpoint, targetUser)
      assert(res1.allowed, 'First request for user is allowed')

      const req2 = mockRequest('198.51.100.2')
      const res2 = await checkRateLimit(req2, limit, windowSeconds, endpoint, targetUser)
      assert(res2.allowed, 'Second request from different IP is allowed within limit')

      const req3 = mockRequest('198.51.100.3')
      const res3 = await checkRateLimit(req3, limit, windowSeconds, endpoint, targetUser)
      assert(!res3.allowed, 'Third request targeting same user is BLOCKED even with a fresh IP address')
      assert(res3.type === 'user', 'Blocked request is correctly identified as user-level breach')
    }

    // TEST 4: Shared Store Persistence in PostgreSQL (Serverless Cross-Instance Coordination)
    {
      const testIp = '198.51.100.77'
      const endpoint = `${testPrefix}_shared_store`
      const req = mockRequest(testIp)

      await checkRateLimit(req, 5, 300, endpoint)

      // Query database directly to prove state is written to persistent PostgreSQL, not local process memory
      const dbRecord = await prisma.rateLimit.findUnique({
        where: { key: `rl:ip:${endpoint}:${testIp}` },
      })

      assert(dbRecord !== null, 'Rate limit state is persisted in shared PostgreSQL table for serverless lambdas')
      assert(dbRecord?.count === 1, 'Counter in shared database accurately reflects request count')
    }

    // TEST 5: Hard Monthly Spend Cap / Usage Quota for Paid APIs
    {
      const testService = 'gemini_ai'
      const currentPeriod = new Date().toISOString().slice(0, 7)

      // Clean test quota
      await prisma.apiUsageQuota.deleteMany({
        where: { service: testService, period: currentPeriod },
      }).catch(() => {})

      // Set low hard limit for testing
      await prisma.apiUsageQuota.create({
        data: {
          service: testService,
          period: currentPeriod,
          usedCount: 4,
          hardLimit: 5,
        },
      })

      // 1 allowed request
      const allowedCheck = await checkApiUsageQuota(testService, 1, 5)
      assert(allowedCheck.allowed, 'Request within monthly budget cap is allowed')
      assert(allowedCheck.usedCount === 5, `Used count incremented to ${allowedCheck.usedCount}/${allowedCheck.hardLimit}`)

      // Exceeding request
      const blockedCheck = await checkApiUsageQuota(testService, 1, 5)
      assert(!blockedCheck.allowed, 'Request exceeding hard monthly spending cap is immediately BLOCKED')

      // Verify HTTP 429 quota response
      const quotaRes = quotaExceededResponse(testService, blockedCheck.hardLimit, blockedCheck.period)
      assert(quotaRes.status === 429, 'Returns HTTP 429 for monthly quota exceeded')
      const resBody = await quotaRes.json()
      assert(resBody.error === 'Monthly Quota Exceeded', 'Returns clear Monthly Quota Exceeded error message')

      // Clean up test quota record
      await prisma.apiUsageQuota.deleteMany({
        where: { service: testService, period: currentPeriod },
      }).catch(() => {})
    }

    // TEST 6: Repeated Violation Security Logging in AuditLog
    {
      const testIp = '203.0.113.88'
      const endpoint = `${testPrefix}_security_violation`
      const user = 'attacker@malicious.com'

      // Clean past audit logs for test
      await prisma.auditLog.deleteMany({
        where: { userName: user },
      }).catch(() => {})

      // Trigger violation multiple times
      for (let i = 0; i < 4; i++) {
        const req = mockRequest(testIp)
        await checkRateLimit(req, 1, 60, endpoint, user)
      }

      // Check AuditLog
      const auditEntry = await prisma.auditLog.findFirst({
        where: {
          action: 'RATE_LIMIT_EXCEEDED',
          userName: user,
        },
        orderBy: { createdAt: 'desc' },
      })

      assert(auditEntry !== null, 'Security violation is automatically recorded in AuditLog table')
      assert(auditEntry?.module === 'SECURITY', 'Violation categorized under SECURITY module')
      assert(auditEntry?.status === 'blocked', 'Violation status logged as blocked')

      // Clean up audit entry
      await prisma.auditLog.deleteMany({
        where: { userName: user },
      }).catch(() => {})
    }

    // TEST 7: Authentication Endpoints Protected
    {
      const studentLoginReq = new Request('https://portal.vsb.ac.in/api/auth/student', {
        method: 'POST',
        headers: new Headers({
          'x-forwarded-for': '198.51.100.99',
          'content-type': 'application/json',
        }),
        body: JSON.stringify({ registerNumber: 'INVALID_REG_NO_TEST', password: 'wrong' }),
      })

      // Simulate 6 rapid failed attempts on auth endpoint
      let blockedResponse: any = null
      for (let i = 0; i < 6; i++) {
        const res = await checkRateLimit(studentLoginReq, 5, 60, 'auth:student', 'INVALID_REG_NO_TEST')
        if (!res.allowed) {
          blockedResponse = rateLimitResponse(res)
          break
        }
      }

      assert(blockedResponse !== null && blockedResponse.status === 429, 'Authentication endpoint rate limit returns HTTP 429 after 5 failed attempts')
    }

    // Cleanup test keys
    await prisma.rateLimit.deleteMany({
      where: { key: { contains: testPrefix } },
    }).catch(() => {})

  } catch (err: any) {
    console.error('Test execution exception:', err)
    failed++
  }

  console.log('\n========================================')
  console.log(`TOTAL TESTS: ${passed + failed}`)
  console.log(`PASSED: ${passed}`)
  console.log(`FAILED: ${failed}`)
  console.log('========================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runTests().catch((e) => {
  console.error(e)
  process.exit(1)
})
