import { expect, test } from '@playwright/test';
import type { Page } from 'playwright';

const getActiveElement = async (page: Page) => {
    const handle = await page.evaluateHandle(
        () => document.activeElement as HTMLElement
    );
    return handle.getAttribute('data-testid');
};

test('should do nothing until a context enters', async ({ page }) => {
    await page.goto('/docs/public/demo/focusTrapBehavior.html');

    expect(await getActiveElement(page)).toBe('body');
    await page.keyboard.down('Tab');
    expect(await getActiveElement(page)).toBe('button1');
    await page.keyboard.down('Tab');
    expect(await getActiveElement(page)).toBe('section1');
    await page.keyboard.down('Tab');
    expect(await getActiveElement(page)).toBe('video1');
    while ((await getActiveElement(page)) === 'video1') {
        await page.keyboard.down('Tab');
    }
    expect(await getActiveElement(page)).toBe('button2');
    await page.keyboard.down('Tab');
    expect(await getActiveElement(page)).toBe('section2');
    await page.keyboard.down('Tab');
    expect(await getActiveElement(page)).toBe('input1');
    await page.keyboard.down('Tab');
    expect(await getActiveElement(page)).toBe('input2');
    await page.keyboard.down('Tab');
    expect(await getActiveElement(page)).toBe('button3');
});

test('should should trap a context', async ({ page }) => {
    await page.goto('/docs/public/demo/focusTrapBehavior.html');

    await page.click('[data-testid="button1"]');
    expect(await getActiveElement(page)).toBe('video1');
    await page.keyboard.down('Tab');
    expect(await getActiveElement(page)).toBe('video1');
    await page.keyboard.down('Tab');
    expect(await getActiveElement(page)).toBe('video1');
    await page.keyboard.down('Tab');
    expect(await getActiveElement(page)).toBe('video1');
    await page.keyboard.down('Tab');
    expect(await getActiveElement(page)).toBe('video1');
    await page.keyboard.down('Tab');
    expect(await getActiveElement(page)).toBe('video1');
    await page.keyboard.down('Tab');
    expect(await getActiveElement(page)).toBe('video1');
    await page.keyboard.down('Tab');
    expect(await getActiveElement(page)).toBe('video1');
    await page.keyboard.down('Tab');
    expect(await getActiveElement(page)).toBe('video1');
    await page.keyboard.down('Tab');
    expect(await getActiveElement(page)).toBe('video1');
});

test('should leave context trap', async ({ page }) => {
    await page.goto('/docs/public/demo/focusTrapBehavior.html');

    await page.focus('[data-testid="button1"]');
    expect(await getActiveElement(page)).toBe('button1');
    await page.click('[data-testid="button1"]');
    expect(await getActiveElement(page)).toBe('video1');
    await page.keyboard.down('Escape');
    expect(await getActiveElement(page)).toBe('button1');
});

test('should focus container', async ({ page }) => {
    await page.goto('/docs/public/demo/focusTrapBehavior.html');

    await page.click('[data-testid="button2"]');
    expect(await getActiveElement(page)).toBe('section2');
    await page.keyboard.down('Tab');
    expect(await getActiveElement(page)).toBe('input1');
    await page.keyboard.down('Tab');
    expect(await getActiveElement(page)).toBe('input2');
    await page.keyboard.down('Tab');
    expect(await getActiveElement(page)).toBe('input1');
    await page.keyboard.down('Shift');
    await page.keyboard.down('Tab');
    expect(await getActiveElement(page)).toBe('input2');
    await page.keyboard.down('Tab');
    expect(await getActiveElement(page)).toBe('input1');
    await page.keyboard.down('Tab');
    expect(await getActiveElement(page)).toBe('input2');
});

test('should inert siblings', async ({ page }) => {
    await page.goto('/docs/public/demo/focusTrapBehavior.html');

    await page.click('[data-testid="button3"]');
    expect(await getActiveElement(page)).toBe('button4');
    expect(await page.locator('#article1').getAttribute('inert')).toBe('');
    await page.keyboard.down('Escape');
    expect(await page.locator('#article1').getAttribute('inert')).toBeNull();
});

test('should run lifecycle', async ({ page }) => {
    await page.goto('/docs/public/demo/focusTrapBehavior.html');

    await page.click('[data-testid="button3"]');
    const dialog = await page.locator('dialog');
    expect(await dialog.getAttribute('open')).toBe('');
    await page.keyboard.down('Escape');
    expect(await dialog.getAttribute('open')).toBeNull();
});
