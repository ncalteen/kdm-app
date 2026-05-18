import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import jsdoc from 'eslint-plugin-jsdoc'

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'coverage/**',
      'next-env.d.ts',
      'lib/database.types.ts'
    ]
  },
  // JSDoc rules — applied to first-party source only. Configuration matches the
  // existing house style: `@param name Description` (no JSDoc types, since
  // TypeScript provides them) and a description for every exported symbol.
  {
    files: [
      'app/**/*.{ts,tsx}',
      'components/**/*.{ts,tsx}',
      'contexts/**/*.{ts,tsx}',
      'hooks/**/*.{ts,tsx}',
      'lib/**/*.{ts,tsx}',
      'schemas/**/*.{ts,tsx}'
    ],
    plugins: { jsdoc },
    rules: {
      'jsdoc/require-jsdoc': [
        'warn',
        {
          publicOnly: true,
          require: {
            ArrowFunctionExpression: true,
            ClassDeclaration: true,
            ClassExpression: true,
            FunctionDeclaration: true,
            FunctionExpression: true,
            MethodDefinition: true
          },
          contexts: [
            'TSInterfaceDeclaration',
            'TSTypeAliasDeclaration',
            'TSEnumDeclaration'
          ],
          checkConstructors: false,
          enableFixer: false
        }
      ],
      'jsdoc/require-description': ['warn', { contexts: ['any'] }],
      // House style documents the outer parameter only (e.g. `@param props
      // Component Properties`); the destructured shape is conveyed by the
      // TypeScript type. Disable destructured-root expansion so the rule
      // doesn't ask for `@param props.foo` entries.
      'jsdoc/require-param': [
        'warn',
        { checkDestructured: false, checkDestructuredRoots: false }
      ],
      'jsdoc/require-param-description': 'warn',
      'jsdoc/require-param-name': 'warn',
      'jsdoc/require-param-type': 'off',
      'jsdoc/check-param-names': [
        'warn',
        { checkDestructured: false, checkRestProperty: false }
      ],
      'jsdoc/no-types': 'warn',
      'jsdoc/require-returns': 'warn',
      'jsdoc/require-returns-description': 'warn',
      'jsdoc/require-returns-type': 'off',
      'jsdoc/check-alignment': 'warn',
      'jsdoc/check-tag-names': ['warn', { typed: false }],
      'jsdoc/empty-tags': 'warn',
      'jsdoc/multiline-blocks': 'warn',
      'jsdoc/no-multi-asterisks': 'warn',
      'jsdoc/tag-lines': ['warn', 'never', { startLines: 1 }]
    }
  },
  {
    // shadcn/ui primitives are upstream-generated and follow shadcn's own
    // conventions. Don't enforce house JSDoc rules on them.
    files: ['components/ui/**/*.{ts,tsx}'],
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-description': 'off',
      'jsdoc/require-param': 'off',
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-returns-description': 'off'
    }
  },
  {
    // Tests, fixtures, configs: skip JSDoc requirements entirely.
    files: [
      '__tests__/**',
      '__fixtures__/**',
      '**/*.test.{ts,tsx}',
      '**/*.config.{ts,mjs,js}'
    ],
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-description': 'off',
      'jsdoc/require-param': 'off',
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-returns-description': 'off'
    }
  },
  {
    settings: {
      react: {
        // Fix for ESLint 10+: eslint-plugin-react uses context.getFilename()
        // (legacy API) which was removed in ESLint 10 flat config. Declaring
        // the version explicitly prevents the plugin from trying to auto-detect
        // it and failing.
        version: '19'
      }
    }
  }
]

export default eslintConfig
