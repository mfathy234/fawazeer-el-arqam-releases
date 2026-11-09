/* UI text, Egyptian Arabic first, then English. {0} {1} are filled by t(key, a, b). nf() writes numbers in Arabic-Indic or Western digits
   (the settings "digits" choice: auto follows the language). Haj Salhafa's and the sparrow's lines are in LINES. */

const LANG = { cur: 'ar', digits: 'auto' };
const INDIC = '٠١٢٣٤٥٦٧٨٩';

const indicOn = () => (LANG.digits === 'indic' || (LANG.digits === 'auto' && LANG.cur === 'ar'));
const nf = n => { const s = String(n); return indicOn() ? s.replace(/\d/g, d => INDIC[d]) : s; };
const mmss = sec => nf(Math.floor(sec / 60) + ':' + String(Math.floor(sec % 60)).padStart(2, '0'));

const STR = {
  title: ['فوازير الأرقام', 'Fawazeer El Arqam'],
  latin: ['FAWAZEER EL ARQAM', 'FAWAZEER EL ARQAM'],
  tagline: ['الكلمات المتقاطعة.. بالأرقام!', 'The crossword, made of numbers!'],
  masthead: ['جريدة الألغاز الحسابية', 'The Number Puzzle Gazette'],
  play: ['الأعداد', 'Issues'],
  free: ['لعب حر', 'Free play'],
  daily: ['لغز النهارده', 'Daily puzzle'],
  shop: ['المحل', 'Shop'],
  trophies: ['الإنجازات', 'Trophies'],
  settings: ['الإعدادات', 'Settings'],
  back: ['رجوع', 'Back'],
  coins: ['عملات', 'Coins'],
  passTry: ['جرّب كل حاجة ببلاش ٤٨ ساعة', 'Try everything free for 48 hours'],
  passChip: ['التجربة المفتوحة شغّالة · فاضل {0}', 'Free pass is on · {0} left'],
  passLeft: ['{0} يوم و{1} ساعة', '{0}d {1}h'],
  passHours: ['{0} ساعة', '{0}h'],
  passStarted: ['كل حاجة مفتوحة ٤٨ ساعة!', 'Everything is open for 48 hours!'],

  easy: ['سهل', 'Easy'], medium: ['متوسط', 'Medium'], hard: ['صعب', 'Hard'],
  booksTitle: ['الأعداد', 'The Issues'],
  issue: ['العدد {0}', 'Issue {0}'],
  solvedOf: ['اتحل {0} من {1}', '{0} of {1} solved'],
  lockedBook: ['اقفل: حل {0} ألغاز من اللي قبله', 'Locked: solve {0} puzzles of the one before'],
  puzzleNo: ['لغز {0}', 'Puzzle {0}'],
  note: ['لغز', 'Puzzle'],
  freeTitle: ['لعب حر', 'Free play'],
  freeLevel: ['مستوى الأرقام', 'Number level'],
  freeHint: ['ألغاز عشوائية وعملات أقل شوية', 'Random puzzles, a few fewer coins'],
  dailyTitle: ['لغز النهارده', 'Daily puzzle'],
  dailyStreak: ['أيام ورا بعض: {0}', 'Day streak: {0}'],
  dailyPlay: ['حل لغز النهارده', 'Solve today\'s puzzle'],
  dailyDone: ['خلّصت لغز النهارده! تعالى بكرة', 'Done for today! Come back tomorrow'],
  dailyBonus: ['كل يوم تحله ورا اللي قبله بيزوّد المكافأة', 'Each day in a row raises the bonus'],
  dailyBest: ['أسرع وقت: {0}', 'Fastest: {0}'],

  tip: ['اسحب رقم لمكانه الفاضي', 'Drag a number to an empty slot'],
  sel: ['دوس على مكان فاضي', 'Now tap an empty slot'],
  hint: ['تلميحة! الرقم ده مكانه صح', 'A hint! That one belongs here'],
  nohint: ['مفيش عملات.. التلميحة بـ ٥ عملات', 'No coins. A hint costs 5'],
  empty: ['كل الأرقام اتحطت', 'All tiles are placed'],
  undo: ['رجوع', 'Undo'], hintB: ['تلميحة', 'Hint'], shuf: ['اخلط', 'Shuffle'], restart: ['من الأول', 'Restart'],
  slot: ['مكان فاضي', 'Empty slot'], tile: ['رقم', 'Tile'], home: ['القائمة', 'Menu'], mute: ['الصوت', 'Sound'], grid: ['شبكة الأرقام', 'Number grid'],
  winTitle: ['برافو! اللغز اتحل', 'Puzzle solved!'],
  next: ['اللغز اللي بعده', 'Next puzzle'], toMenu: ['القائمة', 'Menu'], toIssue: ['للعدد', 'To the issue'],
  time: ['الوقت', 'Time'], mist: ['غلطات', 'Mistakes'], hints: ['تلميحات', 'Hints'], earned: ['عملات كسبتها', 'Coins earned'],
  record: ['أسرع وقت!', 'Fastest time!'],
  best: ['أسرع وقت', 'Fastest'],
  bookOpened: ['اتفتح عدد جديد: {0}!', 'New issue open: {0}!'],
  bookCleared: ['خلّصت {0} كله!', 'You finished {0}!'],
  leaveTitle: ['تسيب {0}؟', 'Leave {0}?'], leaveBody: ['اللي عملته فيه مش هيتحفظ.', 'What you placed will not be saved.'],
  leaveYes: ['اخرج من {0}', 'Leave {0}'], leaveNo: ['كمّل اللعب', 'Keep playing'],
  restartTitle: ['تبدأ {0} من الأول؟', 'Restart {0}?'], restartBody: ['كل الأرقام اللي حطيتها هترجع الصينية.', 'Every tile you placed goes back to the tray.'],
  restartYes: ['ابدأ {0} من الأول', 'Restart {0}'],
  cancel: ['إلغاء', 'Cancel'],

  tab_theme: ['الطوب', 'Tiles'], tab_hat: ['القبعات', 'Hats'], tab_cup: ['المشروبات', 'Drinks'],
  shopHint: ['جرّب قبل ما تشتري: دوس على أي حاجة', 'Tap anything to try it on'],
  buyBtn: ['اشتري {0}', 'Buy {0}'],
  priceTag: ['{0} عملة', '{0} coins'],
  wearBtn: ['استخدم {0}', 'Use {0}'],
  inUse: ['شغّال', 'In use'], owned: ['معاك', 'Owned'], free0: ['ببلاش', 'Free'],
  needCoins: ['ناقصك {0} عملة', 'Need {0} more coins'],
  buyTitle: ['تشتري «{0}»؟', 'Buy "{0}"?'], buyBody: ['هتدفع {0} عملة من {1}.', 'This costs {0} of your {1} coins.'],
  bought: ['اشتريت {0}!', 'Bought {0}!'],

  set_music: ['الموسيقى', 'Music'], set_sfx: ['المؤثرات', 'Sound effects'], set_vibrate: ['الاهتزاز', 'Vibration'],
  set_calm: ['حركة أقل', 'Reduced motion'], set_calm_sub: ['يوقّف الرقص والكونفيتي', 'Stops bouncing and confetti'],
  set_digits: ['شكل الأرقام', 'Digit style'], digits_auto: ['حسب اللغة', 'By language'], digits_indic: ['٠١٢٣', '٠١٢٣'], digits_latin: ['0123', '0123'],
  set_lang: ['اللغة', 'Language'], on: ['شغّال', 'On'], off: ['مقفول', 'Off'], langBtn: ['English', 'عربي'],
  set_reset: ['مسح التقدّم', 'Reset progress'], set_reset_sub: ['يمسح الألغاز والعملات والمشتريات', 'Deletes puzzles, coins and purchases'],
  resetTitle: ['تمسح كل تقدّمك؟', 'Delete all your progress?'],
  resetBody: ['هيتمسح: {0} لغز اتحل، {1} عملة، و{2} حاجة اشتريتها. مفيش رجوع.', 'This deletes: {0} solved puzzles, {1} coins and {2} purchased items. It cannot be undone.'],
  resetYes: ['امسح {0} لغز و{1} عملة', 'Delete {0} puzzles and {1} coins'],
  resetDone: ['اتمسح كل حاجة. ابدأ من جديد!', 'Everything was deleted. A fresh start!'],
  credits: ['الفكرة والرسم والصوت: مصنوعين بإيد مصرية', 'Idea, art and sound: made by hand in Egypt'],
  trophiesTitle: ['الإنجازات', 'Trophies'], trophiesCount: ['{0} من {1}', '{0} of {1}'],
  trophyToast: ['إنجاز جديد: {0}', 'New trophy: {0}'],
  updateChip: ['في تحديث.. هيتفتح لما ترجع للقائمة', 'Update ready. It loads when you return to the menu'],
  boot: ['بنجهّز القهوة..', 'Setting up the cafe...'],
  keys: ['الأسهم للتنقل · Enter لاختيار · Esc رجوع', 'Arrows move · Enter picks · Esc goes back']
};

