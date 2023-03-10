module.exports = {
  plugins: ["prettier"],
  root: true,
  env: {
    node: true,
    // to make defineProps could be used
    "vue/setup-compiler-macros": true,
  },
  extends: [
    "plugin:vue/vue3-essential",
    "@vue/airbnb",
    "@vue/typescript/recommended",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "prettier/prettier": "error",
  },
};
