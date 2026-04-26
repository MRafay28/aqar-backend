module.exports = [
    // Non-TypeScript files config
    {
        files: ['**/*.js', 'eslint.config.js', 'scripts/**/*.js'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: {
                process: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                Promise: 'readonly',
                Map: 'readonly',
                Set: 'readonly',
                WeakMap: 'readonly',
                WeakSet: 'readonly'
            }
        },
        plugins: {
            import: require('eslint-plugin-import'),
            promise: require('eslint-plugin-promise'),
            security: require('eslint-plugin-security'),
            prettier: require('eslint-plugin-prettier')
        },
        rules: {
            'prettier/prettier': [
                'error',
                {
                    endOfLine: 'auto'
                }
            ],
            'no-var': 'error',
            'prefer-const': 'error',
            'no-const-assign': 'error',
            'keyword-spacing': ['error', { after: true }],
            'comma-style': ['error', 'last'],
            eqeqeq: ['error', 'always'],
            'no-trailing-spaces': 'error',
            'require-await': 'error',
            'handle-callback-err': 'error',
            'no-process-exit': 'warn',
            'promise/always-return': 'off',
            'promise/no-return-wrap': 'error',
            'import/no-unresolved': 'off',
            'import/no-dynamic-require': 'warn'
        }
    },
    // TypeScript files config
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            parser: require('@typescript-eslint/parser'),
            parserOptions: {
                project: './tsconfig.json'
            },
            globals: {
                process: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                Promise: 'readonly',
                Map: 'readonly',
                Set: 'readonly',
                WeakMap: 'readonly',
                WeakSet: 'readonly'
            }
        },
        linterOptions: {
            reportUnusedDisableDirectives: true
        },
        plugins: {
            '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
            import: require('eslint-plugin-import'),
            promise: require('eslint-plugin-promise'),
            security: require('eslint-plugin-security'),
            prettier: require('eslint-plugin-prettier')
        },
        rules: {
            'prettier/prettier': [
                'error',
                {
                    endOfLine: 'auto'
                }
            ],
            'no-var': 'error',
            'prefer-const': 'error',
            'no-const-assign': 'error',
            'keyword-spacing': ['error', { after: true }],
            'comma-style': ['error', 'last'],
            eqeqeq: ['error', 'always'],
            'no-trailing-spaces': 'error',
            'require-await': 'error',
            'handle-callback-err': 'error',
            'no-process-exit': 'warn',
            'promise/always-return': 'off',
            'promise/no-return-wrap': 'error',
            'import/no-unresolved': 'off',
            'import/no-dynamic-require': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-namespace': 'warn',
            '@typescript-eslint/no-unsafe-function-type': 'error'
        }
    }
];
