import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ['node_modules/', 'themes/', 'coverage/', '*.vsix'] },
    js.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
        languageOptions: {
            globals: globals.node,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            'complexity': ['error', 10],
            'max-depth': ['error', 3],
            'no-console': 'off',
            '@typescript-eslint/explicit-function-return-type': 'error',
            '@typescript-eslint/explicit-member-accessibility': 'error',
            '@typescript-eslint/member-ordering': [
                'error',
                {
                    default: [
                        'public-static-field',
                        'public-field',
                        'constructor',
                        'public-method',
                        'protected-method',
                        'private-method',
                    ],
                },
            ],
        },
    },
    { files: ['eslint.config.js', 'vitest.config.ts'], ...tseslint.configs.disableTypeChecked },
    prettier,
);