const ACH_TEXT = {
  first: ['أول لغز', 'First puzzle', 'حل لغز واحد', 'Solve one puzzle'],
  solved10: ['قاعد على القهوة', 'Regular at the cafe', 'حل ١٠ ألغاز', 'Solve 10 puzzles'],
  solved50: ['أستاذ الحسابات', 'The accountant', 'حل ٥٠ لغز', 'Solve 50 puzzles'],
  solved150: ['شيخ الفوازير', 'Riddle master', 'حل ١٥٠ لغز', 'Solve 150 puzzles'],
  stars3x10: ['عشر نجمات ثلاثية', 'Ten perfect solves', 'خد ٣ نجوم في ١٠ ألغاز', 'Get 3 stars on 10 puzzles'],
  clean: ['إيد نضيفة', 'Clean hands', 'حل ٥ ألغاز من غير غلطة ولا تلميحة', 'Solve 5 puzzles with no mistake and no hint'],
  hardwin: ['الصعب مش صعب', 'Hard is not hard', 'حل لغز صعب', 'Solve a hard puzzle'],
  fast: ['أسرع من الشاي', 'Faster than tea', 'حل لغز سهل في ٤٥ ثانية', 'Solve an easy puzzle in 45 seconds'],
  daily3: ['ثلاث نهارات', 'Three days running', 'حل لغز النهارده ٣ أيام ورا بعض', 'Solve the daily puzzle 3 days in a row'],
  daily7: ['أسبوع كامل', 'A full week', 'حل لغز النهارده ٧ أيام ورا بعض', 'Solve the daily puzzle 7 days in a row'],
  booklet1: ['خلّصت عدد', 'Finished an issue', 'حل كل ألغاز عدد واحد', 'Solve every puzzle of one issue'],
  allbooklets: ['الأرشيف كله', 'The whole archive', 'خلّص كل الأعداد', 'Finish every issue'],
  shopper: ['أول مشتريات', 'First purchase', 'اشتري حاجة من المحل', 'Buy something in the shop'],
  collector: ['هاوي تجميع', 'Collector', 'اشتري ٦ حاجات من المحل', 'Buy 6 things in the shop']
};

