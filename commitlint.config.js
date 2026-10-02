// https://commitlint.js.org — ver docs/conventions/GIT.md
/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 100],
    'scope-enum': [
      1,
      'always',
      [
        'auth',
        'admins',
        'species',
        'permissions',
        'api',
        'storage',
        'ui',
        'navigation',
        'config',
        'deps',
        'readme',
        'conventions',
        'requirements',
        'ci',
      ],
    ],
  },
};
