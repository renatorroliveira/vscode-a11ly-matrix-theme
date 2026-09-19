/**
 * Evaluates the theme against the curated contrast pairs, the syntax token
 * foregrounds and the distinguishability groups.
 * @module
 */

import type { ColorTheme, TokenColorRule } from '../../src/types.ts';
import {
    classifyContrast,
    type ConformanceLevel,
    type ContentKind,
    contrastRatio,
    maximumRatio,
    minimumRatio,
    withinBand,
} from '../color/contrast.ts';
import { deltaE, simulateCvd, type CvdType } from '../color/cvd.ts';
import { flattenHex } from '../color/composite.ts';
import { parseHex } from '../color/hex.ts';
import type { Rgb } from '../color/types.ts';
import { CONTRAST_PAIRS, DISTINGUISHABLE_GROUPS, type ContrastPair } from '../pairs.ts';

/** Outcome of one pair measurement. */
export interface PairResult {
    readonly pair: ContrastPair;
    readonly foregroundHex: string | undefined;
    readonly backgroundHex: string | undefined;
    readonly ratio: number;
    readonly required: number;
    readonly maximum: number;
    readonly level: ConformanceLevel;
    readonly status: 'pass' | 'fail' | 'missing';
}

/** Outcome of one syntax token rule measurement against the editor background. */
export interface TokenResult {
    readonly index: number;
    readonly scope: string;
    readonly foregroundHex: string;
    readonly ratio: number;
    readonly required: number;
    readonly maximum: number;
    readonly status: 'pass' | 'fail';
}

/** Smallest perceptual distance found inside a group, per vision type. */
export interface DistinguishabilityResult {
    readonly group: string;
    readonly vision: 'normal' | CvdType;
    readonly closestPair: readonly [string, string];
    readonly deltaE: number;
    readonly status: 'ok' | 'warn';
}

/** Full audit outcome. */
export interface AuditResult {
    readonly pairs: readonly PairResult[];
    readonly tokens: readonly TokenResult[];
    readonly groups: readonly DistinguishabilityResult[];
    readonly failures: number;
}

const TOKEN_KIND: ContentKind = 'text';
const DELTA_E_WARN_THRESHOLD = 10;
const VISION_TYPES: readonly ('normal' | CvdType)[] = ['normal', 'protanopia', 'deuteranopia', 'tritanopia'];

/**
 * Runs every check against a theme document.
 * @param theme The theme to audit.
 * @returns Measurements and the number of hard failures.
 */
export function evaluateTheme(theme: ColorTheme): AuditResult {
    const pairs = CONTRAST_PAIRS.map((pair) => evaluatePair(theme, pair));
    const tokens = evaluateTokens(theme);
    const groups = evaluateGroups(theme);
    const failures =
        pairs.filter((result) => result.status !== 'pass').length +
        tokens.filter((result) => result.status === 'fail').length;
    return { pairs, tokens, groups, failures };
}

/**
 * Resolves the opaque background a pair renders on, compositing translucent
 * overlays onto their backdrop.
 * @param theme Theme providing the colors.
 * @param pair Pair whose background to resolve.
 * @returns Opaque background, or undefined when a key is missing.
 */
export function resolveBackground(theme: ColorTheme, pair: ContrastPair): Rgb | undefined {
    const background = theme.colors[pair.background];
    if (background === undefined) {
        return undefined;
    }
    const backdrop = pair.backdrop === undefined ? undefined : theme.colors[pair.backdrop];
    if (pair.backdrop !== undefined && backdrop === undefined) {
        return undefined;
    }
    return flattenHex(background, backdrop ?? '#000000');
}

function evaluatePair(theme: ColorTheme, pair: ContrastPair): PairResult {
    const foregroundHex = theme.colors[pair.foreground];
    const backgroundHex = theme.colors[pair.background];
    const background = resolveBackground(theme, pair);
    const required = minimumRatio(pair.kind);
    const maximum = maximumRatio(pair.kind);
    if (foregroundHex === undefined || backgroundHex === undefined || background === undefined) {
        return { pair, foregroundHex, backgroundHex, ratio: 0, required, maximum, level: 'fail', status: 'missing' };
    }
    const foreground = flattenHex(foregroundHex, formatRgb(background));
    const ratio = contrastRatio(foreground, background);
    const level = classifyContrast(ratio, pair.kind);
    const status = withinBand(ratio, pair.kind) ? 'pass' : 'fail';
    return { pair, foregroundHex, backgroundHex, ratio, required, maximum, level, status };
}

function evaluateTokens(theme: ColorTheme): readonly TokenResult[] {
    const editorBackground = theme.colors['editor.background'] ?? '#000000';
    const required = minimumRatio(TOKEN_KIND);
    const maximum = maximumRatio(TOKEN_KIND);
    return theme.tokenColors.flatMap((rule, index) => {
        const foregroundHex = rule.settings.foreground;
        if (foregroundHex === undefined) {
            return [];
        }
        const ratio = contrastRatio(
            flattenHex(foregroundHex, editorBackground),
            flattenHex(editorBackground, '#000000'),
        );
        const status = withinBand(ratio, TOKEN_KIND) ? 'pass' : 'fail';
        return [{ index, scope: describeScope(rule), foregroundHex, ratio, required, maximum, status }];
    });
}

function evaluateGroups(theme: ColorTheme): readonly DistinguishabilityResult[] {
    return Object.entries(DISTINGUISHABLE_GROUPS).flatMap(([group, keys]) =>
        VISION_TYPES.map((vision) => closestInGroup(theme, group, keys, vision)),
    );
}

function closestInGroup(
    theme: ColorTheme,
    group: string,
    keys: readonly string[],
    vision: 'normal' | CvdType,
): DistinguishabilityResult {
    const colors = keys
        .map((key) => ({ key, hex: theme.colors[key] }))
        .filter((entry): entry is { key: string; hex: `#${string}` } => entry.hex !== undefined)
        .map((entry) => ({ key: entry.key, rgb: perceive(parseHex(entry.hex), vision) }));
    let closest: DistinguishabilityResult = {
        group,
        vision,
        closestPair: ['', ''],
        deltaE: Number.POSITIVE_INFINITY,
        status: 'ok',
    };
    for (let i = 0; i < colors.length; i += 1) {
        for (let j = i + 1; j < colors.length; j += 1) {
            const first = colors[i];
            const second = colors[j];
            if (first === undefined || second === undefined) {
                continue;
            }
            const distance = deltaE(first.rgb, second.rgb);
            if (distance < closest.deltaE) {
                closest = {
                    group,
                    vision,
                    closestPair: [first.key, second.key],
                    deltaE: distance,
                    status: distance < DELTA_E_WARN_THRESHOLD ? 'warn' : 'ok',
                };
            }
        }
    }
    return closest;
}

function perceive(color: Rgb, vision: 'normal' | CvdType): Rgb {
    return vision === 'normal' ? color : simulateCvd(color, vision);
}

function describeScope(rule: TokenColorRule): string {
    const scopes = typeof rule.scope === 'string' ? [rule.scope] : rule.scope;
    const label = rule.name ?? scopes[0] ?? '(no scope)';
    return scopes.length > 1 ? `${label} (+${String(scopes.length - 1)})` : label;
}

function formatRgb(color: Rgb): string {
    const pair = (value: number): string => Math.round(value).toString(16).padStart(2, '0');
    return `#${pair(color.r)}${pair(color.g)}${pair(color.b)}`;
}
