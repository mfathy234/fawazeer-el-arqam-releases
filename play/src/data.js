/* Fawazeer El Arqam: ALL tuning lives here (puzzle sizes, booklets, rewards, prices, themes, achievements). Plain classic script, no imports. */

const SAVE_KEY = 'fawazeer.save.v1';
const APP_VERSION = '1.0.0';

/* Puzzle difficulty. eq = equations, bl = blanks (tiles to place), dec = decoy tiles, w/h = max grid cells,
   par = seconds before the time penalty, coin = coins for 3 stars. */
const DIFFS = {
  easy: { eq: [3, 4], bl: [4, 6], dec: [0, 0], w: 8, h: 8, par: 90, coin: 5 },
  medium: { eq: [6, 8], bl: [8, 10], dec: [0, 1], w: 9, h: 11, par: 180, coin: 10 },
  hard: { eq: [9, 12], bl: [10, 14], dec: [1, 2], w: 10, h: 14, par: 300, coin: 18 }
};
const DIFF_IDS = ['easy', 'medium', 'hard'];

/* Number grades: A = largest number in a puzzle, M = largest multiplier / divisor (0 = only + and -). */
const GRADES = [{ A: 10, M: 0 }, { A: 20, M: 0 }, { A: 50, M: 5 }, { A: 100, M: 9 }, { A: 200, M: 10 }, { A: 300, M: 12 }, { A: 500, M: 15 }];

/* Booklets (اعداد): 20 puzzles each. Puzzle i is easy below tiers.medium, medium below tiers.hard, hard after.
   The next booklet opens when unlockAt puzzles of this one are solved. */
const BOOKLET = { size: 20, tiers: { medium: 7, hard: 15 }, unlockAt: 12, clearBonus: 40 };
const BOOKLETS = [
  { id: 'b1', grade: 0, ar: 'عدد الصباحية', en: 'The Morning Issue', ink: '#2aa9a0' },
  { id: 'b2', grade: 1, ar: 'عدد الشاي بالنعناع', en: 'The Mint Tea Issue', ink: '#e3a82a' },
  { id: 'b3', grade: 2, ar: 'عدد الحارة', en: 'The Alley Issue', ink: '#b5472e' },
  { id: 'b4', grade: 3, ar: 'عدد السهرة', en: 'The Late-Night Issue', ink: '#2c4a7a' },
  { id: 'b5', grade: 4, ar: 'عدد الفوازير', en: 'The Riddle Issue', ink: '#7b4a8c' },
  { id: 'b6', grade: 5, ar: 'عدد يوم الجمعة', en: 'The Friday Issue', ink: '#3d7a3a' },
  { id: 'b7', grade: 6, ar: 'العدد الذهبي', en: 'The Golden Issue', ink: '#b57d12' }
];

/* Coins are multiplied by the booklet's grade, so later booklets pay more. */
const GRADE_COIN = [1, 1.2, 1.5, 1.8, 2.2, 2.6, 3];

/* Free play and the daily puzzle. */
const FREE = { coinShare: 0.5 };
const DAILY = { diff: 'medium', grade: 2, firstBonus: 10, streakStep: 5, streakCap: 7, keepDays: 14 };

/* Stars: penalty = mistakes + 1.5 per hint + 0.5 over par. 3 stars up to starPen[0], 2 up to starPen[1], else 1. */
const STARS = { pen3: 0.5, pen2: 3, hintPenalty: 1.5, freeHints: 3, hintCost: 5 };

/* The quick pass (تجربة كل حاجة): every theme, hat and cup is free to wear for this many hours. Nothing is kept afterwards. */
const PASS = { hours: 48 };

/* Shop. Tile themes recolour the letter blocks; hats go on Haj Salhafa; cups sit on his cafe table. Free ones are owned from the start. */
const THEMES = [
  { id: 'paper', ar: 'ورق الجرنال', en: 'Newsprint', price: 0, face: '#f6ecd0', shade: '#d9c690', text: '#14213a', edge: '#14213a', style: 'plain' },
  { id: 'domino', ar: 'دومينو', en: 'Domino', price: 300, face: '#fffaf0', shade: '#d8d0bc', text: '#14213a', edge: '#14213a', style: 'domino' },
  { id: 'zellige', ar: 'زليج فيروزي', en: 'Turquoise tile', price: 450, face: '#3fb8ae', shade: '#1b7872', text: '#fffaf0', edge: '#0f3d3b', style: 'star' },
  { id: 'brick', ar: 'طوب أحمر', en: 'Red brick', price: 450, face: '#c85a3c', shade: '#8a3320', text: '#fff1dc', edge: '#3c1a10', style: 'brick' },
  { id: 'brass', ar: 'نحاس مقشّر', en: 'Polished brass', price: 700, face: '#eab93c', shade: '#b57d12', text: '#2b1a05', edge: '#3a2406', style: 'rivet' },
  { id: 'midnight', ar: 'ليل القهوة', en: 'Cafe midnight', price: 900, face: '#27406b', shade: '#162847', text: '#ffd873', edge: '#0a1428', style: 'dots' }
];
const HATS = [
  { id: 'tarboosh', ar: 'طربوش', en: 'Tarboosh', price: 0 },
  { id: 'cap', ar: 'كاب سواقين', en: 'Flat cap', price: 200 },
  { id: 'straw', ar: 'برنيطة قش', en: 'Straw hat', price: 250 },
  { id: 'chef', ar: 'طاقية الشيف', en: 'Chef hat', price: 350 },
  { id: 'party', ar: 'قبّعة الفرح', en: 'Party hat', price: 300 },
  { id: 'crown', ar: 'تاج الفوازير', en: 'Riddle crown', price: 600 }
];
const CUPS = [
  { id: 'tea', ar: 'كباية شاي', en: 'Tea glass', price: 0, liquid: '#b4521c' },
  { id: 'coffee', ar: 'فنجان قهوة', en: 'Coffee cup', price: 150, liquid: '#3a2012' },
  { id: 'sahlab', ar: 'سحلب بالمكسرات', en: 'Sahlab', price: 250, liquid: '#f0e2c0' },
  { id: 'karkade', ar: 'كركديه ساقع', en: 'Iced hibiscus', price: 250, liquid: '#a0213a' },
  { id: 'lemon', ar: 'ليمون بالنعناع', en: 'Mint lemonade', price: 300, liquid: '#c9d96b' }
];
const SHOP_KINDS = { theme: THEMES, hat: HATS, cup: CUPS };
const SHOP_DEFAULTS = { theme: 'paper', hat: 'tarboosh', cup: 'tea' };

/* Achievements: id, coin reward. The rule for each is in meta.js. */
const ACHIEVEMENTS = [
  { id: 'first', coins: 10 }, { id: 'solved10', coins: 30 }, { id: 'solved50', coins: 100 }, { id: 'solved150', coins: 250 },
  { id: 'stars3x10', coins: 50 }, { id: 'clean', coins: 40 }, { id: 'hardwin', coins: 60 }, { id: 'fast', coins: 40 },
  { id: 'daily3', coins: 40 }, { id: 'daily7', coins: 120 }, { id: 'booklet1', coins: 80 }, { id: 'allbooklets', coins: 500 },
  { id: 'shopper', coins: 20 }, { id: 'collector', coins: 80 }
];
const FAST_SECONDS = 45;

/* Audio files, see tools/audio. */
const AUDIO = { loopSec: 32, mp3Delay: 1105 / 24000 };

/* The cafe the tortoise sits in, shown on the menu. */
const CAFE = { name: { ar: 'قهوة الفوازير', en: 'Fawazeer Cafe' } };
