/**
 * Minimal JSONC (JSON with comments) support for VS Code theme files.
 * Handles full-line `//` comments and trailing commas, which is what
 * `Developer: Generate Color Theme From Current Settings` produces.
 * @module
 */

const FULL_LINE_COMMENT = /^\s*\/\/.*$/gm;
const TRAILING_COMMA = /,(\s*[}\]])/g;
const COMMENTED_ENTRY = /^\s*\/\/\s*"([^"]+)"\s*:\s*("[^"]*"|[^,\n]+)\s*,?\s*$/gm;

/** A key/value pair that was commented out in the source file. */
export interface CommentedEntry {
    readonly key: string;
    readonly value: string;
}

/**
 * Parses JSONC text into a value, discarding comments and trailing commas.
 * @param text Raw JSONC document.
 * @returns The parsed JSON value; callers narrow the type.
 */
export function parseJsonc(text: string): unknown {
    const stripped = text.replace(FULL_LINE_COMMENT, '').replace(TRAILING_COMMA, '$1');
    return JSON.parse(stripped) as unknown;
}

/**
 * Extracts every `//"key": value,` line so disabled entries can be documented.
 * @param text Raw JSONC document.
 * @returns Commented entries in file order.
 */
export function extractCommentedEntries(text: string): readonly CommentedEntry[] {
    const entries: CommentedEntry[] = [];
    for (const match of text.matchAll(COMMENTED_ENTRY)) {
        const [, key, rawValue] = match;
        if (key !== undefined && rawValue !== undefined) {
            entries.push({ key, value: rawValue.trim().replace(/^"|"$/g, '') });
        }
    }
    return entries;
}
