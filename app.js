/* ====================================================================
   DietPlanar — app.js
   Full time-based tracking: date-keyed logs, streak, active timer,
   weight history, water daily reset, live clock, sparklines
==================================================================== */
'use strict';

// ── Constants ──────────────────────────────────────────────────────
const DAYS  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const SLOTS = ['breakfast','lunch','dinner','snack'];
const SLOT_LABELS = {breakfast:'🌅 Breakfast',lunch:'☀️ Lunch',dinner:'🌙 Dinner',snack:'🍎 Snack'};
const DAY_MAP = {0:'Sunday',1:'Monday',2:'Tuesday',3:'Wednesday',4:'Thursday',5:'Friday',6:'Saturday'};
const TIPS = [
  'Drinking water before meals can reduce calorie intake by up to 13%.',
  'Protein keeps you fuller longer — aim for 0.8–1.2 g per kg of body weight daily.',
  'Eating slowly gives your brain time to register fullness, reducing overeating.',
  'Colorful vegetables offer a variety of micronutrients — aim for 5+ colors per day.',
  'A consistent meal schedule helps regulate hunger hormones and metabolism.',
  'Sleep deprivation increases ghrelin (hunger hormone) — aim for 7–9 hours nightly.',
  'Fiber from whole foods slows glucose absorption and improves gut health.',
  'Healthy fats like avocado, nuts, and olive oil are essential for hormone production.',
  'Resistance training 3× per week preserves muscle mass during fat loss.',
  'Meal prepping reduces the likelihood of poor food choices during the week.',
  'Magnesium-rich foods (seeds, spinach, dark chocolate) support 300+ enzyme reactions.',
  'Post-workout protein synthesis peaks within 2 hours — eat a protein-rich snack.',
  'Staying hydrated improves concentration, mood, and physical performance.',
  'Intermittent fasting may help some people naturally reduce calorie intake.',
];
const INGREDIENT_CATEGORIES = {
  'Proteins':   ['chicken','beef','tuna','salmon','eggs','tofu','tempeh','shrimp','turkey','cod','lentils','chickpeas','beans','edamame','paneer'],
  'Vegetables': ['spinach','kale','broccoli','zucchini','bell pepper','avocado','tomato','cucumber','lettuce','carrot','celery','asparagus','mushrooms','onion','garlic','cauliflower'],
  'Fruits':     ['banana','apple','mango','blueberries','strawberries','lime','lemon','orange'],
  'Grains':     ['quinoa','oats','rice','pasta','bread','tortilla','sweet potato'],
  'Dairy':      ['milk','greek yogurt','cottage cheese','cheddar','parmesan','mozzarella','cream cheese','feta','butter'],
  'Fats & Oils':['olive oil','coconut oil','almond butter','tahini','chia seeds','flaxseeds','walnuts','almonds','cashews','hemp seeds','pesto','mayonnaise'],
  'Pantry':     ['salt','pepper','cumin','paprika','turmeric','soy sauce','honey','maple syrup','balsamic vinegar','vegetable broth','chicken broth','tomato sauce','hot sauce','cornstarch','garam masala','vanilla','mustard','oyster sauce','sesame oil','chilli flakes'],
};

