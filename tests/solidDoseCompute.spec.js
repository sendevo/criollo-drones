import { test, expect } from '@playwright/test';
import { fillParams } from './setup';

test.describe('Solid Dose Computation', () => {

    const params = {
        product_type: "solid",
        lot_name: "Lote 1",
        work_area: 30,
        dose_solid: 80,
        work_width: 7,
        work_velocity: 30,
        flight_altitude: 5
    };
    
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173'); // Iniciar app
        await fillParams(page, params);
    });

    test('Should preview params', async ({ page }) => {
        // Verificar que los parámetros se muestran correctamente en el control
        
        await page.getByTestId('home-control-btn').click();
        await expect(page.getByTestId('solid-dose-preview')).toHaveText(`${params.dose_solid.toFixed(2)} kg/ha`);
        await expect(page.getByTestId('work-width-preview')).toHaveText(`${params.work_width} m`);
        await expect(page.getByTestId('work-velocity-preview')).toHaveText(`${params.work_velocity} m/s`);
    });
});
