import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import pluginPlaywright from 'eslint-plugin-playwright'
import oxlint from 'eslint-plugin-oxlint'

export default tseslint.config(
    { ignores: ['dist'] },
    {
        name: 'app/files-to-lint',
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{ts,tsx,mts}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
    {
        ...pluginPlaywright.configs['flat/recommended'],
        files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    },
    oxlint.configs['flat/recommended'],
)
