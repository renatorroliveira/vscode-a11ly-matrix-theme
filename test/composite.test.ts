import { describe, expect, it } from 'vitest';
import { compositeOver, flattenHex } from '../scripts/color/composite.ts';

describe('compositeOver', () => {
    it('returns the source when opaque', () => {
        expect(compositeOver({ r: 10, g: 20, b: 30, a: 1 }, { r: 200, g: 200, b: 200 })).toEqual({
            r: 10,
            g: 20,
            b: 30,
        });
    });

    it('returns the backdrop when fully transparent', () => {
        expect(compositeOver({ r: 10, g: 20, b: 30, a: 0 }, { r: 200, g: 200, b: 200 })).toEqual({
            r: 200,
            g: 200,
            b: 200,
        });
    });

    it('interpolates linearly by alpha', () => {
        const result = compositeOver({ r: 255, g: 255, b: 255, a: 0.5 }, { r: 0, g: 0, b: 0 });
        expect(result.r).toBeCloseTo(127.5);
    });
});

describe('flattenHex', () => {
    it('flattens a translucent foreground onto an opaque background', () => {
        const result = flattenHex('#ffffff18', '#121314');
        expect(result.r).toBeCloseTo(18 + (255 - 18) * (0x18 / 255), 3);
    });

    it('flattens a translucent background onto black first', () => {
        const result = flattenHex('#ffffff', '#ffffff80');
        expect(result).toEqual({ r: 255, g: 255, b: 255 });
    });
});