// ── Recipe Database ────────────────────────────────────────────────
const BASE_RECIPES = [
  {id:'r001',name:'Grilled Chicken & Quinoa Bowl',emoji:'🍗',diet:'balanced',calories:480,protein:42,carbs:38,fat:14,fiber:5,ingredients:['Chicken breast','Quinoa','Spinach','Cherry tomatoes','Lemon','Olive oil','Garlic'],instructions:'Season chicken with garlic, salt, pepper. Grill 6–7 min per side. Cook quinoa. Assemble bowl with spinach and tomatoes.'},
  {id:'r002',name:'Salmon with Roasted Vegetables',emoji:'🐟',diet:'balanced',calories:520,protein:38,carbs:22,fat:26,fiber:6,ingredients:['Salmon fillet','Broccoli','Zucchini','Bell pepper','Olive oil','Garlic','Lemon','Paprika'],instructions:'Toss veggies with olive oil and paprika. Roast 20 min at 200°C. Season salmon and bake 12–15 min.'},
  {id:'r003',name:'Turkey & Avocado Wrap',emoji:'🌯',diet:'balanced',calories:420,protein:28,carbs:32,fat:18,fiber:7,ingredients:['Turkey breast','Whole wheat tortilla','Avocado','Lettuce','Tomato','Cucumber','Greek yogurt'],instructions:'Spread yogurt on tortilla. Layer turkey, avocado, and veggies. Roll tightly and slice.'},
  {id:'r004',name:'Mediterranean Chickpea Salad',emoji:'🥗',diet:'balanced',calories:340,protein:12,carbs:40,fat:14,fiber:9,ingredients:['Chickpeas','Cucumber','Cherry tomatoes','Feta cheese','Olive oil','Lemon','Cumin'],instructions:'Drain chickpeas. Chop veggies. Combine all. Drizzle with olive oil and lemon.'},
  {id:'r005',name:'Overnight Oats with Berries',emoji:'🍓',diet:'balanced',calories:310,protein:14,carbs:52,fat:7,fiber:8,ingredients:['Oats','Greek yogurt','Milk','Chia seeds','Blueberries','Strawberries','Honey'],instructions:'Mix oats, yogurt, milk, and chia seeds. Top with berries. Refrigerate overnight.'},
  {id:'r006',name:'Bacon & Egg Keto Cups',emoji:'🥚',diet:'keto',calories:380,protein:22,carbs:2,fat:32,fiber:0,ingredients:['Bacon','Eggs','Cheddar cheese','Cream cheese','Salt','Pepper'],instructions:'Line muffin tin with bacon. Add cream cheese, crack an egg, top with cheddar. Bake 180°C for 15 min.'},
  {id:'r007',name:'Avocado & Tuna Lettuce Cups',emoji:'🥑',diet:'keto',calories:310,protein:24,carbs:4,fat:22,fiber:4,ingredients:['Tuna','Avocado','Mayonnaise','Celery','Lemon','Lettuce'],instructions:'Mash avocado with lemon. Mix with tuna, mayo, and diced celery. Spoon into lettuce cups.'},
  {id:'r008',name:'Zucchini Noodles with Pesto Chicken',emoji:'🌿',diet:'keto',calories:440,protein:36,carbs:8,fat:30,fiber:3,ingredients:['Chicken breast','Zucchini','Pesto','Olive oil','Parmesan','Garlic'],instructions:'Spiralize zucchini. Cook chicken with olive oil and garlic. Add pesto. Toss with zoodles and parmesan.'},
  {id:'r009',name:'Cream Cheese Stuffed Bell Peppers',emoji:'🫑',diet:'keto',calories:350,protein:18,carbs:9,fat:28,fiber:2,ingredients:['Bell peppers','Cream cheese','Ground beef','Mozzarella','Garlic','Onion'],instructions:'Brown beef with garlic and onion. Mix with cream cheese. Fill halved peppers, top with mozzarella. Bake 25 min.'},
  {id:'r010',name:'Cauliflower Fried Rice',emoji:'🍚',diet:'keto',calories:280,protein:16,carbs:12,fat:18,fiber:4,ingredients:['Cauliflower','Eggs','Soy sauce','Green onions','Garlic','Sesame oil','Shrimp'],instructions:'Rice cauliflower. Stir-fry shrimp and veggies. Scramble eggs. Add cauliflower rice and soy sauce.'},
  {id:'r011',name:'Spinach & Paneer Curry',emoji:'🍛',diet:'vegetarian',calories:390,protein:18,carbs:24,fat:24,fiber:5,ingredients:['Paneer','Spinach','Onion','Tomato','Garlic','Ginger','Cream','Garam masala','Turmeric'],instructions:'Sauté onion, garlic, ginger with spices. Add tomatoes, simmer 10 min. Add spinach, blend half. Add paneer and cream.'},
  {id:'r012',name:'Caprese Pasta Salad',emoji:'🍝',diet:'vegetarian',calories:420,protein:16,carbs:48,fat:18,fiber:4,ingredients:['Pasta','Fresh mozzarella','Cherry tomatoes','Basil','Balsamic vinegar','Olive oil'],instructions:'Cook pasta al dente. Combine with tomatoes, mozzarella, and basil. Drizzle with olive oil and balsamic.'},
  {id:'r013',name:'Black Bean Tacos with Mango Salsa',emoji:'🌮',diet:'vegetarian',calories:360,protein:14,carbs:55,fat:10,fiber:12,ingredients:['Black beans','Corn tortillas','Mango','Red onion','Cilantro','Lime','Avocado'],instructions:'Season beans with cumin and paprika. Mix mango, onion, cilantro, lime for salsa. Build tacos.'},
  {id:'r014',name:'Greek Yogurt Parfait',emoji:'🫙',diet:'vegetarian',calories:290,protein:18,carbs:38,fat:6,fiber:5,ingredients:['Greek yogurt','Granola','Blueberries','Strawberries','Honey','Chia seeds','Almonds'],instructions:'Layer yogurt, granola, berries. Drizzle honey and sprinkle chia and almonds.'},
  {id:'r015',name:'Mushroom & Lentil Shepherd\'s Pie',emoji:'🥧',diet:'vegetarian',calories:450,protein:20,carbs:60,fat:10,fiber:14,ingredients:['Lentils','Mushrooms','Carrot','Celery','Onion','Vegetable broth','Sweet potato','Butter'],instructions:'Cook lentils. Sauté veggies and mushrooms, add broth. Top with mashed sweet potato. Bake 20 min.'},
  {id:'r016',name:'Tofu Stir-Fry with Brown Rice',emoji:'🥢',diet:'vegan',calories:400,protein:22,carbs:50,fat:12,fiber:7,ingredients:['Firm tofu','Brown rice','Broccoli','Bell pepper','Soy sauce','Ginger','Garlic','Sesame oil'],instructions:'Press and cube tofu, pan-fry until crispy. Stir-fry veggies. Add tofu, soy sauce, sesame oil. Serve over rice.'},
  {id:'r017',name:'Chickpea & Sweet Potato Buddha Bowl',emoji:'🥣',diet:'vegan',calories:420,protein:14,carbs:68,fat:12,fiber:13,ingredients:['Chickpeas','Sweet potato','Quinoa','Kale','Tahini','Lemon','Cumin','Paprika','Olive oil'],instructions:'Roast chickpeas and sweet potato with spices. Cook quinoa. Assemble bowls and drizzle with tahini-lemon dressing.'},
  {id:'r018',name:'Vegan Chia Pudding',emoji:'🌱',diet:'vegan',calories:270,protein:9,carbs:34,fat:12,fiber:11,ingredients:['Chia seeds','Coconut milk','Banana','Mango','Maple syrup','Vanilla','Flaxseeds'],instructions:'Mix chia seeds with coconut milk, maple syrup, and vanilla. Refrigerate overnight. Top with banana and mango.'},
  {id:'r019',name:'Red Lentil Vegetable Soup',emoji:'🍲',diet:'vegan',calories:320,protein:18,carbs:46,fat:5,fiber:15,ingredients:['Red lentils','Carrot','Celery','Onion','Garlic','Tomato','Vegetable broth','Cumin','Turmeric'],instructions:'Sauté onion, garlic with spices. Add lentils, vegetables, broth. Simmer 25 min. Finish with lemon juice.'},
  {id:'r020',name:'Avocado Toast with Hemp Seeds',emoji:'🍞',diet:'vegan',calories:310,protein:10,carbs:26,fat:20,fiber:9,ingredients:['Whole grain bread','Avocado','Hemp seeds','Lemon','Tomato','Chilli flakes'],instructions:'Toast bread. Mash avocado with lemon, salt, pepper. Spread on toast. Top with tomato, hemp seeds.'},
  {id:'r021',name:'Protein-Packed Greek Bowl',emoji:'💪',diet:'highprotein',calories:550,protein:55,carbs:30,fat:20,fiber:4,ingredients:['Chicken breast','Greek yogurt','Quinoa','Cucumber','Tomato','Feta','Lemon','Dill'],instructions:'Grill seasoned chicken. Cook quinoa. Mix yogurt with lemon and dill for sauce. Assemble bowls.'},
  {id:'r022',name:'Egg White Omelette with Turkey',emoji:'🍳',diet:'highprotein',calories:290,protein:40,carbs:6,fat:10,fiber:2,ingredients:['Egg whites','Turkey breast','Spinach','Mushrooms','Bell pepper','Feta','Olive oil'],instructions:'Sauté turkey and veggies. Pour egg whites over. Add feta and fold. Cook until done.'},
  {id:'r023',name:'Tuna & Cottage Cheese Rice Cakes',emoji:'🍥',diet:'highprotein',calories:240,protein:32,carbs:18,fat:4,fiber:1,ingredients:['Tuna','Cottage cheese','Rice cakes','Cucumber','Lemon','Dill'],instructions:'Mix tuna with cottage cheese, lemon, and dill. Spread on rice cakes. Top with cucumber slices.'},
  {id:'r024',name:'Beef & Broccoli Stir-Fry',emoji:'🥩',diet:'highprotein',calories:490,protein:48,carbs:18,fat:22,fiber:5,ingredients:['Sirloin beef','Broccoli','Soy sauce','Ginger','Garlic','Oyster sauce','Sesame oil','Brown rice'],instructions:'Marinate beef in soy sauce and cornstarch. Stir-fry on high heat. Add broccoli, garlic, ginger. Add oyster sauce. Serve over rice.'},
  {id:'r025',name:'Protein Smoothie Bowl',emoji:'🫐',diet:'highprotein',calories:380,protein:35,carbs:42,fat:8,fiber:6,ingredients:['Protein powder','Greek yogurt','Banana','Blueberries','Almond butter','Oats','Chia seeds','Honey'],instructions:'Blend protein powder, yogurt, banana until thick. Pour into bowl. Top with blueberries, oats, chia seeds, and almond butter.'},
];

// ── Date Helpers ───────────────────────────────────────────────────
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const dateStrToLabel = (s) => {
  if(!s) return '';
  const d = new Date(s+'T00:00:00');
  return d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
};
const daysBetween = (s1,s2) => {
  const a = new Date(s1+'T00:00:00'), b = new Date(s2+'T00:00:00');
  return Math.round((b-a)/(86400000));
};
const todayDayName = () => DAY_MAP[new Date().getDay()];

// ── State ──────────────────────────────────────────────────────────
// dailyLogs: { 'YYYY-MM-DD': { meals:{breakfast,lunch,dinner,snack}, water:0, activeMinutes:0 } }
// mealPlan:  { 'Monday': {breakfast,lunch,dinner,snack} } — weekly template
// weightHistory: [ {date:'YYYY-MM-DD', weight:70.0} ]
let S = {
  profile: null,
  dailyLogs: {},
  mealPlan: {},
  weightHistory: [],
  customRecipes: [],
  shopChecked: {},
  // runtime (not persisted)
  page: 'home',
  plannerDay: todayDayName(),
  addCtx: {date:null,slot:null,isPlanner:false},
  mealFilter: 'all',
  recipeFilter: 'all',
  obGoal: null,
  obDiet: 'balanced',
  obStep: 1,
  sessionStart: Date.now(),
  activeTimer: null,
  clockTimer: null,
};

// ── Persistence ────────────────────────────────────────────────────
const save = () => {
  localStorage.setItem('dp2_profile',  JSON.stringify(S.profile));
  localStorage.setItem('dp2_logs',     JSON.stringify(S.dailyLogs));
  localStorage.setItem('dp2_plan',     JSON.stringify(S.mealPlan));
  localStorage.setItem('dp2_weights',  JSON.stringify(S.weightHistory));
  localStorage.setItem('dp2_custom',   JSON.stringify(S.customRecipes));
  localStorage.setItem('dp2_shopchk',  JSON.stringify(S.shopChecked));
};
const load = () => {
  try {
    const parse = (k,fb) => { const v=localStorage.getItem(k); return v?JSON.parse(v):fb; };
    S.profile       = parse('dp2_profile',  null);
    S.dailyLogs     = parse('dp2_logs',     {});
    S.mealPlan      = parse('dp2_plan',     {});
    S.weightHistory = parse('dp2_weights',  []);
    S.customRecipes = parse('dp2_custom',   []);
    S.shopChecked   = parse('dp2_shopchk',  {});
  } catch(e){ console.warn('Load error',e); }

  // Ensure weekly template has all day/slot keys
  DAYS.forEach(d => {
    if(!S.mealPlan[d]) S.mealPlan[d] = {};
    SLOTS.forEach(sl => { if(!S.mealPlan[d][sl]) S.mealPlan[d][sl] = []; });
  });
  // Ensure today's log exists
  ensureTodayLog();
};

