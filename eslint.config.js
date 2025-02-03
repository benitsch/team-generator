import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import vueParser from "vue-eslint-parser";
import pluginVue from "eslint-plugin-vue";
import cypress from "eslint-plugin-cypress";
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript'
export default defineConfigWithVueTs([
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": ts,
    },
    rules: {
      "eqeqeq": "error",
      "vue/multi-word-component-names": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-function-return-type": "error",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": ts,
    },
    rules: {
      "eqeqeq": "error",
      "vue/multi-word-component-names": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-function-return-type": "error",
    },
  },

  {
    files: ["cypress/e2e/**.{cy,spec}.{js,ts,jsx,tsx}"],
    plugins: {
      cypress: cypress,
    },
    rules: cypress.configs.recommended.rules,
  },
  {
    ignores: ["**/dist"]
  }
]);
