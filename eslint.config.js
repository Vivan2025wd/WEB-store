import js from "@eslint/js";

export default [
  {
    ...js.configs.recommended,
    languageOptions: {
      globals: {
        ...js.environments.node.globals, // Enable Node globals (process, __dirname, etc.)
      },
    },
  },
];