const ensureTodayLog = () => {
  const today = todayStr();
  if(!S.dailyLogs[today]) {
    S.dailyLogs[today] = { meals:{breakfast:[],lunch:[],dinner:[],snack:[]}, water:0, activeMinutes:0 };
  } else {
    // Make sure all slots exist
    if(!S.dailyLogs[today].meals) S.dailyLogs[today].meals = {};
    SLOTS.forEach(sl => { if(!S.dailyLogs[today].meals[sl]) S.dailyLogs[today].meals[sl] = []; });
    if(!S.dailyLogs[today].activeMinutes) S.dailyLogs[today].activeMinutes = 0;
    if(!S.dailyLogs[today].water) S.dailyLogs[today].water = 0;
  }
};

const getTodayLog = () => { ensureTodayLog(); return S.dailyLogs[todayStr()]; };

// ── Time-based Calculations ────────────────────────────────────────
/**
 * Streak: count consecutive days (ending today) where the user logged
 * at least 1 meal OR drank at least 1 glass of water.
 */
const calcStreak = () => {
  const today = todayStr();
  let streak = 0;
  let cursor = new Date(today+'T00:00:00');
  while(true) {
    const ds = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}-${String(cursor.getDate()).padStart(2,'0')}`;
    const log = S.dailyLogs[ds];
    const hasActivity = log && (
      log.water > 0 ||
      SLOTS.some(sl => (log.meals?.[sl]||[]).length > 0)
    );
    if(!hasActivity) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
    if(streak > 3650) break; // safety cap
  }
  return streak;
};

/** Total active minutes today = stored + current session minutes */
const calcActiveMinutes = () => {
  const log = getTodayLog();
  const sessionMins = Math.floor((Date.now() - S.sessionStart) / 60000);
  return (log.activeMinutes||0) + sessionMins;
};

const formatActiveTime = (mins) => {
  if(mins < 60) return `${mins}m`;
  return `${Math.floor(mins/60)}h ${mins%60}m`;
};

/** Latest logged weight */
const latestWeight = () => {
  if(!S.weightHistory.length) return null;
  return [...S.weightHistory].sort((a,b)=>b.date.localeCompare(a.date))[0];
};

/** Weight change over last 30 days */
const weightTrend = () => {
  if(S.weightHistory.length < 2) return null;
  const sorted = [...S.weightHistory].sort((a,b)=>a.date.localeCompare(b.date));
  const today = todayStr();
  const recent = sorted.filter(e=>daysBetween(e.date,today)<=30);
  if(recent.length < 2) return null;
  const change = recent[recent.length-1].weight - recent[0].weight;
  return change;
};

/** Logged days total */
const loggedDaysCount = () => Object.keys(S.dailyLogs).filter(d=>{
  const l=S.dailyLogs[d];
  return l && (l.water>0 || SLOTS.some(s=>(l.meals?.[s]||[]).length>0));
}).length;

/** Average water glasses per logged day */
const avgWater = () => {
  const days = Object.values(S.dailyLogs).filter(l=>l.water>0);
  if(!days.length) return 0;
  return (days.reduce((s,l)=>s+l.water,0)/days.length).toFixed(1);
};

// ── BMR / TDEE / Macros ────────────────────────────────────────────
const calcBMR  = p => p.gender==='male'
  ? 88.362 + 13.397*p.weight + 4.799*p.height - 5.677*p.age
  : 447.593 + 9.247*p.weight + 3.098*p.height - 4.330*p.age;
const calcTDEE = p => Math.round(calcBMR(p) * parseFloat(p.activity));
const targetCal = p => {
  const t = calcTDEE(p);
  return p.goal==='lose' ? Math.round(t-500) : p.goal==='gain' ? Math.round(t+300) : t;
};
const calcMacros = p => {
  const c = targetCal(p);
  let prot, carb, fat;
  switch(p.diet){
    case 'keto':        prot=Math.round(c*.25/4); fat=Math.round(c*.70/9); carb=Math.round(c*.05/4); break;
    case 'highprotein': prot=Math.round(c*.40/4); fat=Math.round(c*.25/9); carb=Math.round(c*.35/4); break;
    case 'vegan':
    case 'vegetarian':  prot=Math.round(c*.20/4); fat=Math.round(c*.30/9); carb=Math.round(c*.50/4); break;
    default:            prot=Math.round(c*.30/4); fat=Math.round(c*.30/9); carb=Math.round(c*.40/4);
  }
  return {prot, carb, fat};
};
const calcBMI = p => (p.weight/((p.height/100)**2)).toFixed(1);

// ── Today's nutrition totals ───────────────────────────────────────
const allRecipes = () => [...BASE_RECIPES, ...S.customRecipes];
const getRecipe  = id => allRecipes().find(r => r.id === id);

const todayNutrition = () => {
  const log = getTodayLog();
  let cal=0, prot=0, carbs=0, fat=0, fiber=0;
  SLOTS.forEach(sl => (log.meals[sl]||[]).forEach(id => {
    const r = getRecipe(id);
    if(r){ cal+=r.calories; prot+=r.protein; carbs+=r.carbs; fat+=r.fat; fiber+=(r.fiber||0); }
  }));
  return {cal, prot, carbs, fat, fiber};
};

// ── Toast ──────────────────────────────────────────────────────────
const toast = (msg, ms=2800) => {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), ms);
};

// ── Modal helper ───────────────────────────────────────────────────
const modal = (id, open) => document.getElementById(id)?.classList.toggle('active', open);

// ── Navigation ─────────────────────────────────────────────────────
// ─ triggerFade: resets animation on a container so content swaps feel instant but smooth ─
const triggerFade = (el) => {
  if(!el) return;
  el.classList.remove('content-fade');
  void el.offsetWidth;               // force reflow
  el.classList.add('content-fade');
};

const goto = page => {
  if(S.page === page) return;        // already on this page

  const leavingPage = document.querySelector('.page.active');
  const enteringPage = document.getElementById(`page-${page}`);
  if(!enteringPage) return;

  // Update nav immediately
  document.querySelectorAll('.navlink').forEach(n => n.classList.remove('active'));
  document.querySelector(`.navlink[data-page="${page}"]`)?.classList.add('active');
  document.getElementById('nav-links')?.classList.remove('open');
  S.page = page;

  if(leavingPage && leavingPage !== enteringPage) {
    // Play exit animation on current page
    leavingPage.classList.add('page-exit');
    leavingPage.classList.remove('active');

    const DURATION = 200; // ms — must match pageExit animation duration
    setTimeout(() => {
      leavingPage.classList.remove('page-exit');
      enteringPage.classList.add('active');
      renderPage(page);
    }, DURATION);
  } else {
    enteringPage.classList.add('active');
    renderPage(page);
  }
};

const renderPage = p => {
  switch(p){
    case 'home':      renderHome();      break;
    case 'tracking':  renderTracking();  break;
    case 'mealplans': renderPlanner();   break;
    case 'recipes':   renderRecipes();   break;
    case 'shopping':  renderShopping();  break;
    case 'profile':   renderProfile();   break;
  }
};

// ── Live Clock ─────────────────────────────────────────────────────
const startClock = () => {
  const tick = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    const ss = String(now.getSeconds()).padStart(2,'0');
    const clockEl = document.getElementById('nav-clock');
    if(clockEl) clockEl.textContent = `${hh}:${mm}:${ss}`;

    const dateEl = document.getElementById('nav-date');
    if(dateEl) dateEl.textContent = now.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});

    // Refresh hero active time every minute
    if(ss === '00') {
      updateHeroStats();
      if(S.page === 'tracking') renderTrackingStats();
      if(S.page === 'profile')  renderProfile();
    }
  };
  tick();
  S.clockTimer = setInterval(tick, 1000);
};

// ── Active Time Tracker ────────────────────────────────────────────
const startActiveTimer = () => {
  // Save accumulated minutes every 60 seconds
  S.activeTimer = setInterval(() => {
    const log = getTodayLog();
    log.activeMinutes = (log.activeMinutes||0) + 1;
    S.sessionStart = Date.now(); // reset so we don't double count
    save();
  }, 60000);
};

// ── HOME render ────────────────────────────────────────────────────
const renderHome = () => {
  const p = S.profile; if(!p) return;
  updateHeroStats();
};

const updateHeroStats = () => {
  const p = S.profile; if(!p) return;
  const {cal} = todayNutrition();
  const tCal  = targetCal(p);
  const log   = getTodayLog();
  const water = log.water;
  const streak = calcStreak();
  const activeMins = calcActiveMinutes();
  const lw = latestWeight();
  const trend = weightTrend();

  // Hero cal
  setText('hero-cal-num', cal);

  // Progress ring
  const pct = Math.min(cal / tCal, 1);
  const circ = 2 * Math.PI * 24;
  const ringEl = document.getElementById('hero-ring');
  if(ringEl) ringEl.style.strokeDashoffset = circ - pct * circ;
  setText('hero-ring-pct', Math.round(pct*100)+'%');
  const msg = pct >= 1 ? '🎯 Goal reached!' : pct >= 0.75 ? 'Almost there! 🔥' : pct >= 0.4 ? 'Great Progress!' : 'Let\'s go! 💪';
  setText('hero-progress-msg', msg);
  setText('hero-progress-sub', `${cal} / ${tCal} kcal`);

  // Water
  setText('hero-water-num', water);
  const dots = document.getElementById('hero-water-dots');
  if(dots) {
    dots.innerHTML = '';
    for(let i=1;i<=8;i++){
      const d = document.createElement('div');
      d.className = 'wdot' + (i<=water?' on':'');
      dots.appendChild(d);
    }
  }

  // Active time
  setText('hero-active-time', formatActiveTime(activeMins));
  setText('hero-active-sub', activeMins > 60 ? 'Great session! 🏃' : 'Today\'s session');

  // Weight
  if(lw) {
    setText('hero-weight-val', lw.weight.toFixed(1));
    if(trend !== null) {
      const el = document.getElementById('hero-weight-trend');
      if(el) {
        el.textContent = (trend > 0 ? `↑ +${trend.toFixed(1)}` : `↓ ${trend.toFixed(1)}`) + ' kg (30d)';
        el.style.color = trend > 0 ? (p.goal==='gain' ? 'var(--lime)' : '#fcd34d') : (p.goal==='lose' ? 'var(--lime)' : '#fcd34d');
      }
    } else {
      setText('hero-weight-trend', 'Tap to log weight');
    }
    // Weight sparkline
    updateWeightSparkline();
  } else {
    setText('hero-weight-val', '--');
    setText('hero-weight-trend', 'Tap to log weight');
  }

  // Streak
  setText('hero-streak', streak);
  setText('streak-plural', streak === 1 ? '' : 's');
  const sMsg = streak === 0 ? 'Start your streak today! 🌱'
    : streak < 3   ? 'Great start! Keep going! 🚀'
    : streak < 7   ? 'Almost a week! Amazing! 🔥'
    : streak < 30  ? `${streak} days strong! 💪`
    : `${streak} days! Legendary! 🏆`;
  setText('streak-msg', sMsg);
};

const updateWeightSparkline = () => {
  const spark = document.getElementById('weight-spark');
  if(!spark || S.weightHistory.length < 2) return;
  const sorted = [...S.weightHistory].sort((a,b)=>a.date.localeCompare(b.date)).slice(-8);
  const vals = sorted.map(e=>e.weight);
  const minV = Math.min(...vals), maxV = Math.max(...vals);
  const range = maxV - minV || 1;
  const pts = vals.map((v,i) => {
    const x = (i / (vals.length-1)) * 80;
    const y = 20 - ((v - minV) / range) * 18;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  spark.setAttribute('points', pts);
};

// ── TRACKING render ────────────────────────────────────────────────
const renderTracking = () => {
  const p = S.profile; if(!p) return;
  // Date label
  const dl = document.getElementById('track-date-lbl');
  if(dl) dl.textContent = new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  renderTrackingStats();
  renderWaterGrid();
  renderTodaysMeals();
  renderWeightHistory();
  // Tip
  setText('tip-text', TIPS[new Date().getDate() % TIPS.length]);
};

const renderTrackingStats = () => {
  const p = S.profile; if(!p) return;
  const {cal,prot,carbs,fat,fiber} = todayNutrition();
  const tCal = targetCal(p);
  const {prot:tProt, carb:tCarb, fat:tFat} = calcMacros(p);
  const streak = calcStreak();
  const activeMins = calcActiveMinutes();
  const rem = Math.max(tCal - cal, 0);
  const pct = Math.min(cal/tCal,1);

  // Calorie ring
  const circ = 2*Math.PI*72;
  const ringEl = document.getElementById('track-ring-el');
  if(ringEl) ringEl.style.strokeDashoffset = circ - pct*circ;
  setText('tr-cal-num', cal);
  setText('tr-target',  tCal+' kcal');
  setText('tr-eaten',   cal+' kcal');
  setText('tr-remain',  rem+' left');
  setText('tr-remaining-side', rem+' kcal');
  setText('tr-streak',  streak+(streak===1?' day':' days'));
  setText('tr-active',  formatActiveTime(activeMins));

  // Macro bars
  setBar('p', prot,  tProt); setText('p-tgt', tProt);
  setBar('c', carbs, tCarb); setText('c-tgt', tCarb);
  setBar('f', fat,   tFat);  setText('f-tgt', tFat);
  setBar('fi', fiber, 30);
  setText('p-val-lbl', `${prot} / `);
  document.getElementById('p-val-lbl').innerHTML = `${prot} / <span id="p-tgt">${tProt}</span>g`;
  setText('fi-val-lbl', `${fiber} / 30g`);

  // Summary chips
  const chipsEl = document.getElementById('summary-chips');
  if(chipsEl){
    const chips = [];
    chips.push({cls:'good',icon:'🔥',text:`Streak: ${streak} day${streak!==1?'s':''}`});
    chips.push({cls:'info',icon:'💧',text:`Water: ${getTodayLog().water}/8`});
    chips.push({cls: pct>=1?'good':pct>=0.7?'warn':'info', icon:'🎯', text:`Calories: ${cal}/${tCal}`});
    chips.push({cls:'info',icon:'⏱',text:`Active: ${formatActiveTime(activeMins)}`});
    const lw = latestWeight();
    if(lw) chips.push({cls:'good',icon:'⚖️',text:`Weight: ${lw.weight.toFixed(1)} kg`});
    chipsEl.innerHTML = chips.map(c=>`<div class="chip ${c.cls}">${c.icon} ${c.text}</div>`).join('');
  }
};

const setBar = (pfx, val, tgt) => {
  const pct = tgt>0 ? Math.min((val/tgt)*100, 100) : 0;
  const b = document.getElementById(`${pfx}-bar`);
  if(b) b.style.width = pct+'%';
};
const setText = (id, val) => { const el=document.getElementById(id); if(el) el.textContent = val; };

// ── Water Grid ─────────────────────────────────────────────────────
const renderWaterGrid = () => {
  const grid = document.getElementById('water-grid'); if(!grid) return;
  const log  = getTodayLog();
  grid.innerHTML = '';
  for(let i=1; i<=8; i++){
    const btn = document.createElement('button');
    btn.className = 'wglass' + (i<=log.water ? ' on' : '');
    btn.setAttribute('aria-label', `Glass ${i}`);
    btn.innerHTML = `<span>${i<=log.water?'💧':'🫙'}</span>`;
    btn.addEventListener('click', () => {
      log.water = log.water >= i ? i-1 : i;
      save(); renderWaterGrid();
      setText('wt-count', log.water);
      setText('wt-ml-lbl', log.water*250+'ml');
      updateHeroStats();
      if(log.water === 8) toast('🎉 Daily water goal achieved! Stay hydrated.');
      if(log.water === 0) toast('💧 Water tracker reset');
    });
    grid.appendChild(btn);
  }
  setText('wt-count', log.water);
  setText('wt-ml-lbl', log.water*250+'ml');
};

// ── Today's Meals (date-keyed) ─────────────────────────────────────
const renderTodaysMeals = () => {
  const log  = getTodayLog();
  const grid = document.getElementById('meals-today-grid'); if(!grid) return;
  grid.innerHTML = '';
  const today = todayStr();

  SLOTS.forEach(slot => {
    const items = (log.meals[slot]||[]).map(id=>getRecipe(id)).filter(Boolean);
    const slotCal = items.reduce((s,r)=>s+r.calories, 0);
    const card = document.createElement('div');
    card.className = 'meal-slot-card';
    card.innerHTML = `
      <div class="slot-head">
        <span class="slot-name">${SLOT_LABELS[slot]}</span>
        <button class="slot-add-btn" data-date="${today}" data-slot="${slot}" aria-label="Add">+</button>
      </div>
      ${items.length===0?'<div class="slot-empty">No meals logged yet</div>':''}
      ${items.map(r=>`
        <div class="meal-item">
          <span class="mi-name" title="${r.name}">${r.emoji} ${r.name}</span>
          <span class="mi-cal">${r.calories}</span>
          <span class="mi-rm" data-date="${today}" data-slot="${slot}" data-id="${r.id}" title="Remove">✕</span>
        </div>`).join('')}
      ${items.length>0?`<div class="slot-total">${slotCal} kcal</div>`:''}
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.slot-add-btn').forEach(b => b.addEventListener('click', () => openAddMeal(b.dataset.date, b.dataset.slot, false)));
  grid.querySelectorAll('.mi-rm').forEach(b => b.addEventListener('click', () => removeDailyMeal(b.dataset.date, b.dataset.slot, b.dataset.id)));
};

