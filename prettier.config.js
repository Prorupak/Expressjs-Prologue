/** @type {import('prettier').Config} */
module.exports = {
  endOfLine: "lf",
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  printWidth: 120,
  arrowParens: "avoid",
  importOrder: ["^(express/(.*)$)|^(express$)", "<THIRD_PARTY_MODULES>", "^types$", "^[./]"],
  importOrderSeparation: false,
  importOrderSortSpecifiers: false,
  importOrderBuiltinModulesToTop: true,
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrderMergeDuplicateImports: false,
  importOrderCombineTypeAndValueImports: true,
  importOrderRemoveUnusedImports: false,
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
};
