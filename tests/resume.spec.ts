import { test, expect } from '@playwright/test';

// Helper to create a draft via API
async function createDraftViaApi(requestContext, details = {}) {
  const newDraftRes = await requestContext.post('/api/drafts', {
    headers: { 'Content-Type': 'application/json' } 
  });
  const { draftId } = await newDraftRes.json();
  
  // Update it with some answers
  await requestContext.patch(`/api/drafts/${draftId}`, {
    data: {
      answers: {
        product: {
          product_name: details.product_name || 'Automated Test Product',
          businessLegalName: 'Test Biz LLC'
        }
      }
    }
  });
  
  return { id: draftId };
}

test.describe('Resume Functionality', () => {

  test('Resume button restores draft state', async ({ page, request }) => {
    // 1. Create Draft
    const draft = await createDraftViaApi(request, { product_name: 'Test Burger' });
    
    // 2. Go to Dashboard (Auth assumed via global setup or session restoration)
    // Note: If auth is needed, this test assumes valid session state.
    await page.goto('/dashboard');
    
    // 3. Click Resume
    await page.click(`a[href*="${draft.id}"]`);
    
    // 4. Verify Loading & Content
    await expect(page.getByText('Loading your plan')).toBeVisible();
    await expect(page.getByDisplayValue('Test Burger')).toBeVisible();
    await expect(page.url()).toContain(`draft=${draft.id}`);
  });

  test('Invalid draft ID shows error UI', async ({ page }) => {
    await page.goto('/builder?draft=00000000-0000-0000-0000-000000000000'); // Valid UUID format but fake
    await expect(page.getByText('Unable to Load Draft')).toBeVisible();
    await expect(page.getByText('Describe Your Product')).toBeHidden(); 
  });

  test('Logged out resume redirects correctly', async ({ page, request }) => {
     // 1. Create a draft as a user (simulated) or just use a known ID
     // For this test, we just need the URL pattern to work.
     const fakeId = '123e4567-e89b-12d3-a456-426614174000';
     const targetUrl = `/builder?draft=${fakeId}`;

     // 2. Clear cookies to ensure logged out
     await page.context().clearCookies();

     // 3. Visit Builder with Draft ID
     await page.goto(targetUrl);

     // 4. Expect Redirect to Login with Next param
     await expect(page).toHaveURL(/\/login/);
     const url = new URL(page.url());
     const nextParam = decodeURIComponent(url.searchParams.get('next') || '');
     expect(nextParam).toBe(targetUrl);
  });

  test('Refresh persistence works', async ({ page, request }) => {
     const draft = await createDraftViaApi(request, { product_name: 'Persistent Burger' });
     
     await page.goto(`/builder?draft=${draft.id}`);
     await expect(page.getByDisplayValue('Persistent Burger')).toBeVisible();

     // Reload
     await page.reload();
     await expect(page.getByText('Loading your plan')).toBeVisible();
     await expect(page.getByDisplayValue('Persistent Burger')).toBeVisible();
  });

});