// ── Add meal modal ─────────────────────────────────────────────────
const openAddMeal = (dateOrDay, slot, isPlanner=false) => {
  S.addCtx = {dateOrDay, slot, isPlanner};
  document.getElementById('add-slot-label').textContent = SLOT_LABELS[slot]||slot;
  document.getElementById('meal-search').value = '';
  S.mealFilter = 'all';
  document.querySelectorAll('#meal-filter-row .ftab').forEach(t=>t.classList.toggle('active',t.dataset.f==='all'));
  renderMealResults('');
  modal('add-meal-overlay', true);
};
const renderMealResults = q => {
  const f  = S.mealFilter;
  const ql = q.toLowerCase();
  const res = allRecipes().filter(r => {
    const mf = f==='all' || r.diet===f;
    const mq = !ql || r.name.toLowerCase().includes(ql) || (r.ingredients||[]).some(i=>i.toLowerCase().includes(ql));
    return mf && mq;
  });
  const cont = document.getElementById('meal-results');
  cont.innerHTML = '';
  if(!res.length){ cont.innerHTML='<div style="text-align:center;padding:2rem;color:#555">No recipes found</div>'; return; }
  res.forEach(r => {
    const el = document.createElement('div');
    el.className = 'res-item';
    el.innerHTML = `<div><div class="res-name">${r.emoji} ${r.name}</div><div class="res-meta">${r.protein}g protein · ${r.carbs}g carbs · ${r.fat}g fat</div></div><div class="res-cal">${r.calories} kcal</div>`;
    el.addEventListener('click', () => confirmAddMeal(r.id));
    cont.appendChild(el);
  });
};
const confirmAddMeal = id => {
  const {dateOrDay, slot, isPlanner} = S.addCtx;
  if(isPlanner){
    S.mealPlan[dateOrDay][slot].push(id);
  } else {
    ensureTodayLog();
    S.dailyLogs[dateOrDay].meals[slot].push(id);
  }
  save();
  modal('add-meal-overlay', false);
  const r = getRecipe(id);
  toast(`✅ Added ${r?.name||'meal'}`);
  renderPage(S.page);
  updateHeroStats();
};
const removeDailyMeal = (date, slot, id) => {
  const log = S.dailyLogs[date]; if(!log) return;
  const arr = log.meals[slot]; if(!arr) return;
  const i = arr.indexOf(id); if(i>-1) arr.splice(i,1);
  save(); renderPage(S.page); updateHeroStats(); toast('🗑 Meal removed');
};
const removePlannerMeal = (day, slot, id) => {
  const arr = S.mealPlan[day]?.[slot]; if(!arr) return;
  const i = arr.indexOf(id); if(i>-1) arr.splice(i,1);
  save(); renderPlanner(); toast('🗑 Meal removed from planner');
};

