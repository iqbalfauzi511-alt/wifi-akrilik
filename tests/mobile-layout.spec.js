import { test, expect } from '@playwright/test';
import { signSessionPayload } from './utils';

const mobileViewports = [
  { name: 'Galaxy Fold (narrow)', width: 320, height: 653 },
  { name: 'Galaxy S8 / Android (360px)', width: 360, height: 740 },
  { name: 'iPhone SE (375px)', width: 375, height: 667 },
  { name: 'iPhone 13 / 14 (390px)', width: 390, height: 844 },
  { name: 'Pixel 5 (393px)', width: 393, height: 851 },
  { name: 'iPhone Pro Max (428px)', width: 428, height: 926 },
];

test.describe('Mobile Navigation & Settings Layout', () => {
  for (const vp of mobileViewports) {
    test(`Pengaturan and bottom nav are fully visible without cut-off on ${vp.name}`, async ({ context, page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      const token = signSessionPayload({
        email: 'distrapness@gmail.com',
        name: 'Administrator',
        role: 'admin',
      });

      await context.addCookies([
        {
          name: 'smartwifi_session',
          value: token,
          domain: 'localhost',
          path: '/',
        },
      ]);

      await page.goto('/admin/settings');
      await expect(page).toHaveURL(/\/admin\/settings/);

      // Verify no horizontal document overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(vp.width);

      // Check the bottom navigation bar
      const bottomNav = page.locator('nav[aria-label="Navigasi admin mobile"]');
      await expect(bottomNav).toBeVisible();

      const navBox = await bottomNav.boundingBox();
      expect(navBox).not.toBeNull();
      expect(navBox.x).toBeGreaterThanOrEqual(0);
      expect(navBox.x + navBox.width).toBeLessThanOrEqual(vp.width + 1); // 1px rounding tolerance

      // Verify all 6 links are inside viewport
      const items = [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Bisnis', href: '/admin/businesses' },
        { label: 'Perangkat', href: '/admin/devices' },
        { label: 'Keuangan', href: '/admin/finance' },
        { label: 'Pengguna', href: '/admin/users' },
        { label: 'Pengaturan', href: '/admin/settings' },
      ];

      for (const item of items) {
        const link = bottomNav.locator(`a[href="${item.href}"]`);
        await expect(link).toBeVisible();
        const box = await link.boundingBox();
        expect(box).not.toBeNull();
        // Check that item is within horizontal viewport
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1);
      }

      // Specifically check Pengaturan text element
      const pengaturanLink = bottomNav.locator('a[href="/admin/settings"]');
      const pengaturanText = pengaturanLink.locator('span');
      await expect(pengaturanText).toHaveText('Pengaturan');
      const textBox = await pengaturanText.boundingBox();
      expect(textBox).not.toBeNull();
      expect(textBox.x).toBeGreaterThanOrEqual(0);
      expect(textBox.x + textBox.width).toBeLessThanOrEqual(vp.width + 1);

      // Verify that scrolling to the bottom brings the last card into view above the bottom navigation
      const systemStatusCard = page.locator('text="Status Sistem"').first();
      await systemStatusCard.scrollIntoViewIfNeeded();
      await expect(systemStatusCard).toBeVisible();

      const cardBox = await systemStatusCard.boundingBox();
      expect(cardBox).not.toBeNull();
      // Ensure the top of the system status card is above the bottom nav
      expect(cardBox.y).toBeLessThan(navBox.y);
    });
  }

  test('All admin pages render properly on iPhone SE without horizontal overflow', async ({ context, page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const token = signSessionPayload({
      email: 'distrapness@gmail.com',
      name: 'Administrator',
      role: 'admin',
    });

    await context.addCookies([
      {
        name: 'smartwifi_session',
        value: token,
        domain: 'localhost',
        path: '/',
      },
    ]);

    const routes = [
      '/admin',
      '/admin/businesses',
      '/admin/devices',
      '/admin/finance',
      '/admin/users',
      '/admin/settings',
    ];

    for (const route of routes) {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(route));

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(375);

      const bottomNav = page.locator('nav[aria-label="Navigasi admin mobile"]');
      await expect(bottomNav).toBeVisible();
    }
  });
});


