// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

/**
 * Restricciones de importación comunes a todo `src/`.
 * Ver docs/architecture/ARQUITECTURA.md §3 (reglas de dependencia).
 */
const BASE_RESTRICTED_PATTERNS = [
  {
    group: ['@/features/*/*'],
    message: 'Importa la feature solo desde su API pública: "@/features/<feature>".',
  },
  {
    group: ['../../*'],
    message: 'Usa el alias "@/" en lugar de rutas relativas de más de un nivel.',
  },
];

/** Crea la regla no-restricted-imports agregando restricciones por capa. */
function restrictImports(extraPatterns = []) {
  return [
    'error',
    {
      patterns: [...BASE_RESTRICTED_PATTERNS, ...extraPatterns],
    },
  ];
}

const NO_APP = {
  group: ['@/app', '@/app/*'],
  message: 'Solo src/app puede depender de las rutas; las rutas no se importan.',
};
const NO_FEATURES = {
  group: ['@/features', '@/features/*'],
  message: 'Esta capa no puede depender de las features (dominio).',
};
const NO_PERMISSIONS = {
  group: ['@/permissions', '@/permissions/*'],
  message: 'Esta capa no puede depender de los permisos.',
};
const NO_UI = {
  group: ['@/components', '@/components/*', '@/hooks', '@/hooks/*', '@/providers', '@/providers/*'],
  message: 'La infraestructura no puede depender de la UI.',
};

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: [
      'dist/*',
      'web-build/*',
      '.expo/*',
      'android/*',
      'ios/*',
      'expo-env.d.ts',
      'scripts/reset-project.js',
    ],
  },

  // Reglas generales
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',
    },
  },

  // TypeScript
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-ignore': true, 'ts-expect-error': 'allow-with-description' },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    },
  },

  // Fronteras entre capas (de más específica a más general no importa: cada bloque cubre carpetas distintas)
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': restrictImports([NO_APP]) },
  },
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': restrictImports() },
  },
  {
    files: ['src/components/**/*.{ts,tsx}', 'src/hooks/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': restrictImports([NO_APP, NO_FEATURES, NO_PERMISSIONS]) },
  },
  {
    files: ['src/permissions/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': restrictImports([NO_APP, NO_FEATURES]) },
  },
  {
    files: [
      'src/lib/**/*.{ts,tsx}',
      'src/config/**/*.{ts,tsx}',
      'src/constants/**/*.{ts,tsx}',
      'src/types/**/*.{ts,tsx}',
      'src/utils/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': restrictImports([NO_APP, NO_FEATURES, NO_PERMISSIONS, NO_UI]),
    },
  },
]);
