import { test, expect } from '@playwright/test';
import { fillParamsForm } from './setup.js';
import * as API from '../../src/entities/API/index.js';

// Parámetros fijos para calcular los resultados esperados
const WORK_AREA = 30;       // ha
const TANK_CAPACITY = 20;   // l
const DOSE_LIQUID = 20;     // l/ha (Va)
const GLYPHOSATE_DOSE = 20; // ml/ha
const GLYPHOSATE_PRESENTATION = 0; // ml/ha

// Calcular resultados esperados usando la misma API
const { Nc, Ncc, Vf, pr } = API.computeSuppliesList({
    A: WORK_AREA,
    T: TANK_CAPACITY,
    Va: DOSE_LIQUID,
    products: [{ name: 'glifosato', dose: GLYPHOSATE_DOSE, presentation: GLYPHOSATE_PRESENTATION }]
});

const formatNumber = (value, decimals = 2) => {
    const v = parseFloat(value);
    return v.toFixed(decimals).replace('.', ',');
};

const product = pr[0];

test.describe('Calculador de mezclas', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');

        // Configurar parámetros de aplicación (dosis líquida = Va)
        await fillParamsForm(page, {
            product_type: 'liquid',
            lot_name: 'Lote 1',
            work_area: WORK_AREA,
            dose_liquid: DOSE_LIQUID,
            work_width: 5,
            work_velocity: 5,
            flight_altitude: 3
        });
    });

    test('Cálculo de insumos y cargas muestra resultados correctos', async ({ page }) => {

        // Ir al calculador de mezclas
        await page.getByTestId('home-supplies-btn').click();

        // Completar formulario principal (lotName y workArea vienen pre-cargados del modelo)
        await page.getByTestId('input-tank-capacity').getByRole('spinbutton').click();
        await page.getByTestId('input-tank-capacity').getByRole('spinbutton').fill(TANK_CAPACITY.toString());

        // Agregar un producto
        await page.getByTestId('add-product-btn').click();

        await page.getByTestId('product-name-0').getByRole('textbox').click();
        await page.getByTestId('product-name-0').getByRole('textbox').fill('glifosato');

        await page.getByTestId('product-dose-0').getByRole('spinbutton').click();
        await page.getByTestId('product-dose-0').getByRole('spinbutton').fill(GLYPHOSATE_DOSE.toString());

        // La presentación ml/ha (index 0) es la opción por defecto, no hace falta cambiarla

        // Calcular
        await page.getByTestId('submit-supplies-btn').click();

        // Verificar que se navega a lista de insumos
        await expect(page.locator('text=Lista de insumos').first()).toBeVisible();

        // --- Parámetros de mezcla ---
        await expect(page.locator('td', { hasText: 'Lote 1' })).toBeVisible();
        await expect(page.locator('td', { hasText: `${WORK_AREA} ha` })).toBeVisible();
        await expect(page.locator('td', { hasText: `${formatNumber(DOSE_LIQUID)} l/ha` })).toBeVisible();
        await expect(page.locator('td', { hasText: `${TANK_CAPACITY} litros` })).toBeVisible();

        // Cantidad de cargas
        const expectedLoadsText = `${Ncc} carga(s) completa(s)${Vf > 0 ? ` y 1 fracción de carga de ${Math.round(Vf)} litros` : ''}`;
        await expect(page.getByTestId('supplies-loads-text')).toHaveText(expectedLoadsText);

        // --- Tabla de prescripción ---
        await expect(page.locator('td', { hasText: 'glifosato' }).first()).toBeVisible();
        await expect(page.locator('td', { hasText: `${formatNumber(GLYPHOSATE_DOSE)} ml/ha` })).toBeVisible();

        // --- Tabla de insumos (balanceo desactivado: muestra carga completa, fracción y total) ---
        await expect(page.locator('td', { hasText: `${formatNumber(product.cpp)} l` })).toBeVisible();
        await expect(page.locator('td', { hasText: `${formatNumber(product.total)} l` })).toBeVisible();
    });
});
