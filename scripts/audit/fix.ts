/**
 * Computes and applies minimal color repairs for failing checks. Translucent
 * overlay backgrounds are faded; every other failure moves the foreground's
 * lightness. Changes are written back into the TypeScript theme source.
 * @module
 */

import { readFileSync, writeFileSync } from 'node:fs';
import type { ColorTheme } from '../../src/types.ts';
import { fadeOverlayToContrast, nudgeToContrast, type NudgeResult } from '../color/adjust.ts';
import { parseHex } from '../color/hex.ts';
import type { AuditResult, PairResult, TokenResult } from './evaluate.ts';

/** One proposed source change. */
export interface Repair {
    readonly target: 'workbench' | 'token';
    readonly key: string;
    readonly reason: string;
    readonly result: NudgeResult;
}

/**
 * Derives one repair per failing check. Repairs for the same key are
 * deduplicated by keeping the strongest change.
 * @param theme Theme being audited.
 * @param audit Audit outcome.
 * @returns Repairs to apply.
 */
export function planRepairs(theme: ColorTheme, audit: AuditResult): readonly Repair[] {
    const byKey = new Map<string, Repair>();
    const consider = (repair: Repair | undefined): void => {
        if (!repair?.result.changed) {
            return;
        }
        const existing = byKey.get(`${repair.target}:${repair.key}`);
        if (existing === undefined || repair.result.ratioAfter > existing.result.ratioAfter) {
            byKey.set(`${repair.target}:${repair.key}`, repair);
        }
    };
    for (const item of audit.pairs.filter((candidate) => candidate.status === 'fail')) {
        consider(repairPair(theme, item));
    }
    for (const item of audit.tokens.filter((candidate) => candidate.status === 'fail')) {
        consider(repairToken(theme, item));
    }
    return [...byKey.values()];
}

/**
 * Writes repairs into `src/workbench-colors.ts` and `src/token-colors.ts`.
 * @param repairs Repairs to apply.
 * @param paths Source file locations.
 */
export function applyRepairs(repairs: readonly Repair[], paths: { workbench: string; tokens: string }): void {
    let workbench = readFileSync(paths.workbench, 'utf8');
    let tokens = readFileSync(paths.tokens, 'utf8');
    for (const repair of repairs) {
        if (repair.target === 'workbench') {
            const pattern = new RegExp(
                `("${escapeRegExp(repair.key)}":\\s*)"${escapeRegExp(repair.result.original)}"`,
                'i',
            );
            workbench = workbench.replace(pattern, `$1"${repair.result.adjusted}"`);
        } else {
            const pattern = new RegExp(`(foreground:\\s*)"${escapeRegExp(repair.result.original)}"`, 'gi');
            tokens = tokens.replace(pattern, `$1"${repair.result.adjusted}"`);
        }
    }
    writeFileSync(paths.workbench, workbench);
    writeFileSync(paths.tokens, tokens);
}

function repairPair(theme: ColorTheme, item: PairResult): Repair | undefined {
    if (item.foregroundHex === undefined || item.backgroundHex === undefined) {
        return undefined;
    }
    const backdrop = item.pair.backdrop === undefined ? undefined : theme.colors[item.pair.backdrop];
    const isOverlay = backdrop !== undefined && parseHex(item.backgroundHex).a < 1;
    if (isOverlay) {
        const result = fadeOverlayToContrast(item.backgroundHex, backdrop, item.foregroundHex, item.required);
        return {
            target: 'workbench',
            key: item.pair.background,
            reason: `${item.pair.description}: fade overlay`,
            result,
        };
    }
    const foregroundRepair = nudgeToContrast(item.foregroundHex, item.backgroundHex, item.required);
    if (foregroundRepair.satisfied) {
        return {
            target: 'workbench',
            key: item.pair.foreground,
            reason: `${item.pair.description}: adjust foreground`,
            result: foregroundRepair,
        };
    }
    const backgroundRepair = nudgeToContrast(item.backgroundHex, item.foregroundHex, item.required);
    return {
        target: 'workbench',
        key: item.pair.background,
        reason: `${item.pair.description}: adjust background`,
        result: backgroundRepair,
    };
}

function repairToken(theme: ColorTheme, item: TokenResult): Repair {
    const editorBackground = theme.colors['editor.background'] ?? '#000000';
    const result = nudgeToContrast(item.foregroundHex, editorBackground, item.required);
    return { target: 'token', key: item.foregroundHex, reason: `token ${item.scope}: adjust foreground`, result };
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
