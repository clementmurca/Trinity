import jsPlugin from '@eslint/js' // Ensure jsPlugin is imported
import importPlugin from 'eslint-plugin-import' // Add this import
import prettierPlugin from 'eslint-plugin-prettier'
import globals from 'globals'

export default [
  jsPlugin.configs.recommended,
  {
    files: ['**/*.js'],
    ignores: ['node_modules/**', 'dist/**'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    plugins: {
      prettier: prettierPlugin,
      import: importPlugin // Add this plugin
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      eqeqeq: 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-process-exit': 'off',
      'no-undef': 'error',
      'no-dupe-keys': 'error',

      // Ensure single-line imports when possible
      'object-curly-newline': ['error', { multiline: true, consistent: true }],

      // Automatically organize imports
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'never', // Prevents unnecessary blank lines between imports
          alphabetize: { order: 'asc', caseInsensitive: true }
        }
      ],

      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
          singleQuote: true,
          semi: false,
          tabWidth: 2,
          trailingComma: 'none',
          arrowParens: 'avoid',
          printWidth: 160
        }
      ]
    }
  },
  {
    files: ['**/*.test.js', '**/*.spec.js', '**/jest.config.js'],
    languageOptions: {
      globals: {
        ...globals.jest
      }
    }
  }
]
