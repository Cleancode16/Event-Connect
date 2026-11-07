import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

// Marks variables used as JSX tags (<motion.div>, <Icon />) as used, so no-unused-vars
// doesn't report them. Same job as eslint-plugin-react's jsx-uses-vars, without the dependency.
const jsxUsesVars = {
  meta: { type: 'problem', schema: [] },
  create(context) {
    const mark = (name, node) => context.sourceCode.markVariableAsUsed(name, node)
    return {
      JSXOpeningElement(node) {
        let n = node.name
        while (n.type === 'JSXMemberExpression') n = n.object // motion.div → motion
        if (n.type === 'JSXIdentifier') mark(n.name, node)
      },
    }
  },
}

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      local: { rules: { 'jsx-uses-vars': jsxUsesVars } },
    },
    rules: {
      'local/jsx-uses-vars': 'error',
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
