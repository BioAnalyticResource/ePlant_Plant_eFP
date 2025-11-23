const eslintPluginPrettier = require("eslint-plugin-prettier");

module.exports = [
	{
		ignores: ["**/*.min.js", "eslint.config.js", "node_modules/**/*"],
	},
	{
		languageOptions: {
			ecmaVersion: "latest",
			parserOptions: {
				ecmaFeatures: {
					modules: true,
				},
			},
		},
		plugins: {
			prettier: eslintPluginPrettier,
		},
		rules: {
			indent: ["error", "tab"],
			"no-console": "off",
			"no-continue": "off",
			"no-param-reassign": "off",
			"no-restricted-syntax": "off",
			"no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
			"no-use-before-define": "off",
			"prettier/prettier": "error",
			semi: ["error", "always"],
		},
	},
];
