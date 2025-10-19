import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
	{
		ignores: [
			'dist/**/*',
			'node_modules/**/*',
			'vite.config.ts',
		],
	},
	{
		files: [ '**/*.ts', '**/*.tsx' ],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: import.meta.dirname,
				sourceType: 'module',
			},
			globals: {
				...globals.browser,
				...globals.jest,
			},
		},
		plugins: {
			'@typescript-eslint': tseslint,
		},
		rules: {
			...tseslint.configs.recommended.rules,
			'max-len': [ 'error', 200, 4, {
				ignoreUrls: true,
				ignoreComments: true,
				ignoreTemplateLiterals: true,
				ignoreStrings: true,
			} ],
			'arrow-parens': [ 'error', 'as-needed', { requireForBlockBody: true } ],
			'indent': [ 'error', 'tab', { ignoredNodes: [ 'PropertyDefinition' ] } ],
		},
		settings: {
			'import/resolver': {
				node: {
					extensions: [ '.js', '.ts', '.tsx', '.d.ts' ],
				},
			},
		},
	},
];

