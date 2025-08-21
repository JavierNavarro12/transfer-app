import { test, expect } from '@playwright/test'

test.describe('TransferApp E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the main page', async ({ page }) => {
    await expect(page).toHaveTitle(/TransferApp/)
    await expect(page.locator('h1:has-text("TransferApp")')).toBeVisible()
  })

  test('should show upload and download options', async ({ page }) => {
    await expect(page.locator('text=Send File')).toBeVisible()
    await expect(page.locator('text=Receive File')).toBeVisible()
  })

  test('should navigate to upload page', async ({ page }) => {
    await page.click('text=Upload File')
    await expect(page.locator('text=Select File')).toBeVisible()
  })

  test('should navigate to download page', async ({ page }) => {
    await page.click('text=Download File')
    await expect(page.locator('text=Enter the 6-digit code')).toBeVisible()
    await expect(page.locator('input[placeholder*="Enter 6-digit code"]')).toBeVisible()
  })

  test('should show QR scanner on download page', async ({ page }) => {
    await page.click('text=Download File')
    await page.click('[title="Scan QR code"]')
    await expect(page.locator('text=QR Scanner Demo')).toBeVisible()
  })

  test('should validate session code input', async ({ page }) => {
    await page.click('text=Download File')

    const input = page.locator('input[placeholder*="Enter 6-digit code"]')

    // Test that button is disabled initially
    const downloadButton = page.locator('button', { hasText: 'Download File' })
    await expect(downloadButton).toBeDisabled()

    // Enter 6 characters
    await input.fill('ABC123')
    await expect(downloadButton).toBeEnabled()

    // Test uppercase conversion
    await input.fill('abc123')
    await expect(input).toHaveValue('ABC123')

    // Test max length
    await input.fill('ABCDEFGHIJ')
    await expect(input).toHaveValue('ABCDEF') // Only 6 characters
  })

  test('should show features section on home page', async ({ page }) => {
    await expect(page.locator('text=Why Choose TransferApp?')).toBeVisible()
    await expect(page.locator('h3:has-text("End-to-End Encryption")')).toBeVisible()
    await expect(page.locator('h3:has-text("Lightning Fast")')).toBeVisible()
    await expect(page.locator('h3:has-text("PWA Support")')).toBeVisible()
  })
})