// ── Recipe Detail ──────────────────────────────────────────────────
const openRecipeDetail = id => {
  const r = getRecipe(id); if(!r) return;
  document.getElementById('recipe-detail-title').textContent = `${r.emoji} ${r.name}`;
  const today = todayStr();
  document.getElementById('recipe-detail-body').innerHTML = `
    <div class="rd-macros">
      <div class="rd-m-box"><div class="rd-m-val lime">${r.calories}</div><div class="rd-m-lbl">kcal</div></div>
      <div class="rd-m-box"><div class="rd-m-val" style="color:#a78bfa">${r.protein}g</div><div class="rd-m-lbl">Protein</div></div>
      <div class="rd-m-box"><div class="rd-m-val" style="color:#67e8f9">${r.carbs}g</div><div class="rd-m-lbl">Carbs</div></div>
      <div class="rd-m-box"><div class="rd-m-val" style="color:#fcd34d">${r.fat}g</div><div class="rd-m-lbl">Fat</div></div>
    </div>
    ${r.fiber?`<p style="font-size:.78rem;color:#555;margin-bottom:.75rem">🌿 Fiber: ${r.fiber}g</p>`:''}
    <h4 style="font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#888;margin-bottom:.5rem">🧂 Ingredients</h4>
    <ul class="rd-ing-list">${(r.ingredients||[]).map(i=>`<li>${i}</li>`).join('')}</ul>
    ${r.instructions?`<h4 style="font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#888;margin:1rem 0 .5rem">📋 Instructions</h4><p class="rd-inst">${r.instructions}</p>`:''}
    <h4 style="font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#888;margin:1.25rem 0 .5rem">➕ Log for Today</h4>
    <div class="add-to-btns">
      ${SLOTS.map(sl=>`<button class="btn-outline-lime sm rd-add-btn" data-slot="${sl}" data-date="${today}" data-id="${id}">${SLOT_LABELS[sl]}</button>`).join('')}
    </div>
    ${r.custom?`<button class="btn-danger" style="width:100%;margin-top:1rem" data-del="${id}">🗑 Delete Custom Recipe</button>`:''}
  `;
  document.querySelectorAll('.rd-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      S.addCtx = {dateOrDay: btn.dataset.date, slot: btn.dataset.slot, isPlanner: false};
      confirmAddMeal(btn.dataset.id);
      modal('recipe-detail-overlay', false);
    });
  });
  const delBtn = document.querySelector('[data-del]');
  if(delBtn) delBtn.addEventListener('click', () => {
    S.customRecipes = S.customRecipes.filter(r=>r.id!==delBtn.dataset.del);
    save(); modal('recipe-detail-overlay', false); renderRecipes(); toast('🗑 Recipe deleted');
  });
  modal('recipe-detail-overlay', true);
};

