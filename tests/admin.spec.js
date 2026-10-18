import { test, expect } from '@playwright/test';
import { loginAs } from './utils';

test.describe('Admin E2E Flow', () => {
  test.beforeEach(async ({ context }) => {
    // Inject admin cookie
    await loginAs(context, '6285888159265', 'admin');
  });

  test('should generate single device successfully and verify status BLANK and persistence across reload/nav', async ({ page }) => {
    // Navigate to admin devices
    await page.goto('/admin/devices');
    await expect(page).toHaveURL(/\/admin\/devices/);
    
    // Open generator modal
    await page.getByTestId('admin-qr-generate-button').click();
    await expect(page.locator('text="Generate QR Code Baru"').first()).toBeVisible();
    
    // Change mode to individual
    await page.click('button:has-text("Satuan")');
    
    // Set quantity to 1
    await page.fill('input[name="quantity"]', '1');
    
    // Submit
    await page.click('button[type="submit"]:has-text("Generate")');

    // Verify UI success
    await expect(page.getByText('Berhasil membuat')).toBeVisible();

    // Verify Available (BLANK status) is displayed
    await expect(page.locator('span:visible', { hasText: 'Available' }).first()).toBeVisible();

    // Verify persistence after page reload (DB fetch via force-dynamic)
    await page.reload();
    await expect(page.locator('span:visible', { hasText: 'Available' }).first()).toBeVisible();

    // Verify persistence after navigation away and back
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/);
    await page.goto('/admin/devices');
    await expect(page).toHaveURL(/\/admin\/devices/);
    await expect(page.locator('span:visible', { hasText: 'Available' }).first()).toBeVisible();
  });

  test('should prevent generating invalid quantities (empty, 0, >1000)', async ({ page }) => {
    await page.goto('/admin/devices');
    await page.getByTestId('admin-qr-generate-button').click();
    await page.click('button:has-text("Satuan")');
    
    // Case 1: Empty quantity
    await page.fill('input[name="quantity"]', '');
    await page.click('button[type="submit"]:has-text("Generate")');
    await expect(page.getByText('Jumlah QR harus berupa angka bulat minimal 1.')).toBeVisible();

    // Case 2: Zero quantity
    await page.fill('input[name="quantity"]', '0');
    await page.click('button[type="submit"]:has-text("Generate")');
    await expect(page.getByText('Jumlah QR harus berupa angka bulat minimal 1.')).toBeVisible();

    // Case 3: Quantity > 1000
    await page.fill('input[name="quantity"]', '1500');
    await page.click('button[type="submit"]:has-text("Generate")');
    await expect(page.getByText('Maksimum QR yang dapat di-generate sekaligus adalah 1.000 unit')).toBeVisible();

    // Case 4: Modal stays open during error and error clears upon valid edit
    await page.fill('input[name="quantity"]', '1');
    await expect(page.getByText('Maksimum QR yang dapat di-generate sekaligus adalah 1.000 unit')).not.toBeVisible();
  });
});
