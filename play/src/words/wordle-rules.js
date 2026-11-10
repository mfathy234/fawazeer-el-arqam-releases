/* «كلمة السر» rules (pure): the keyboard rows and scoreGuess, the colour of each letter of a guess (g right place, y in the word elsewhere, x absent).
   Repeated letters follow the usual Wordle rule: a letter is only marked as many times as it occurs in the answer. */

const WORDLE_ROWS = [['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج'], ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'], ['ذ', 'د', 'ز', 'ر', 'و', 'ظ']];
const WORDLE_TRIES = 6;

function scoreGuess(g, a) {
  const res = Array(g.length).fill('x'), left = {};
  for (let i = 0; i < g.length; i++) { if (g[i] === a[i]) res[i] = 'g'; else left[a[i]] = (left[a[i]] || 0) + 1; }
  for (let i = 0; i < g.length; i++) { if (res[i] !== 'g' && left[g[i]] > 0) { res[i] = 'y'; left[g[i]]--; } }
  return res;
}

/** The best state seen for each letter over all guesses: g beats y beats x. */
function keyStates(guesses, answer) {
  const ks = {}, rank = { x: 1, y: 2, g: 3 };
  guesses.forEach(g => scoreGuess(g, answer).forEach((s, i) => { if (!ks[g[i]] || rank[s] > rank[ks[g[i]]]) ks[g[i]] = s; }));
  return ks;
}