// ── Recipes render ─────────────────────────────────────────────────
const renderRecipes = (q, f) => {
  if(f !== undefined) S.recipeFilter = f;
  const qv  = (q ?? document.getElementById('recipe-search')?.value ?? '').toLowerCase();
  const af  = S.recipeFilter;
  const res = allRecipes().filter(r => {
    const mf = af==='all' || (af==='custom'?r.custom:r.diet===af);
    const mq = !qv || r.name.toLowerCase().includes(qv) || (r.ingredients||[]).some(i=>i.toLowerCase().includes(qv));
    return mf && mq;
  });
  const grid = document.getElementById('recipe-grid'); if(!grid) return;
  grid.innerHTML = '';
  if(!res.length){ grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#555">No recipes match your search.</div>'; return; }
  res.forEach(r => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    const dl = r.diet.charAt(0).toUpperCase()+r.diet.slice(1);
    card.innerHTML = `
      <div class="rc-emoji">${r.emoji||'🍽'}</div>
      <div class="rc-name">${r.name}</div>
      <span class="rc-badge badge-${r.custom?'custom':r.diet}">${r.custom?'Custom':dl}</span>
      <div class="rc-macros">
        <div class="rc-mac">🥩 <strong>${r.protein}g</strong></div>
        <div class="rc-mac">🌾 <strong>${r.carbs}g</strong></div>
        <div class="rc-mac">🥑 <strong>${r.fat}g</strong></div>
      </div>
      <div class="rc-foot"><div class="rc-cal">${r.calories} kcal</div><div class="rc-hint">Tap for details →</div></div>`;
    card.addEventListener('click', () => openRecipeDetail(r.id));
    grid.appendChild(card);
  });
};

// ── Custom recipe ──────────────────────────────────────────────────
const saveCustomRecipe = () => {
  const name = document.getElementById('cr-name').value.trim();
  const cal  = parseInt(document.getElementById('cr-cal').value, 10);
  const prot = parseInt(document.getElementById('cr-prot').value, 10);
  const carb = parseInt(document.getElementById('cr-carb').value, 10);
  const fat  = parseInt(document.getElementById('cr-fat').value, 10);
  const diet = document.getElementById('cr-diet').value;
  const ing  = document.getElementById('cr-ing').value;
  const inst = document.getElementById('cr-inst').value.trim();
  if(!name||isNaN(cal)||isNaN(prot)||isNaN(carb)||isNaN(fat)){ toast('⚠️ Please fill all required fields'); return; }
  S.customRecipes.push({
    id:'c'+Date.now(), name, calories:cal, protein:prot, carbs:carb, fat, diet,
    emoji:'🍽', fiber:0,
    ingredients: ing ? ing.split(',').map(s=>s.trim()).filter(Boolean) : [],
    instructions: inst, custom:true,
  });
  save(); modal('create-recipe-overlay', false);
  renderRecipes('', 'custom');
  document.querySelectorAll('#recipe-filter-row .ftab').forEach(t=>t.classList.toggle('active',t.dataset.f==='custom'));
  toast(`✅ "${name}" saved!`);
};

// ── Planner (weekly template) ──────────────────────────────────────
const renderPlanner = () => {
  const day     = S.plannerDay;
  const dayPlan = S.mealPlan[day];
  const grid    = document.getElementById('planner-grid'); if(!grid) return;
  grid.innerHTML = '';

  SLOTS.forEach(slot => {
    const items    = (dayPlan[slot]||[]).map(id=>getRecipe(id)).filter(Boolean);
    const slotCal  = items.reduce((s,r)=>s+r.calories, 0);
    const el       = document.createElement('div');
    el.className   = 'planner-slot';
    el.innerHTML   = `
      <div class="slot-head">
        <span class="slot-name">${SLOT_LABELS[slot]}</span>
        <button class="slot-add-btn" data-day="${day}" data-slot="${slot}">+</button>
      </div>
      ${items.length===0?'<div class="slot-empty">Tap + to add template meals</div>':''}
      ${items.map(r=>`
        <div class="meal-item">
          <span class="mi-name" title="${r.name}">${r.emoji} ${r.name}</span>
          <span class="mi-cal">${r.calories}</span>
          <span class="mi-rm-plan" data-day="${day}" data-slot="${slot}" data-id="${r.id}">✕</span>
        </div>`).join('')}
      ${items.length>0?`<div class="slot-total">${slotCal} kcal</div>`:''}
    `;
    grid.appendChild(el);
  });

  grid.querySelectorAll('.slot-add-btn').forEach(b => b.addEventListener('click', () => openAddMeal(b.dataset.day, b.dataset.slot, true)));
  grid.querySelectorAll('.mi-rm-plan').forEach(b => b.addEventListener('click', () => removePlannerMeal(b.dataset.day, b.dataset.slot, b.dataset.id)));
  renderWeekChips();
};

const renderWeekChips = () => {
  const chips = document.getElementById('week-chips'); if(!chips) return;
  chips.innerHTML = '';
  DAYS.forEach(d => {
    let tot = 0;
    SLOTS.forEach(sl => (S.mealPlan[d]?.[sl]||[]).forEach(id => { const r=getRecipe(id); if(r) tot+=r.calories; }));
    const chip = document.createElement('div');
    chip.className = 'week-chip';
    chip.innerHTML = `<div class="wc-day">${d.slice(0,3)}</div><div class="wc-cal">${tot||'—'}</div><div class="wc-lbl">kcal</div>`;
    chips.appendChild(chip);
  });
};

// ── Use Today's Plan: copy planner template → today's log ──────────
const useTodaysPlan = () => {
  const today   = todayStr();
  const dayName = todayDayName();
  const plan    = S.mealPlan[dayName];
  const log     = getTodayLog();
  let added = 0;
  SLOTS.forEach(sl => {
    (plan[sl]||[]).forEach(id => {
      if(!(log.meals[sl]||[]).includes(id)){
        log.meals[sl].push(id); added++;
      }
    });
  });
  save();
  if(added > 0){
    toast(`📋 Added ${added} meal(s) from ${dayName}'s template to today's log`);
    if(S.page === 'tracking') renderTracking();
    updateHeroStats();
  } else {
    toast(`ℹ️ No new meals to copy from ${dayName}'s template`);
  }
};

// ── Weight History ─────────────────────────────────────────────────
const logWeight = () => {
  const val = parseFloat(document.getElementById('wt-input').value);
  if(isNaN(val)||val<20||val>400){ toast('⚠️ Enter a valid weight (20–400 kg)'); return; }
  const today = todayStr();
  // Update or insert today's entry
  const idx = S.weightHistory.findIndex(e=>e.date===today);
  if(idx >= 0) S.weightHistory[idx].weight = val;
  else         S.weightHistory.push({date:today, weight:val});
  // Also update profile weight to latest
  if(S.profile) S.profile.weight = val;
  save();
  modal('weight-overlay', false);
  toast(`✅ Weight logged: ${val} kg`);
  updateHeroStats();
  if(S.page==='tracking')  renderWeightHistory();
  if(S.page==='profile')   renderProfile();
};

const renderWeightHistory = () => {
  const entries = [...S.weightHistory].sort((a,b)=>b.date.localeCompare(a.date));
  const noData  = document.getElementById('weight-no-data');
  const canvas  = document.getElementById('weight-chart');
  const entEls  = document.getElementById('weight-entries');

  if(!entries.length){
    if(noData) noData.style.display='block';
    if(canvas) canvas.style.display='none';
    if(entEls) entEls.innerHTML='';
    return;
  }
  if(noData) noData.style.display='none';
  if(canvas) {
    canvas.style.display='block';
    drawWeightChart(canvas, [...entries].reverse());
  }
  if(entEls){
    entEls.innerHTML = entries.slice(0,10).map(e=>`
      <div class="wt-entry">
        <span class="wt-date">${dateStrToLabel(e.date)}</span>
        <span class="wt-val">${e.weight.toFixed(1)} kg</span>
        <span class="wt-del" data-date="${e.date}" title="Delete">✕</span>
      </div>`).join('');
    entEls.querySelectorAll('.wt-del').forEach(b=>b.addEventListener('click',()=>{
      S.weightHistory = S.weightHistory.filter(e=>e.date!==b.dataset.date);
      save(); renderWeightHistory(); updateHeroStats(); toast('🗑 Entry removed');
    }));
  }
};

