import { test, expect } from '@playwright/test';

test('Invalid draft ID shows error', async ({ page }) => {
  await page.goto('/builder?draft=bad-id');

  // Spinner should NOT hang forever:
  await expect(page.getByText(/Loading your plan/i)).toBeVisible();
  await expect(page.getByText(/Loading your plan/i)).toBeHidden({ timeout: 15000 });

  await expect(page.getByText('Unable to Load Draft')).toBeVisible();
  await expect(page.getByText('Describe Your Product')).toBeHidden(); // Ensure builder didn't load
});

test('Logged out resume redirects back and does not hang', async ({ page }) => {
  // Replace with a real UUID created by helper if available; this test mainly asserts non-hanging redirect flow.
  const draftId = '00000000-0000-4000-8000-000000000000';
  await page.context().clearCookies();
  await page.goto(`/builder?draft=${draftId}`);

  // Should go to login with next param
  await expect(page).toHaveURL(/\/login\?next=/);
});
