import { test, expect } from '@playwright/test';

test('loadSolidParams', async ({ page }) => {
    
    await page.goto('http://localhost:5173'); // Iniciar app
    await page.getByTestId('home-params-btn').click(); // Ir a vista de parametros
    
    // Completar formulario
    await page.getByRole('textbox').click();
    await page.getByRole('textbox').fill('Lote 1');
    await page.getByTestId('input-work-area').getByRole('spinbutton').click();
    await page.getByTestId('input-work-area').getByRole('spinbutton').fill('30');
    await page.getByTestId('input-dose-solid').getByRole('spinbutton').click();
    await page.getByTestId('input-dose-solid').getByRole('spinbutton').fill('80');
    await page.getByTestId('input-work-width').getByRole('spinbutton').click();
    await page.getByTestId('input-work-width').getByRole('spinbutton').fill('7');
    await page.getByTestId('input-work-velocity').getByRole('spinbutton').click();
    await page.getByTestId('input-work-velocity').getByRole('spinbutton').fill('25');
    await page.getByTestId('input-flight-altitude').getByRole('spinbutton').click();
    await page.getByTestId('input-flight-altitude').getByRole('spinbutton').fill('3');
    await page.getByTestId('save-params-btn').click(); // No hace nada, solo muestra un toast
    await page.locator('[data-test-id="backbutton"]').click(); // Volver a home

    await page.getByTestId('home-control-btn').click(); // Ir a vista de control

    // Verificar que los parámetros se muestran correctamente en el control
    await expect(page.getByTestId('solid-dose-preview')).toHaveText('80.00 kg/ha');
    await expect(page.getByTestId('work-width-preview')).toHaveText('7 m');
    await expect(page.getByTestId('work-velocity-preview')).toHaveText('25 m/s');
});