/* [ar, en] lines. Haj Salhafa (the tortoise host) and the sparrow talk in these. */
const LINES = {
  praise: [['عاش يا باشا!', 'Well done, pasha!'], ['قشطة!', 'Splendid!'], ['حسابك مظبوط!', 'Your sums are spot on!'], ['يا سلام على الشطارة!', 'What a clever one!'], ['كمّل كده يا بطل', 'Keep it up, champ']],
  oops: [['لا لا.. الحسبة مش كده', 'No no, the sum is off'], ['حاول تاني يا حبيبي', 'Try again, dear'], ['الرقم ده مش مكانه', 'That tile is out of place'], ['استهدى بالله وعدّ تاني', 'Calm down and count again']],
  idle: [['اشرب الشاي وفكّر على مهلك', 'Sip your tea and think slowly'], ['الأرقام مش بتهرب', 'The numbers are not running away'], ['الجرنال النهارده فيه ألغاز حلوة', 'Today\'s paper has lovely puzzles']],
  win: [['الله ينور! لغز زي الفل', 'Brilliant! Good as jasmine'], ['شاي على حسابي النهارده', 'Tea is on me today'], ['عقلك ده يتحط في إطار', 'Your mind belongs in a frame']],
  sparrow: [['تلميحة صغيرة من عصفورة', 'A tiny hint from Asfoura'], ['الرقم ده مكانه هنا', 'This one goes right here']],
  daily: [['لغز النهارده منورنا!', 'Today\'s puzzle is here!']],
  shop: [['اتفضّل يا باشا', 'Welcome in, pasha'], ['البس اللي يعجبك', 'Wear what you like']]
};

let _lineSeq = 0;
/** A line for this kind in the current language. n picks a fixed one (tests), otherwise it rotates. */
function line(kind, n) {
  const list = LINES[kind] || [['', '']], i = n == null ? (_lineSeq++ + Math.floor(Math.random() * list.length)) % list.length : n % list.length;
  return list[i][LANG.cur === 'ar' ? 0 : 1];
}

function t(key, a, b, c) {
  const row = STR[key];
  const s = row ? row[LANG.cur === 'ar' ? 0 : 1] : key;
  return s.replace('{0}', a == null ? '' : a).replace('{1}', b == null ? '' : b).replace('{2}', c == null ? '' : c);
}

const achName = id => (ACH_TEXT[id] || [id, id])[LANG.cur === 'ar' ? 0 : 1];
const achDesc = id => (ACH_TEXT[id] || ['', '', id, id])[LANG.cur === 'ar' ? 2 : 3];
const bookName = b => b[LANG.cur === 'ar' ? 'ar' : 'en'];
const itemName = it => it[LANG.cur === 'ar' ? 'ar' : 'en'];
const diffName = d => t(d);