const drawWeightChart = (canvas, data) => {
  const ctx = canvas.getContext('2d');
  const W   = canvas.offsetWidth || 600;
  const H   = 80;
  canvas.width  = W;
  canvas.height = H;
  ctx.clearRect(0,0,W,H);
  if(data.length < 2) return;
  const vals = data.map(e=>e.weight);
  const minV = Math.min(...vals)-1, maxV = Math.max(...vals)+1;
  const range = maxV - minV || 1;
  const pts = data.map((e,i)=>({
    x: (i/(data.length-1))*W,
    y: H - ((e.weight-minV)/range)*(H-16) - 8,
  }));
  // Gradient fill
  const grad = ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0, 'rgba(197,241,53,0.25)');
  grad.addColorStop(1, 'rgba(197,241,53,0)');
  ctx.beginPath();
  ctx.moveTo(pts[0].x, H);
  pts.forEach(p=>ctx.lineTo(p.x,p.y));
  ctx.lineTo(pts[pts.length-1].x, H);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  // Line
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  pts.forEach(p=>ctx.lineTo(p.x,p.y));
  ctx.strokeStyle = '#C5F135';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(197,241,53,0.5)';
  ctx.shadowBlur  = 6;
  ctx.stroke();
  ctx.shadowBlur = 0;
  // Dots
  pts.forEach((p,i)=>{
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
    ctx.fillStyle = '#C5F135';
    ctx.fill();
  });
  // Labels
  ctx.fillStyle = 'rgba(136,136,136,0.8)';
  ctx.font = '10px Inter';
  ctx.textAlign = 'center';
  pts.forEach((p,i)=>{
    if(i===0||i===pts.length-1||i===Math.floor(pts.length/2)){
      ctx.fillText(data[i].weight.toFixed(1), p.x, p.y-6);
    }
  });
};

// ── Shopping List ──────────────────────────────────────────────────
const renderShopping = () => {
  const allIng = [];
  DAYS.forEach(d => SLOTS.forEach(sl => (S.mealPlan[d]?.[sl]||[]).forEach(id => {
    const r = getRecipe(id);
    if(r?.ingredients) r.ingredients.forEach(i => allIng.push(i.toLowerCase().trim()));
  })));
  const unique = [...new Set(allIng)].sort();
  const body  = document.getElementById('shop-body');
  const empty = document.getElementById('shop-empty');
  if(!unique.length){ body.innerHTML=''; empty.classList.add('visible'); return; }
  empty.classList.remove('visible');
  const cats = {};
  unique.forEach(item => {
    let cat = 'Other';
    for(const [cn,kws] of Object.entries(INGREDIENT_CATEGORIES)){
      if(kws.some(k=>item.includes(k))){ cat=cn; break; }
    }
    if(!cats[cat]) cats[cat]=[];
    cats[cat].push(item);
  });
  const order = ['Proteins','Vegetables','Fruits','Grains','Dairy','Fats & Oils','Pantry','Other'];
  body.innerHTML = '';
  order.forEach(cat => {
    if(!cats[cat]?.length) return;
    const sec = document.createElement('div');
    sec.className = 'shop-cat';
    sec.innerHTML = `<div class="shop-cat-title">${cat}</div>`;
    cats[cat].forEach(item => {
      const div  = document.createElement('div');
      const isChk= !!S.shopChecked[item];
      div.className = 'shop-item'+(isChk?' chk':'');
      const cbId = 'chk-'+item.replace(/\s+/g,'_');
      div.innerHTML = `<input type="checkbox" id="${cbId}" ${isChk?'checked':''}/><label for="${cbId}">${item.charAt(0).toUpperCase()+item.slice(1)}</label>`;
      div.querySelector('input').addEventListener('change', e=>{
        S.shopChecked[item] = e.target.checked;
        div.classList.toggle('chk', e.target.checked);
        save();
      });
      sec.appendChild(div);
    });
    body.appendChild(sec);
  });
};

// ── Profile ────────────────────────────────────────────────────────
const renderProfile = () => {
  const p = S.profile; if(!p) return;
  document.getElementById('p-name').value   = p.name||'';
  document.getElementById('p-gender').value = p.gender||'male';
  document.getElementById('p-age').value    = p.age||'';
  document.getElementById('p-wt').value     = p.weight||'';
  document.getElementById('p-ht').value     = p.height||'';
  document.getElementById('p-act').value    = p.activity||'1.55';
  document.querySelectorAll('#goal-pills .diet-pill').forEach(b=>b.classList.toggle('selected',b.dataset.goal===p.goal));
  document.querySelectorAll('#diet-pills-prof .diet-pill').forEach(b=>b.classList.toggle('selected',b.dataset.diet===(p.diet||'balanced')));

  const lw    = latestWeight();
  const dispW = lw ? lw.weight : p.weight;
  setText('prof-name',  p.name||'Your Name');
  const el = document.getElementById('prof-avatar');
  if(el) el.textContent = (p.name||'U')[0].toUpperCase();
  setText('prof-meta', `${p.age}y · ${p.gender==='male'?'Male':'Female'} · ${p.goal==='lose'?'Fat Loss':p.goal==='gain'?'Muscle Gain':'Maintenance'}`);
  setText('s-wt',   dispW+' kg');
  setText('s-ht',   p.height+' cm');
  setText('s-bmi',  calcBMI({...p,weight:dispW}));
  setText('s-bmr',  Math.round(calcBMR(p))+' kcal');
  setText('s-tdee', calcTDEE(p)+' kcal');
  setText('s-cal',  targetCal(p)+' kcal');
  const m = calcMacros(p);
  setText('s-prot', m.prot+'g'); setText('s-carb', m.carb+'g'); setText('s-fat', m.fat+'g');
  setText('s-streak',       calcStreak()+' days');
  setText('s-logged-days',  loggedDaysCount()+' days');
  setText('s-avg-water',    avgWater()+' glasses/day');
  setText('s-active',       formatActiveTime(calcActiveMinutes()));
};

const saveProfile = () => {
  const goal = document.querySelector('#goal-pills .diet-pill.selected')?.dataset.goal || S.profile?.goal || 'maintain';
  const diet = document.querySelector('#diet-pills-prof .diet-pill.selected')?.dataset.diet || S.profile?.diet || 'balanced';
  S.profile = {...S.profile,
    name:     document.getElementById('p-name').value.trim() || S.profile?.name || 'User',
    gender:   document.getElementById('p-gender').value,
    age:      parseInt(document.getElementById('p-age').value, 10),
    weight:   parseFloat(document.getElementById('p-wt').value),
    height:   parseFloat(document.getElementById('p-ht').value),
    activity: document.getElementById('p-act').value,
    goal, diet,
  };
  save(); renderProfile(); updateHeroStats();
  toast('✅ Profile saved! Targets recalculated.');
};

// ── Onboarding ─────────────────────────────────────────────────────
const showObStep = n => {
  S.obStep = n;
  document.querySelectorAll('.ob-step').forEach(s=>s.classList.remove('active'));
  document.getElementById(`step-${n}`)?.classList.add('active');
  document.querySelectorAll('.dot').forEach(d=>d.classList.toggle('active',parseInt(d.dataset.s)===n));
  const back = document.getElementById('ob-back-btn');
  if(back) back.style.display = n>1?'inline-flex':'none';
  const next = document.getElementById('ob-next-btn');
  if(next) next.textContent = n===3?'🚀 Get Started':'Next →';
};

const obNext = () => {
  if(S.obStep===1){
    const name   = document.getElementById('ob-name').value.trim();
    const gender = document.getElementById('ob-gender').value;
    const age    = parseInt(document.getElementById('ob-age').value, 10);
    const weight = parseFloat(document.getElementById('ob-weight').value);
    const height = parseFloat(document.getElementById('ob-height').value);
    const act    = document.getElementById('ob-activity').value;
    if(!name||isNaN(age)||isNaN(weight)||isNaN(height)){ toast('⚠️ Please fill all fields'); return; }
    S._ob = {name,gender,age,weight,height,activity:act};
    showObStep(2);
  } else if(S.obStep===2){
    if(!S.obGoal){ toast('⚠️ Please select a goal'); return; }
    showObStep(3);
  } else {
    const ob = S._ob;
    S.profile = {name:ob.name,gender:ob.gender,age:ob.age,weight:ob.weight,height:ob.height,activity:ob.activity,goal:S.obGoal,diet:S.obDiet};
    // Log starting weight
    S.weightHistory.push({date:todayStr(), weight:ob.weight});
    ensureTodayLog();
    save();
    modal('onboarding-overlay', false);
    const app = document.getElementById('app');
    app.style.display = 'block';
    app.classList.remove('app-hidden');
    goto('home');
    toast(`🎉 Welcome, ${S.profile.name}! Your plan is ready.`);
  }
};

