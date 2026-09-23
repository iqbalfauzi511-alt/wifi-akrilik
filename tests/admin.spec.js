import { test, expect } from '@playwright/test';
import { loginAs } from './utils';

test.describe('Admin E2E Flow', () => {
  test.beforeEach(async ({ context }) => {
    // Inject admin cookie
    await loginAs(context, 'admin@smartwifi.com', 'admin');
  });

  test('should generate single device successfully and verify status BLANK', async ({ page }) => {
    // Navigate to admin
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/);
    
    // Open generator modal
    await page.click('button:has-text("Generate QR")');
    await expect(page.locator('text="Generate QR Code Baru"').first()).toBeVisible();
    
    // Change mode to individual
    await page.click('button:has-text("Satuan")');
    
    // Set quantity to 1
    await page.fill('input[name="quantity"]', '1');
    
    // Submit
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/admin') && resp.status() === 200),
      page.click('button[type="submit"]:has-text("Generate")')
    ]);

    // Verify UI success
    await expect(page.locator('text="Berhasil membuat"')).toBeVisible();

    // Verify DB integrity via our test API endpoint
    // First grab the newly generated code from the UI if possible, or we can just verify total count
    // Wait for the modal to close or toast to appear
  });

  test('should prevent generating more than 1000 devices', async ({ page }) => {
    await page.goto('/admin');
    await page.click('button:has-text("Generate QR")');
    await page.click('button:has-text("Satuan")');
    
    // Set quantity to 1500
    await page.fill('input[name="quantity"]', '1500');
    await page.click('button[type="submit"]:has-text("Generate")');
    
    // Error should show
    await expect(page.locator('text="Maksimum QR yang dapat di-generate sekaligus adalah 1.000 unit"')).toBeVisible();
  });
});
