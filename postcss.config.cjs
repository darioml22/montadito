const debugPostCSS = () => ({
  postcssPlugin: 'debug-postcss-plugin',
  Once(root) { root.append({ type: 'comment', text: 'POSTCSS-RAN' }); }
});
debugPostCSS.postcss = true;

module.exports = {
  plugins: [
    require('@tailwindcss/postcss')(),
    debugPostCSS(),
    require('autoprefixer')(),
  ],
}