// ── Events ─────────────────────────────────────────────────────────
const attachEvents = () => {
  // Onboarding
  document.getElementById('ob-next-btn')?.addEventListener('click', obNext);
  document.getElementById('ob-back-btn')?.addEventListener('click', ()=>showObStep(S.obStep-1));
  document.querySelectorAll('.goal-card').forEach(b=>{
    b.addEventListener('click', ()=>{
      S.obGoal = b.dataset.goal;
      document.querySelectorAll('.goal-card').forEach(x=>x.classList.remove('selected'));
      b.classList.add('selected');
    });
  });
  document.querySelectorAll('#step-3 .diet-pill').forEach(b=>{
    b.addEventListener('click', ()=>{
      S.obDiet = b.dataset.diet;
      document.querySelectorAll('#step-3 .diet-pill').forEach(x=>x.classList.remove('selected'));
      b.classList.add('selected');
    });
  });

  // Nav
  document.querySelectorAll('.navlink').forEach(b=>b.addEventListener('click',()=>goto(b.dataset.page)));
  document.getElementById('nav-cta-btn')?.addEventListener('click', ()=>goto('tracking'));
  document.getElementById('nav-profile-btn')?.addEventListener('click', ()=>goto('profile'));
  document.getElementById('brand-home-link')?.addEventListener('click', ()=>goto('home'));
  document.getElementById('hamburger')?.addEventListener('click', ()=>document.getElementById('nav-links').classList.toggle('open'));

  // Hero CTAs
  document.getElementById('hero-plan-btn')?.addEventListener('click', ()=>goto('tracking'));
  document.getElementById('hero-view-btn')?.addEventListener('click', ()=>goto('plans'));
  document.getElementById('feat-cta-btn')?.addEventListener('click', ()=>goto('tracking'));

  // Weight hero card (click to log)
  document.getElementById('weight-hero-card')?.addEventListener('click', ()=>openWeightModal());

  // Modals close
  const closeModalOn = (overlayId, btnId) => {
    document.getElementById(btnId)?.addEventListener('click', ()=>modal(overlayId, false));
    document.getElementById(overlayId)?.addEventListener('click', e=>{ if(e.target===e.currentTarget) modal(overlayId, false); });
  };
  closeModalOn('add-meal-overlay', 'add-meal-close');
  closeModalOn('recipe-detail-overlay', 'recipe-detail-close');
  closeModalOn('create-recipe-overlay', 'cr-close');
  closeModalOn('weight-overlay', 'weight-close');

  // Meal search & filter
  document.getElementById('meal-search')?.addEventListener('input', e=>renderMealResults(e.target.value));
  document.querySelectorAll('#meal-filter-row .ftab').forEach(t=>{
    t.addEventListener('click', ()=>{
      S.mealFilter = t.dataset.f;
      document.querySelectorAll('#meal-filter-row .ftab').forEach(x=>x.classList.toggle('active',x===t));
      renderMealResults(document.getElementById('meal-search').value);
      triggerFade(document.getElementById('meal-results'));
    });
  });


  // Recipe search & filter
  document.getElementById('recipe-search')?.addEventListener('input', e=>{
    renderRecipes(e.target.value);
    triggerFade(document.getElementById('recipe-grid'));
  });
  document.querySelectorAll('#recipe-filter-row .ftab').forEach(t=>{
    t.addEventListener('click', ()=>{
      document.querySelectorAll('#recipe-filter-row .ftab').forEach(x=>x.classList.toggle('active',x===t));
      renderRecipes('', t.dataset.f);
      triggerFade(document.getElementById('recipe-grid'));
    });
  });

  document.getElementById('create-recipe-btn')?.addEventListener('click', ()=>{
    ['cr-name','cr-cal','cr-prot','cr-carb','cr-fat','cr-ing','cr-inst'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    modal('create-recipe-overlay', true);
  });
  document.getElementById('cr-save')?.addEventListener('click', saveCustomRecipe);

  // Planner tabs
  document.querySelectorAll('.daytab').forEach(t=>{
    t.addEventListener('click', ()=>{
      S.plannerDay = t.dataset.day;
      document.querySelectorAll('.daytab').forEach(x=>x.classList.toggle('active',x===t));
      renderPlanner();
      triggerFade(document.getElementById('planner-grid'));

    });
  });
  document.getElementById('clear-week-btn')?.addEventListener('click', ()=>{
    if(confirm('Clear all meals from the weekly template?')){
      DAYS.forEach(d=>SLOTS.forEach(s=>S.mealPlan[d][s]=[]));
      save(); renderPlanner(); toast('🗑 Weekly template cleared');
    }
  });
  document.getElementById('use-today-btn')?.addEventListener('click', useTodaysPlan);

  // Tracking
  document.getElementById('reset-today-btn')?.addEventListener('click', ()=>{
    if(confirm("Clear all of today's logged meals?")){
      const log = getTodayLog();
      SLOTS.forEach(s=>log.meals[s]=[]);
      save(); renderTracking(); updateHeroStats(); toast("🗑 Today's meals cleared");
    }
  });
  document.getElementById('water-reset-btn')?.addEventListener('click', ()=>{
    getTodayLog().water = 0;
    save(); renderWaterGrid(); updateHeroStats(); toast('💧 Water tracker reset');
  });

  // Weight logging
  const openWeightModal = () => {
    const lw = latestWeight();
    const inp = document.getElementById('wt-input');
    if(inp && lw) inp.value = lw.weight;
    modal('weight-overlay', true);
    setTimeout(()=>document.getElementById('wt-input')?.focus(), 100);
  };
  document.getElementById('log-weight-btn')?.addEventListener('click', openWeightModal);
  document.getElementById('log-weight-btn2')?.addEventListener('click', openWeightModal);
  document.getElementById('wt-save')?.addEventListener('click', logWeight);
  document.getElementById('wt-input')?.addEventListener('keydown', e=>{ if(e.key==='Enter') logWeight(); });

  // Shopping
  document.getElementById('print-btn')?.addEventListener('click', ()=>window.print());
  document.getElementById('copy-btn')?.addEventListener('click', ()=>{
    const items = [...document.querySelectorAll('.shop-item label')].map(l=>l.textContent).join('\n');
    navigator.clipboard?.writeText(items).then(()=>toast('📋 Shopping list copied!')).catch(()=>toast('📋 Copy not supported'));
  });

  // Profile
  document.getElementById('save-profile-btn')?.addEventListener('click', saveProfile);
  document.querySelectorAll('#goal-pills .diet-pill').forEach(b=>{
    b.addEventListener('click', ()=>{ document.querySelectorAll('#goal-pills .diet-pill').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); });
  });
  document.querySelectorAll('#diet-pills-prof .diet-pill').forEach(b=>{
    b.addEventListener('click', ()=>{ document.querySelectorAll('#diet-pills-prof .diet-pill').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); });
  });
  document.getElementById('reset-app-btn')?.addEventListener('click', ()=>{
    if(confirm('Delete ALL data? This cannot be undone.')){
      localStorage.clear(); location.reload();
    }
  });

  // Keyboard close modals
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape'){
      ['add-meal-overlay','recipe-detail-overlay','create-recipe-overlay','weight-overlay']
        .forEach(id=>modal(id,false));
    }
  });
};

// ── BOOT ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  load();
  attachEvents();
  startClock();
  startActiveTimer();

  // Set today's day tab active in planner
  const todayDay = todayDayName();
  S.plannerDay = todayDay;
  document.querySelectorAll('.daytab').forEach(t => t.classList.toggle('active', t.dataset.day===todayDay));

  if(S.profile){
    modal('onboarding-overlay', false);
    const app = document.getElementById('app');
    app.style.display = 'block';
    app.classList.remove('app-hidden');
    goto('home');
  } else {
    showObStep(1);
    modal('onboarding-overlay', true);
  }
});
