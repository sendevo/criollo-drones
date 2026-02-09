export async function fillParams(page, params) { // Completar formulario de parámetros sólidos

    const {
        product_type,
        lot_name,
        work_area,
        dose_solid,
        work_width,
        work_velocity,
        flight_altitude
    } = params;

    await page.getByTestId('home-params-btn').click(); // Ir a vista de parametros

    if(product_type === "solid"){
        await page.locator('[data-test-id="product-type-solid-radio"] i').click();
    } else {
        await page.locator('[data-test-id="product-type-liquid-radio"] i').click();
    }
    await page.getByRole('textbox').click();
    await page.getByRole('textbox').fill(lot_name);
    await page.getByTestId('input-work-area').getByRole('spinbutton').click();
    await page.getByTestId('input-work-area').getByRole('spinbutton').fill(work_area.toString());
    await page.getByTestId('input-dose-solid').getByRole('spinbutton').click();
    await page.getByTestId('input-dose-solid').getByRole('spinbutton').fill(dose_solid.toString());
    await page.getByTestId('input-work-width').getByRole('spinbutton').click();
    await page.getByTestId('input-work-width').getByRole('spinbutton').fill(work_width.toString());
    await page.getByTestId('input-work-velocity').getByRole('spinbutton').click();
    await page.getByTestId('input-work-velocity').getByRole('spinbutton').fill(work_velocity.toString());
    await page.getByTestId('input-flight-altitude').getByRole('spinbutton').click();
    await page.getByTestId('input-flight-altitude').getByRole('spinbutton').fill(flight_altitude.toString());
    await page.getByTestId('save-params-btn').click(); // No hace nada, solo muestra un toast
    await page.locator('[data-test-id="backbutton"]').click(); // Volver a home
};