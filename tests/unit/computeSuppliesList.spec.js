import { describe, expect, it } from 'vitest';
import { computeSuppliesList } from '../../src/entities/API/index.js';
import { PRODUCT_TYPES } from '../../src/entities/Model/index.js';

const getProduct = (result, name) => result.pr.find(prod => prod.name === name);

describe('computeSuppliesList', () => {
    it('uses ceil for balanced loads and does not add an extra load on exact division', () => {
        const result = computeSuppliesList({
            A: 60,
            Va: 9,
            T: 45,
            productType: PRODUCT_TYPES.SOLID,
            products: [{ name: 'Producto', dose: 1, presentation: 0 }]
        });

        expect(result.Nc).toBeCloseTo(12, 8);
        expect(result.Ncb).toBe(12);
        expect(result.Ncc).toBe(12);
        expect(result.Vf).toBeCloseTo(0, 8);
    });

    it('computes unbalanced and balanced loads for fractional totals', () => {
        const result = computeSuppliesList({
            A: 25,
            Va: 80,
            T: 300,
            productType: PRODUCT_TYPES.SOLID,
            products: [{ name: 'Producto', dose: 20, presentation: 0 }]
        });

        expect(result.totalApplication).toBeCloseTo(2000, 8);
        expect(result.Ncc).toBe(6);
        expect(result.Vf).toBeCloseTo(200, 8);
        expect(result.Ncb).toBe(7);
        expect(result.Vcb).toBeCloseTo(2000 / 7, 8);
    });

    it('computes solid product totals from area x dose and load quantities from equivalent area', () => {
        const result = computeSuppliesList({
            A: 25,
            Va: 80,
            T: 300,
            productType: PRODUCT_TYPES.SOLID,
            products: [{ name: 'Fertilizante', dose: 20, presentation: 0 }]
        });

        const fertilizer = getProduct(result, 'Fertilizante');
        expect(fertilizer.total).toBeCloseTo(500, 8);
        expect(fertilizer.cpp).toBeCloseTo(75, 8);
        expect(fertilizer.cfc).toBeCloseTo(50, 8);
        expect(fertilizer.ceq).toBeCloseTo((2000 / 7) * 20 / 80, 8);
    });

    it('keeps solid physical mass and computes package counts as secondary values', () => {
        const result = computeSuppliesList({
            A: 25,
            Va: 80,
            T: 300,
            productType: PRODUCT_TYPES.SOLID,
            products: [{ name: 'Fertilizante en bolsa', dose: 20, presentation: 25 }]
        });

        const fertilizer = getProduct(result, 'Fertilizante en bolsa');
        expect(fertilizer.total).toBeCloseTo(500, 8);
        expect(fertilizer.totalPackages).toBeCloseTo(20, 8);
        expect(fertilizer.cppPackages).toBeCloseTo(3, 8);
        expect(fertilizer.cfcPackages).toBeCloseTo(2, 8);
    });

    it('computes liquid ml/ha products', () => {
        const result = computeSuppliesList({
            A: 10,
            Va: 100,
            T: 200,
            productType: PRODUCT_TYPES.LIQUID,
            products: [{ name: 'ML_HA', dose: 200, presentation: 0 }]
        });

        const product = getProduct(result, 'ML_HA');
        expect(product.cpp).toBeCloseTo(0.4, 8);
        expect(product.total).toBeCloseTo(2, 8);
    });

    it('computes liquid ml/100l products', () => {
        const result = computeSuppliesList({
            A: 10,
            Va: 100,
            T: 200,
            productType: PRODUCT_TYPES.LIQUID,
            products: [{ name: 'ML_100L', dose: 150, presentation: 2 }]
        });

        const product = getProduct(result, 'ML_100L');
        expect(product.cpp).toBeCloseTo(0.3, 8);
        expect(product.total).toBeCloseTo(1.5, 8);
    });

    it('computes liquid g/ha products', () => {
        const result = computeSuppliesList({
            A: 10,
            Va: 100,
            T: 200,
            productType: PRODUCT_TYPES.LIQUID,
            products: [{ name: 'G_HA', dose: 300, presentation: 1 }]
        });

        const product = getProduct(result, 'G_HA');
        expect(product.cpp).toBeCloseTo(0.6, 8);
        expect(product.total).toBeCloseTo(3, 8);
    });

    it('computes liquid g/100l products', () => {
        const result = computeSuppliesList({
            A: 10,
            Va: 100,
            T: 200,
            productType: PRODUCT_TYPES.LIQUID,
            products: [{ name: 'G_100L', dose: 250, presentation: 3 }]
        });

        const product = getProduct(result, 'G_100L');
        expect(product.cpp).toBeCloseTo(0.5, 8);
        expect(product.total).toBeCloseTo(2.5, 8);
    });

    it('computes liquid l/ha products', () => {
        const result = computeSuppliesList({
            A: 10,
            Va: 100,
            T: 200,
            productType: PRODUCT_TYPES.LIQUID,
            products: [{ name: 'L_HA', dose: 1.2, presentation: 4 }]
        });

        const product = getProduct(result, 'L_HA');
        expect(product.cpp).toBeCloseTo(2.4, 8);
        expect(product.total).toBeCloseTo(12, 8);
    });

    it('computes water as residual liquid volume only', () => {
        const result = computeSuppliesList({
            A: 10,
            Va: 100,
            T: 200,
            productType: PRODUCT_TYPES.LIQUID,
            products: [
                { name: 'Herbicida', dose: 200, presentation: 0 },
                { name: 'Coadyuvante solido', dose: 300, presentation: 1 }
            ]
        });

        const water = result.pr.find(prod => prod.isWater);
        expect(water.cpp).toBeCloseTo(199.6, 8);
        expect(water.total).toBeCloseTo(998, 8);
    });

    it('keeps total product quantity invariant across balancing strategies', () => {
        const result = computeSuppliesList({
            A: 25,
            Va: 80,
            T: 300,
            productType: PRODUCT_TYPES.SOLID,
            products: [{ name: 'Producto', dose: 20, presentation: 0 }]
        });

        const product = getProduct(result, 'Producto');
        const unbalancedTotal = product.cpp * result.Ncc + product.cfc;
        const balancedTotal = product.ceq * result.Ncb;

        expect(product.total).toBeCloseTo(500, 8);
        expect(unbalancedTotal).toBeCloseTo(product.total, 8);
        expect(balancedTotal).toBeCloseTo(product.total, 8);
    });
});
