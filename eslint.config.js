// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // Themed text: the wrappers apply the brand font and the admin's text-size setting.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/text.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react-native",
              importNames: ["Text", "TextInput"],
              message: "Import Text / TextInput from '@/components/text' so the brand font and text size apply.",
            },
          ],
        },
      ],
    },
  },
]);
