import { describe, expect, it } from 'vitest';
import * as API from '../../src/entities/API/index.js';

describe('API utilities', () => {
	it('exposes presentation units', () => {
		expect(API.presentationUnits).toEqual([
			'ml/ha',
			'gr/ha',
			'ml/100l',
			'gr/100l',
			'l/ha'
		]);
	});

	it('returns droplet size label and name by pressure', () => {
		const ranges = [
			{ label: 'M', from: 2, to: 4 },
			{ label: 'F', from: 4.1, to: 6 }
		];

		expect(API.getDropletSizeLabel(3, ranges)).toBe('M');
		expect(API.getDropletSizeName(3, ranges)).toBe('Medio');
		expect(API.getDropletSizeLabel(10, ranges)).toBeNull();
		expect(API.getDropletSizeName(10, ranges)).toBeNull();
	});
});

describe('API calculations', () => {
	it('computes QNom', () => {
		expect(API.computeQNom({ b: 1.5, c: 2, Pnom: 4 })).toBe(5.5);
	});

	it('computes Va, Pt, Vt, Qt, Qd, Qb, Qa', () => {
		const baseParams = {
			Pt: 4,
			Vt: 2,
			d: 0.5,
			Qnom: 1.2,
			Pnom: 4,
			Dp: 1
		};

		expect(API.computeVa(baseParams)).toBe(720);
		expect(API.computePt({ ...baseParams, Va: 720 })).toBe(4);
		expect(API.computeVt({ ...baseParams, Va: 720 })).toBe(2);
		expect(API.computeQt({ Qnom: 1.2, Pnom: 4, Pt: 9 })).toBe(1.8);
		expect(API.computeQd({ Dnu: 10, Cnu: 50, Dp: 2 })).toBe(10);
		expect(
			API.computeQb({ n: 4, Qnom: 1.2, Pnom: 4, Pt: 9, Dp: 1 })
		).toBe(7.2);
		expect(API.computeQa(baseParams)).toBe(720);
	});

	it('computes effective flow', () => {
		const result = API.computeEffectiveFlow({ c: 100, tms: 2000, Va: 3000 });
		expect(result).toEqual({ ef: 3000, s: 0, ok: true });
	});

	it('computes spray volume', () => {
		expect(API.computeSprayVolume({ Q: 1.2, d: 0.5, vel: 2 })).toBe(720);
	});

	it('computes dose and handles invalid params', () => {
		const result = API.computeDose({
			recolected: 50,
			work_velocity: 6,
			recolected_time: 30,
			work_width: 5,
			expected_dose: 60
		});

		expect(result.status).toBe('success');
		expect(result.dose).toBeCloseTo(2000, 5);
		expect(result.diffkg).toBeCloseTo(1940, 5);
		expect(result.diffp).toBeCloseTo(3233.3333, 2);

		const invalid = API.computeDose({ work_velocity: 2, recolected_time: 0 });
		expect(invalid.status).toBe('error');
		expect(invalid.wrong_keys).toContain('recolected_time');
	});

	it('computes density from recolected and handles invalid params', () => {
		const result = API.computeDensityFromRecolected({
			recolected: 200,
			pass_number: 2,
			tray_area: 0.5
		});

		expect(result).toEqual({ status: 'success', density: 2000 });

		const invalid = API.computeDensityFromRecolected({
			recolected: 200,
			pass_number: 0,
			tray_area: 0.5
		});

		expect(invalid.status).toBe('error');
		expect(invalid.wrong_keys).toContain('pass_number');
	});

	it('computes distribution profile and handles invalid params', () => {
		const result = API.computeDistributionProfile({
			tray_data: [10, 20, 30],
			tray_distance: 1,
			pass_number: 1,
			work_width: 3,
			work_pattern: 'lineal'
		});

		expect(result.status).toBe('success');
		expect(result.solidProfile).toEqual([10, 20, 30]);
		expect(result.avg).toBeCloseTo(20, 5);
		expect(result.dst).toBeCloseTo(10, 5);
		expect(result.cv).toBeCloseTo(50, 5);

		const invalid = API.computeDistributionProfile({
			tray_data: [],
			tray_distance: 1,
			pass_number: 1,
			work_width: 3,
			work_pattern: 'lineal'
		});

		expect(invalid.status).toBe('error');
		expect(invalid.wrongKeys).toBeTypeOf('string');
	});

	it('computes supplies list', () => {
		const result = API.computeSuppliesList({
			A: 100,
			T: 200,
			Va: 2,
			products: [
				{ name: 'Producto A', dose: 100, presentation: 0 }
			]
		});

		expect(result.Nc).toBeCloseTo(1, 5);
		expect(result.Ncc).toBe(1);
		expect(result.Vf).toBeCloseTo(0, 5);
		expect(result.Ncb).toBe(1);
		expect(result.Vcb).toBeCloseTo(200, 5);
		expect(result.Vftl).toBe(true);
		expect(result.pr).toHaveLength(1);
		expect(result.pr[0].cpp).toBeCloseTo(10, 5);
		expect(result.pr[0].cfc).toBeCloseTo(0, 5);
		expect(result.pr[0].ceq).toBeCloseTo(10, 5);
		expect(result.pr[0].total).toBeCloseTo(10, 5);
	});
});