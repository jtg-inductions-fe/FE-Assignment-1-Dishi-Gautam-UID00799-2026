import js from '@eslint/js';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
    {
        ignores: ['dist/**', 'node_modules/**', 'public/**'],
    },
    js.configs.recommended,
    eslintPluginPrettier,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                myCustomGlobal: 'readonly',
            },
        },
        rules: {
            indent: ['error', 4],
            'no-unused-vars': 'warn',
            camelcase: ['warn'],
            'no-console': ['warn'],
        },
    },
];
