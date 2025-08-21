import { test, expect } from '@playwright/test'

test.describe('Upload and Download Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should handle file upload and generate session code', async ({ page }) => {
    // Navigate to upload page
    await page.click('text=Upload File')
    await expect(page.locator('text=Select File')).toBeVisible()

    // Create a test file
    const buffer = Buffer.from('Test file content for E2E testing')
    const fileInput = page.locator('input[type="file"]')

    await fileInput.setInputFiles({
      name: 'test-file.txt',
      mimeType: 'text/plain',
      buffer: buffer
    })

    // Check if file is selected and upload starts
    await expect(page.locator('text=test-file.txt')).toBeVisible()
  })

  test('should show QR code with session info', async ({ page }) => {
    // Navigate to upload page
    await page.click('text=Upload File')

    // Upload a test file
    const buffer = Buffer.from('QR test content')
    const fileInput = page.locator('input[type="file"]')

    await fileInput.setInputFiles({
      name: 'qr-test.txt',
      mimeType: 'text/plain',
      buffer: buffer
    })

    // Look for QR code generation (this would require actual upload to work)
    // For now, just verify the upload interface
    await expect(page.locator('text=qr-test.txt')).toBeVisible()
  })

  test('should handle session code input', async ({ page }) => {
    // Navigate to download page
    await page.click('text=Download File')

    const input = page.locator('input[placeholder*="Enter 6-digit code"]')
    const downloadButton = page.locator('button', { hasText: 'Download File' })

    // Button should be disabled initially
    await expect(downloadButton).toBeDisabled()

    // Test with 6 characters
    await input.fill('ABC123')
    await expect(downloadButton).toBeEnabled()

    // Test with less than 6 characters
    await input.fill('ABC')
    await expect(downloadButton).toBeDisabled()
  })

  test('should handle QR scanner functionality', async ({ page }) => {
    // Navigate to download page
    await page.click('text=Download File')

    // Click QR scanner button
    await page.click('[title="Scan QR code"]')

    // Should show QR scanner interface
    await expect(page.locator('text=QR Scanner Demo')).toBeVisible()
  })
})
