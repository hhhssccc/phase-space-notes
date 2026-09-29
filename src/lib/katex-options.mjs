// These Chinese notes intentionally allow Unicode prose in math expressions.
// KaTeX supports it; retain all other strict diagnostics and syntax errors.
// https://katex.org/docs/options#strict
export const katexOptions = {
  strict: code => code === 'unicodeTextInMathMode' ? 'ignore' : 'warn',
};
