import globals from 'globals'
import jsPlugin from '@eslint/js'
import pluginReact from 'eslint-plugin-react'
import prettierPlugin from 'eslint-plugin-prettier'

export default [
  jsPlugin.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      react: pluginReact,
      prettier: prettierPlugin,
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      eqeqeq: 'error',

      'react/jsx-key': 'warn',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'warn',

      'prettier/prettier': [
        'warn',
        {
          singleQuote: true,
          semi: false,
          tabWidth: 2,
          trailingComma: 'es5',
          arrowParens: 'avoid',
          printWidth: 120, // Increased from 80 to allow longer lines
          bracketSpacing: true,
          endOfLine: 'lf',
          singleAttributePerLine: false, // Added to keep attributes on same line
        },
      ],
    },
  },
]
