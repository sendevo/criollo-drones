import { test, expect } from '@playwright/test';
import { fillParamsForm, fillValidationForm } from './setup.js';
import { uniformRandom, selectRandomFromArray } from '../../src/utils/index.js';
import * as API from '../../src/entities/API/index.js';

test.describe('Solid Validations', () => {

    const params = {
        product_type: "solid",
        lot_name: "Lote 1",
        work_area: uniformRandom(10, 50),
        dose_solid: uniformRandom(50, 100),
        work_width: selectRandomFromArray([5, 7, 10]),
        work_velocity: uniformRandom(5, 7),
        flight_altitude: selectRandomFromArray([3, 4, 5])
    };

    const validationParams = {
        timer_value: selectRandomFromArray([30, 60, 90]),
        collected_weight: uniformRandom(100, 500)
    };
    
    test.beforeEach(async ({ page }) => {
        await page.goto('/'); // Iniciar app
        await fillParamsForm(page, params);
    });


    test('Should preview params', async ({ page }) => {
        // Verificar que los parámetros se muestran correctamente en el control
        
        await page.getByTestId('home-control-btn').click();
        await expect(page.getByTestId('solid-dose-preview')).toHaveText(`${params.dose_solid.toFixed(2)} kg/ha`);
        await expect(page.getByTestId('work-width-preview')).toHaveText(`${params.work_width} m`);
        await expect(page.getByTestId('work-velocity-preview')).toHaveText(`${params.work_velocity} m/s`);
    });

    test('Should compute effective dose and difference', async ({ page }) => {
        // Verificar que se calcula la dosis efectiva y la diferencia con la dosis prevista
        await fillValidationForm(page, validationParams);
        await page.getByTestId('compute-dose-btn').click();

        // Verificar resultados
        await expect(page.getByTestId('solid-effective-dose-output')).toHaveText(/^\d+(\.\d{2})? kg\/ha$/);
        await expect(page.getByTestId('solid-dose-diff-output')).toHaveText(/^\d+(\.\d{2})? kg\/ha \(\d+(\.\d{2})?%\)$/);
    });
});
