/**
 * Build gate: verifies the theme against the curated contrast pairs and the
 * syntax token foregrounds, writes `docs/contrast-report.md`, and exits
 * non-zero on any failure.
 *
 * Usage:
 *   node scripts/contrast-audit.ts          # audit only
 *   node scripts/contrast-audit.ts --fix    # also write minimal repairs into src/
 * @module
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { theme } from '../src/theme.ts';
import { evaluateTheme } from './audit/evaluate.ts';
import { applyRepairs, planRepairs } from './audit/fix.ts';
import { renderConsole, renderMarkdown } from './audit/report.ts';

const ROOT = resolve(import.meta.dirname, '..');
const REPORT_PATH = resolve(ROOT, 'docs/contrast-report.md');
const SOURCE_PATHS = {
    workbench: resolve(ROOT, 'src/workbench-colors.ts'),
    tokens: resolve(ROOT, 'src/token-colors.ts'),
};

/**
 * Runs the audit, optionally applying repairs, and returns the exit code.
 * @param fix Whether to write repairs into the theme source.
 * @returns 0 when every check passes, otherwise 1.
 */
export function runAudit(fix: boolean): number {
    const result = evaluateTheme(theme);
    writeFileSync(REPORT_PATH, renderMarkdown(result, new Date()));
    renderConsole(result).forEach((line) => console.log(line));
    if (fix && result.failures > 0) {
        const repairs = planRepairs(theme, result);
        applyRepairs(repairs, SOURCE_PATHS);
        repairs.forEach((repair) =>
            console.log(
                `FIXED ${repair.key}: ${repair.result.original} -> ${repair.result.adjusted} (${repair.result.ratioBefore.toFixed(2)} -> ${repair.result.ratioAfter.toFixed(2)}) ${repair.reason}`,
            ),
        );
        console.log(`applied ${String(repairs.length)} repair(s); re-run the audit to confirm`);
    }
    return result.failures === 0 ? 0 : 1;
}

process.exitCode = runAudit(process.argv.includes('--fix'));
