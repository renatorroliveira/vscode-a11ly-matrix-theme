import { describe, expect, it } from 'vitest';
import { clamp, formatHex, isHexColor, parseHex } from '../scripts/color/hex.ts';

describe('parseHex', () => {
    it('parses six-digit colors as opaque', () => {
        expect(parseHex('#3994bc')).toEqual({ r: 0x39, g: 0x94, b: 0xbc, a: 1 });
    });

    it('parses eight-digit colors with alpha', () => {
        expect(parseHex('#ffffff80').a).toBeCloseTo(128 / 255, 6);
    });

    it('expands three and four digit shorthand', () => {
        expect(parseHex('#abc')).toEqual({ r: 0xaa, g: 0xbb, b: 0xcc, a: 1 });
        expect(parseHex('#abcf').a).toBe(1);
        expect(parseHex('#abc0').a).toBe(0);
    });

    it('is case insensitive', () => {
        expect(parseHex('#D4D4D4')).toEqual(parseHex('#d4d4d4'));
    });

    it('rejects malformed literals', () => {
        expect(() => parseHex('3994bc')).toThrow(RangeError);
        expect(() => parseHex('#12345')).toThrow(RangeError);
        expect(() => parseHex('#gggggg')).toThrow(RangeError);
    });
});

describe('formatHex', () => {
    it('omits alpha when opaque and lowercases output', () => {
        expect(formatHex({ r: 0xd4, g: 0xd4, b: 0xd4, a: 1 })).toBe('#d4d4d4');
    });

    it('appends alpha when translucent', () => {
        expect(formatHex({ r: 255, g: 255, b: 255, a: 0.5 })).toBe('#ffffff80');
    });

    it('rounds and clamps fractional channels', () => {
        expect(formatHex({ r: 255.4, g: -3, b: 300, a: 1 })).toBe('#ff00ff');
    });
});

describe('isHexColor and clamp', () => {
    it('validates hex literals', () => {
        expect(isHexColor('#fff')).toBe(true);
        expect(isHexColor('#00000000')).toBe(true);
        expect(isHexColor('white')).toBe(false);
    });

    it('clamps into range', () => {
        expect(clamp(5, 0, 1)).toBe(1);
        expect(clamp(-5, 0, 1)).toBe(0);
        expect(clamp(0.5, 0, 1)).toBe(0.5);
    });
});
