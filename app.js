(function(){
'use strict';
/* =========================================================
   رسائلي المشفرة / My Encrypted Messages
   جميع الحقوق محفوظة © 2026 باسم أبو أنس
   ========================================================= */

/* ---------- الأبجديات / alphabets ---------- */
const AR_BASE = Array.from('ابتثجحخدذرزسشصضطظعغفقكلمنهوي');
const AR_OPT = ['ء','ة','ى'];
const AR_LETTERS = AR_BASE.concat(AR_OPT);
const EN_LETTERS = Array.from('abcdefghijklmnopqrstuvwxyz');
const AR_FALLBACK = {'أ':'ا','إ':'ا','آ':'ا','ٱ':'ا','ة':'ه','ى':'ي','ؤ':'و','ئ':'ي'};
const AR_STRIP = /[ً-ٰٟـ‎‏؜]/g;

const ALPHA = {
  ar:{ letters:AR_LETTERS, required:AR_BASE, optional:AR_OPT, dir:'rtl',
       sample:'السلام عليكم ورحمة الله',
       norm:s=>s.replace(AR_STRIP,''), low:ch=>ch, fallback:AR_FALLBACK, isLetter:/[ء-ي]/ },
  en:{ letters:EN_LETTERS, required:EN_LETTERS, optional:[], dir:'ltr',
       sample:'Meet me at the old library at seven',
       norm:s=>s.normalize('NFD').replace(/\p{M}/gu,''), low:ch=>ch.toLowerCase(), fallback:{}, isLetter:/[a-z]/i }
};

const KEY = 'rmz-langs-v1';
function zip(letters, syms){const m={};letters.forEach((l,i)=>{if(syms[i]!=null&&syms[i]!=='')m[l]=syms[i]});return m;}

/* ---------- النصوص / interface text ---------- */
const T = {
ar:{
  title:'رسائلي المشفرة',
  sub:'اكتب رسالتك لتحصل على الرموز، أو الصق الرموز لتعود إلى النص. أضف كلمة سر ليبقى ترتيب الرموز بينك وبين من تراسله.',
  uiLang:'لغة الواجهة', msgLang:'لغة الرسالة', ciphers:'اللغات المشفرة',
  alpha:{ar:'العربية', en:'الإنجليزية'},
  newLang:'＋ لغة جديدة',
  keyTitle:'المفتاح السري', keyOff:'غير مفعّل', keyFixed:'مفعّل: ترتيب خاص', keyVar:'مفعّل: تشفير متغير',
  pwPh:'كلمة سر يعرفها أنت ومن تراسله فقط', pwAria:'كلمة السر', show:'إظهار', hide:'إخفاء',
  varName:'تشفير متغير', varDesc:': يتغير شكل الحرف حسب موقعه في الرسالة، فيصعب كسره.',
  fpPre:'بصمة المفتاح:', fpPost:'. قارنها مع من تراسله؛ إن تطابقت فقد كتبتما نفس كلمة السر.',
  keyNoteOff:'بدون كلمة سر يستخدم البرنامج الترتيب العام، ويستطيع أي شخص يملك البرنامج قراءة رسالتك.',
  keyNoteOn:'لا تُحفظ كلمة السر ولا تُرسل مع الرسالة. أرسلها لصديقك بطريق آخر، وليكتبها هو بنفس الحروف تماماً.',
  swap:'عكس اتجاه الترجمة',
  inEnc:'رسالتك', inDec:n=>'النص المشفر ('+n+')', out:'الناتج',
  phEnc:'اكتب رسالتك هنا…', phDec:'الصق الرموز أو استخدم لوحة الرموز بالأسفل…',
  emptyEnc:'ستظهر الرموز هنا', emptyDec:'سيظهر النص هنا',
  missing:'حروف ليس لها رمز في هذه اللغة وبقيت كما هي: ',
  unknown:(n,l)=>'رموز غير معروفة في «'+n+'»: '+l+'. ربما تنتمي إلى لغة أخرى.',
  checkKey:'إذا ظهر النص بلا معنى فتأكد من كلمة السر ومن خيار التشفير المتغير.',
  noKeyDec:'أنت تفك بدون كلمة سر. إن كانت الرسالة مشفرة بكلمة سر فاكتبها أولاً.',
  copy:'نسخ الناتج', copied:'نُسخ ✓', copyManual:'حدّد النص وانسخه يدوياً',
  useOut:'نقل الناتج إلى الإدخال', clear:'مسح',
  keypad:'لوحة الرموز', keypadHint:'اضغط الرمز لإضافته إلى الإدخال',
  space:'فاصل كلمة', del:'⌫ حذف', keyAria:(s,c)=>c?'الرمز '+s+' للحرف '+c:'الرمز '+s,
  tbl:n=>'جدول مفاتيح «'+n+'»', tblKey:n=>'جدولك الخاص في «'+n+'»',
  descVar:'في التشفير المتغير لا يوجد جدول ثابت: الحرف نفسه يأخذ شكلاً مختلفاً حسب موقعه في الرسالة.',
  descKey:'هذا الترتيب ناتج عن كلمة السر، ولا يعرفه إلا من يعرفها. ',
  sepTxt:s=>'فاصل الحروف: «'+s+'». ', mine:'لغة من إنشائك.', asLetter:l=>'كـ '+l,
  copyEdit:'نسخ وتعديل', edit:'تعديل', remove:'حذف', confirm:'اضغط مرة أخرى للتأكيد',
  edNew:'لغة جديدة', edEdit:n=>'تعديل «'+n+'»', edCopy:n=>'نسخة من «'+n+'»', copySuffix:' (نسختي)',
  edFor:a=>'لرسائل '+a,
  edName:'اسم اللغة', edNamePh:'مثلاً: رموز القبيلة', edDir:'اتجاه كتابة الرموز',
  rtl:'من اليمين إلى اليسار', ltr:'من اليسار إلى اليمين',
  edSep:'فاصل بين الحروف', edSepPh:'اتركه فارغاً للرموز المفردة', edWord:'فاصل بين الكلمات',
  edNote:{ar:'الحروف الثمانية والعشرون مطلوبة. ء ة ى اختيارية؛ إن تُركت فارغة تُكتب ة كـ ه، وى كـ ي. الهمزات على الألف والواو والياء تُعامل كحروفها.',
          en:'الحروف الإنجليزية الستة والعشرون مطلوبة. الحرف الكبير والصغير لهما نفس الرمز.'},
  edRandom:'توليد رموز عشوائية', edClear:'تفريغ الخانات', edSave:'حفظ اللغة', edCancel:'إلغاء',
  edCellAria:c=>'رمز الحرف '+c,
  errName:'اكتب اسماً للغة.', errMissing:'حروف بلا رمز: ', errDup:'رموز مكررة: ',
  errSepSame:'فاصل الحروف يجب أن يختلف عن فاصل الكلمات.', errWord:'فاصل الكلمات لا يمكن أن يكون فارغاً.',
  errSepIn:'بعض الرموز تحتوي على الفاصل نفسه.', errSpace:'الرموز لا تحتوي على مسافات.',
  errAmb:'بعض الرموز تبدأ برمز آخر؛ أضف فاصلاً بين الحروف حتى لا يلتبس فك التشفير.',
  saved:n=>'حُفظت «'+n+'» وأصبحت اللغة المختارة.',
  share:'تصدير واستيراد',
  shareNote:'كل لغة تُحفظ في متصفحك. لمشاركتها أو نقلها لجهاز آخر انسخ بياناتها، ثم الصقها في خانة الاستيراد هناك.',
  exportLbl:n=>'بيانات «'+n+'» (بدون كلمة السر)', copyData:'نسخ البيانات',
  importLbl:'الصق بيانات لغة هنا', importBtn:'استيراد',
  importBad:'البيانات ليست بصيغة صحيحة. انسخها كاملة من خانة التصدير.',
  importedSuffix:' (مستوردة)', imported:n=>'أُضيفت «'+n+'».',
  footer:'جميع الحقوق محفوظة © 2026 باسم أبو أنس'
},
en:{
  title:'My Encrypted Messages',
  sub:'Type a message to turn it into symbols, or paste symbols to get the text back. Add a password so the symbol order stays between you and the people you write to.',
  uiLang:'Interface', msgLang:'Message language', ciphers:'Ciphers',
  alpha:{ar:'Arabic', en:'English'},
  newLang:'＋ New cipher',
  keyTitle:'Secret key', keyOff:'Off', keyFixed:'On: private order', keyVar:'On: shifting cipher',
  pwPh:'A password only you and your contacts know', pwAria:'Password', show:'Show', hide:'Hide',
  varName:'Shifting cipher', varDesc:': each letter changes shape depending on its position in the message, which makes it much harder to break.',
  fpPre:'Key fingerprint:', fpPost:'. Compare it with your contact; if it matches, you both typed the same password.',
  keyNoteOff:'Without a password the app uses the public order, and anyone who has the app can read your message.',
  keyNoteOn:'The password is never saved or sent with the message. Send it to your contact another way, and they must type it exactly the same.',
  swap:'Reverse direction',
  inEnc:'Your message', inDec:n=>'Encrypted text ('+n+')', out:'Result',
  phEnc:'Type your message here…', phDec:'Paste the symbols or use the keypad below…',
  emptyEnc:'Symbols will appear here', emptyDec:'Your message will appear here',
  missing:'Characters with no symbol in this cipher were left as they are: ',
  unknown:(n,l)=>'Unknown symbols for “'+n+'”: '+l+'. They may belong to another cipher.',
  checkKey:'If the text makes no sense, check the password and the shifting cipher option.',
  noKeyDec:'You are decoding without a password. If the message was encrypted with one, type it first.',
  copy:'Copy result', copied:'Copied ✓', copyManual:'Select the text and copy it manually',
  useOut:'Move result to input', clear:'Clear',
  keypad:'Symbol keypad', keypadHint:'Tap a symbol to add it to the input',
  space:'Word space', del:'⌫ Delete', keyAria:(s,c)=>c?'Symbol '+s+' for letter '+c:'Symbol '+s,
  tbl:n=>'Key table: '+n, tblKey:n=>'Your private table: '+n,
  descVar:'The shifting cipher has no fixed table: the same letter takes a different shape depending on where it appears.',
  descKey:'This order comes from your password, so only people who know it can read it. ',
  sepTxt:s=>'Letter separator: “'+s+'”. ', mine:'Created by you.', asLetter:l=>'as '+l,
  copyEdit:'Copy & edit', edit:'Edit', remove:'Delete', confirm:'Tap again to confirm',
  edNew:'New cipher', edEdit:n=>'Edit “'+n+'”', edCopy:n=>'Copy of “'+n+'”', copySuffix:' (my copy)',
  edFor:a=>'For '+a+' messages',
  edName:'Cipher name', edNamePh:'e.g. Family symbols', edDir:'Symbol writing direction',
  rtl:'Right to left', ltr:'Left to right',
  edSep:'Separator between letters', edSepPh:'Leave empty for single symbols', edWord:'Separator between words',
  edNote:{ar:'All 28 Arabic letters are required. ء ة ى are optional; if left empty, ة is written as ه and ى as ي. Hamza forms are treated as their base letters.',
          en:'All 26 letters are required. Capital and small letters share the same symbol.'},
  edRandom:'Generate random symbols', edClear:'Empty all fields', edSave:'Save cipher', edCancel:'Cancel',
  edCellAria:c=>'Symbol for '+c,
  errName:'Give the cipher a name.', errMissing:'Letters without a symbol: ', errDup:'Repeated symbols: ',
  errSepSame:'The letter separator must differ from the word separator.', errWord:'The word separator cannot be empty.',
  errSepIn:'Some symbols contain the separator itself.', errSpace:'Symbols cannot contain spaces.',
  errAmb:'Some symbols start with another symbol; add a letter separator so decoding is unambiguous.',
  saved:n=>'Saved “'+n+'” and selected it.',
  share:'Export & import',
  shareNote:'Each cipher is saved in your browser. To share it or move it to another device, copy its data and paste it into the import box there.',
  exportLbl:n=>'Data for “'+n+'” (without the password)', copyData:'Copy data',
  importLbl:'Paste cipher data here', importBtn:'Import',
  importBad:'This data is not in the right format. Copy all of it from the export box.',
  importedSuffix:' (imported)', imported:n=>'Added “'+n+'”.',
  footer:'All rights reserved © 2026 Abu Anas'
}};

/* ---------- اللغات الجاهزة / built-in ciphers ---------- */
const SHAPES = Array.from('◯◆◇▲△▼▽■□●◐◑◒◓★☆◈◉◎⬟⬢⬡◭◮⬠◊⊗✦✧⬣⊕');
const RUNES  = Array.from('ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟᚼᛅᛘᛦᚴᛋᛐ');
const MORSE_AR = ['.-','-...','-','-.-.','.---','....','---','-..','--..','.-.','---.','...','----','-..-','...-','..-','-.--','.-.-','--.','..-.','--.-','-.-','.-..','--','-.','..-..','.--','..','.','..-.-','.-..-'];
const MORSE_EN = ['.-','-...','-.-.','-..','.','..-.','--.','....','..','.---','-.-','.-..','--','-.','---','.--.','--.-','.-.','...','-','..-','...-','.--','-..-','-.--','--..'];

const BUILTIN = [
  {id:'shapes', builtin:true, dir:'auto', sep:'', wordSep:' ',
   name:{ar:'الأشكال الهندسية', en:'Geometric shapes'},
   desc:{ar:'لكل حرف شكل هندسي واحد.', en:'One geometric shape per letter.'},
   maps:{ar:zip(AR_LETTERS,SHAPES), en:zip(EN_LETTERS,SHAPES)}},
  {id:'runes', builtin:true, dir:'ltr', sep:'', wordSep:' ',
   name:{ar:'الرونية', en:'Runes'},
   desc:{ar:'حروف من الأبجدية الرونية الإسكندنافية القديمة، أُعيد توزيعها على الحروف.', en:'Letters from the old Norse runic alphabet, reassigned to each letter.'},
   maps:{ar:zip(AR_LETTERS,RUNES), en:zip(EN_LETTERS,RUNES)}},
  {id:'dots', builtin:true, dir:'ltr', sep:' ', wordSep:' / ',
   name:{ar:'نقاط وشرطات', en:'Dots & dashes'},
   desc:{ar:'على طريقة مورس: الحروف مفصولة بمسافة، والكلمات بشرطة مائلة.', en:'Morse code style: letters are separated by a space, words by a slash.'},
   maps:{ar:zip(AR_LETTERS,MORSE_AR), en:zip(EN_LETTERS,MORSE_EN)}},
  {id:'abjad', builtin:true, dir:'auto', sep:'·', wordSep:' ',
   name:{ar:'حساب الجُمَّل', en:'Abjad numerals'},
   desc:{ar:'كل حرف بقيمته في الترتيب الأبجدي (أبجد هوز)، والحروف مفصولة بنقطة وسطى.', en:'Each Arabic letter as its abjad number value, separated by a middle dot.'},
   maps:{ar:{'ا':'1','ب':'2','ج':'3','د':'4','ه':'5','و':'6','ز':'7','ح':'8','ط':'9','ي':'10','ك':'20','ل':'30','م':'40','ن':'50','س':'60','ع':'70','ف':'80','ص':'90','ق':'100','ر':'200','ش':'300','ت':'400','ث':'500','خ':'600','ذ':'700','ض':'800','ظ':'900','غ':'1000'}}}
];

/* ---------- التخزين / storage ---------- */
function load(k,def){ try{ const v=localStorage.getItem(KEY+k); return v==null?def:v; }catch(e){ return def; } }
function save(k,v){ try{ localStorage.setItem(KEY+k,v); }catch(e){} }

let custom = [];
try{ const raw=localStorage.getItem(KEY); if(raw) custom=JSON.parse(raw)||[]; }catch(e){ custom=[]; }
custom.forEach(l=>{ if(!l.alpha) l.alpha='ar'; });
function persist(){ save('', JSON.stringify(custom)); }

let ui = load('-uilang','ar'); if(!T[ui]) ui='ar';
let state = { id:load('-id',null)||'shapes', mode:'enc', alpha:load('-alpha',ui) };
if(!ALPHA[state.alpha]) state.alpha='ar';
const t = k => T[ui][k];

function all(){ return BUILTIN.concat(custom); }
function availableIn(alpha){ return all().filter(l=> l.builtin ? !!l.maps[alpha] : l.alpha===alpha); }
function nm(l){ return typeof l.name==='string' ? l.name : l.name[ui]; }
function dsc(l){ return l.desc ? (typeof l.desc==='string'? l.desc : l.desc[ui]) : ''; }
function mapOf(l, alpha){ return l.builtin ? (l.maps[alpha]||{}) : l.map; }
function dirOf(l, alpha){ return (l.dir==='auto'||!l.dir) ? ALPHA[alpha].dir : l.dir; }
function cur(){ const list=availableIn(state.alpha); return list.find(l=>l.id===state.id) || list[0]; }

/* ---------- المفتاح السري / secret key ---------- */
function hash128(str){
  let h1=1779033703,h2=3144134277,h3=1013904242,h4=2773480762;
  for(let i=0;i<str.length;i++){const k=str.charCodeAt(i);
    h1=h2^Math.imul(h1^k,597399067); h2=h3^Math.imul(h2^k,2869860233);
    h3=h4^Math.imul(h3^k,951274213); h4=h1^Math.imul(h4^k,2716044179);}
  h1=Math.imul(h3^(h1>>>18),597399067); h2=Math.imul(h4^(h2>>>22),2869860233);
  h3=Math.imul(h1^(h3>>>17),951274213); h4=Math.imul(h2^(h4>>>19),2716044179);
  h1^=(h2^h3^h4); h2^=h1; h3^=h1; h4^=h1;
  return [h1>>>0,h2>>>0,h3>>>0,h4>>>0];
}
function rng(seed){
  let [a,b,c,d]=hash128(seed);
  const next=function(){a>>>=0;b>>>=0;c>>>=0;d>>>=0;let x=(a+b)|0;a=b^b>>>9;b=c+(c<<3)|0;c=(c<<21|c>>>11);d=d+1|0;x=x+d|0;c=c+x|0;return (x>>>0)/4294967296;};
  for(let i=0;i<20;i++) next();
  return next;
}
function cleanPw(pw){ return (pw||'').normalize('NFC').trim(); }
function fingerprint(pw){
  const G=Array.from('◆◇▲△■□●○★☆◈◉⬢⬡✦✧');
  const r=rng('fp|'+pw); return Array.from({length:4},()=>G[Math.floor(r()*G.length)]).join('');
}

/* يجهّز اللغة للأبجدية المختارة، ويعيد ترتيب الرموز إن وُجدت كلمة سر */
function prepare(l, alpha, pw){
  const base = mapOf(l, alpha);
  const letters = ALPHA[alpha].letters.filter(ch=>base[ch]!=null);
  const syms = letters.map(ch=>base[ch]);
  if(pw){ const r=rng('map|'+pw); for(let i=syms.length-1;i>0;i--){const j=Math.floor(r()*(i+1)); [syms[i],syms[j]]=[syms[j],syms[i]];} }
  const map={}; letters.forEach((ch,i)=>map[ch]=syms[i]);
  return {name:nm(l), dir:dirOf(l,alpha), sep:l.sep, wordSep:l.wordSep, alpha, map, letters, syms};
}

/* ---------- التشفير وفك التشفير / encode & decode ---------- */
function canon(A, map, ch){ const c=A.low(ch); if(map[c]!=null) return c; const f=A.fallback[c]; if(f&&map[f]!=null) return f; return null; }

function encode(text, lang, stream){
  const A=ALPHA[lang.alpha], n=lang.letters.length, missing=new Set();
  const idx={}; lang.letters.forEach((c,i)=>idx[c]=i);
  const lines = A.norm(text).split('\n').map(line=>{
    const words = line.trim().split(/\s+/).filter(Boolean);
    return words.map(w=>Array.from(w).map(ch=>{
      const c = canon(A, lang.map, ch);
      if(c==null){ if(A.isLetter.test(ch)) missing.add(ch); return ch; }
      if(stream){ const sh=Math.floor(stream()*n); return lang.syms[(idx[c]+sh)%n]; }
      return lang.map[c];
    }).join(lang.sep)).join(lang.wordSep);
  });
  return {text:lines.join('\n'), missing};
}

function decode(text, lang, stream){
  const rev={}, n=lang.letters.length;
  lang.syms.forEach((s,i)=>{ if(!(s in rev)) rev[s]=i; });
  const syms = Object.keys(rev).sort((a,b)=>b.length-a.length);
  const unknown = new Set();
  const wsT = lang.wordSep.trim(), sepT = lang.sep.trim();
  const lines = text.replace(/[‎‏؜︎️]/g,'').split('\n').map(line=>{
    const words = wsT ? line.split(wsT).map(s=>s.trim()).filter(Boolean) : line.trim().split(/\s+/).filter(Boolean);
    return words.map(w=>{
      let toks;
      if(sepT) toks = w.split(sepT).map(s=>s.trim()).filter(Boolean);
      else if(lang.sep) toks = w.split(/\s+/).filter(Boolean);
      else { toks=[]; let i=0; while(i<w.length){ const m=syms.find(s=>w.startsWith(s,i)); if(m){toks.push(m);i+=m.length;} else {const cp=String.fromCodePoint(w.codePointAt(i)); toks.push(cp); i+=cp.length;} } }
      return toks.map(tk=>{
        if(tk in rev){ let i=rev[tk]; if(stream){ const sh=Math.floor(stream()*n); i=((i-sh)%n+n)%n; } return lang.letters[i]; }
        if(!/[\s\p{P}]/u.test(tk)) unknown.add(tk); return tk; }).join('');
    }).join(' ');
  });
  return {text:lines.join('\n'), unknown};
}

/* ---------- الواجهة / UI ---------- */
const $ = id=>document.getElementById(id);
const input=$('input'), output=$('output'), status=$('status');

function pwNow(){ return cleanPw($('pw').value); }
function isVariable(){ return !!pwNow() && $('variable').checked; }
function active(){ return prepare(cur(), state.alpha, pwNow()); }
function streamNow(){ return isVariable()? rng('var|'+pwNow()) : null; }
function setNote(el, text, cls){ el.textContent=text; el.className='note'+(cls?' '+cls:''); }

function applyStatic(){
  const d = ui==='ar'?'rtl':'ltr';
  document.documentElement.lang=ui; document.documentElement.dir=d;
  const w=document.querySelector('.wrap'); w.dir=d; w.lang=ui;
  document.title=t('title');
  document.querySelectorAll('[data-i18n]').forEach(el=>{ const v=t(el.dataset.i18n); if(typeof v==='string') el.textContent=v; });
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{ el.placeholder=t(el.dataset.i18nPh); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el=>{ el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  $('uiLang').value=ui;
  const ms=$('msgLang'); ms.innerHTML='';
  Object.keys(ALPHA).forEach(a=>{ const o=document.createElement('option'); o.value=a; o.textContent=t('alpha')[a]; ms.appendChild(o); });
  ms.value=state.alpha;
  $('pwShow').textContent = $('pw').type==='password'? t('show') : t('hide');
}

function firstGlyph(l){ const m=mapOf(l,state.alpha); const v=m[ALPHA[state.alpha].letters[0]]||Object.values(m)[0]||'?'; return v.length>4?v.slice(0,4):v; }

function renderChips(){
  const c=$('chips'), here=cur(); c.innerHTML='';
  availableIn(state.alpha).forEach(l=>{
    const b=document.createElement('button'); b.className='chip'; b.setAttribute('aria-pressed', l.id===here.id);
    const g=document.createElement('span'); g.className='glyph'; g.textContent=firstGlyph(l);
    const s=document.createElement('span'); s.textContent=nm(l); b.append(g,s);
    b.onclick=()=>{ state.id=l.id; save('-id',l.id); renderAll(); };
    c.appendChild(b);
  });
  const a=document.createElement('button'); a.className='chip add'; a.textContent=t('newLang');
  a.onclick=()=>openEditor(null); c.appendChild(a);
}

function renderKey(){
  const pw=pwNow(), v=isVariable();
  $('variable').disabled=!pw;
  const st=$('keyState');
  st.textContent = !pw? t('keyOff') : (v? t('keyVar') : t('keyFixed'));
  st.className='pill'+(pw?' on':'');
  $('fp').hidden=!pw;
  if(pw) $('fpGlyphs').textContent=fingerprint(pw);
  $('keyNote').textContent = pw? t('keyNoteOn') : t('keyNoteOff');
}

function translate(){
  const l=active(), v=input.value;
  if(!v.trim()){ output.textContent = state.mode==='enc'? t('emptyEnc') : t('emptyDec'); output.className='out empty'; output.dir=ui==='ar'?'rtl':'ltr'; setNote(status,''); return; }
  if(state.mode==='enc'){
    const r=encode(v,l,streamNow()); output.textContent=r.text; output.className='out g'; output.dir=l.dir;
    if(r.missing.size) setNote(status, t('missing')+[...r.missing].join(' '), 'warn'); else setNote(status,'');
  } else {
    const r=decode(v,l,streamNow()); output.textContent=r.text; output.className='out'; output.dir=ALPHA[state.alpha].dir;
    if(r.unknown.size) setNote(status, t('unknown')(l.name,[...r.unknown].slice(0,12).join(' ')), 'warn');
    else if(pwNow()) setNote(status, t('checkKey'));
    else setNote(status, t('noKeyDec'));
  }
}

function renderTranslator(){
  const l=active();
  const an=t('alpha')[state.alpha];
  $('fromName').textContent = state.mode==='enc'? an : l.name;
  $('toName').textContent   = state.mode==='enc'? l.name : an;
  $('inLbl').textContent = state.mode==='enc'? t('inEnc') : t('inDec')(l.name);
  input.dir = state.mode==='enc'? ALPHA[state.alpha].dir : l.dir;
  input.className = state.mode==='enc'? '' : 'g';
  input.placeholder = state.mode==='enc'? t('phEnc') : t('phDec');
  $('keypadCard').hidden = state.mode!=='dec';
  renderKeys(); translate();
}

function renderKeys(){
  const l=active(), k=$('keys'), v=isVariable(); k.innerHTML=''; k.dir=l.dir;
  const order = v? prepare(cur(), state.alpha, '') : l;
  order.letters.forEach(ch=>{ const s=order.map[ch];
    const b=document.createElement('button'); b.type='button'; b.textContent=s;
    if(!v){ const sm=document.createElement('small'); sm.textContent=ch; b.appendChild(sm); }
    b.setAttribute('aria-label', t('keyAria')(s, v?'':ch));
    b.onclick=()=>insert(s+(l.sep||'')); k.appendChild(b); });
  const sp=document.createElement('button'); sp.type='button'; sp.className='wide'; sp.textContent=t('space'); sp.onclick=()=>insert(l.wordSep); k.appendChild(sp);
  const bk=document.createElement('button'); bk.type='button'; bk.className='wide'; bk.textContent=t('del'); bk.onclick=backspace; k.appendChild(bk);
}
function insert(s){ const a=input.selectionStart??input.value.length, b=input.selectionEnd??a; input.value=input.value.slice(0,a)+s+input.value.slice(b); const p=a+s.length; input.setSelectionRange(p,p); translate(); }
function backspace(){ const l=active(); let v=input.value; if(!v) return;
  if(l.sep && v.endsWith(l.sep)) v=v.slice(0,-l.sep.length);
  const syms=l.syms.slice().sort((a,b)=>b.length-a.length); const m=syms.find(s=>v.endsWith(s));
  v = m? v.slice(0,-m.length) : v.slice(0,-(Array.from(v).pop().length));
  input.value=v; translate(); }

let delArmed=false;
function renderTable(){
  const base=cur(), l=active(), pw=pwNow(), v=isVariable(), A=ALPHA[state.alpha];
  $('tblTitle').textContent = pw? t('tblKey')(l.name) : t('tbl')(l.name);
  const sepTxt = l.sep? t('sepTxt')(l.sep.replace(/ /g,'␣')) : '';
  $('langDesc').textContent = v ? t('descVar')
    : (pw? t('descKey') : '') + (dsc(base)? dsc(base)+' ' : '') + sepTxt + (base.builtin? '' : t('mine'));
  const tb=$('table'); tb.innerHTML=''; tb.hidden=v;
  A.letters.forEach(ch=>{ const s=l.map[ch]; const d=document.createElement('div'); d.className='cell'+(s==null?' missing':'');
    const b=document.createElement('b'); b.textContent=ch; const sp=document.createElement('span');
    sp.textContent = s!=null? s : (A.fallback[ch]&&l.map[A.fallback[ch]]!=null? t('asLetter')(A.fallback[ch]) : '—');
    sp.dir=l.dir; d.append(b,sp); tb.appendChild(d); });
  const a=$('langActions'); a.innerHTML=''; delArmed=false;
  const dup=document.createElement('button'); dup.type='button'; dup.textContent= base.builtin? t('copyEdit') : t('edit');
  dup.onclick=()=>openEditor(base, !base.builtin); a.appendChild(dup);
  if(!base.builtin){ const del=document.createElement('button'); del.type='button'; del.className='danger'; del.textContent=t('remove');
    del.onclick=()=>{ if(!delArmed){ delArmed=true; del.textContent=t('confirm'); return; }
      custom=custom.filter(x=>x.id!==base.id); persist(); state.id='shapes'; save('-id','shapes'); renderAll(); };
    a.appendChild(del); }
  const ex={name:nm(base), alpha:state.alpha, dir:dirOf(base,state.alpha), sep:base.sep, wordSep:base.wordSep, map:mapOf(base,state.alpha)};
  $('exportBox').value=JSON.stringify(ex,null,1);
  $('exportLbl').textContent=t('exportLbl')(nm(base));
}

function renderAll(){ applyStatic(); renderKey(); renderChips(); renderTranslator(); renderTable(); }
function onKeyChange(){ renderKey(); renderKeys(); translate(); renderTable(); }

/* ---------- المحرر / editor ---------- */
let editingId=null, editingAlpha='ar';
function pool(){
  const out=[]; const add=(a,b,skip=[])=>{for(let c=a;c<=b;c++) if(!skip.includes(c)) out.push(String.fromCodePoint(c));};
  add(0x25A0,0x25FF,[0x25AA,0x25AB,0x25B6,0x25C0,0x25FB,0x25FC,0x25FD,0x25FE]);
  add(0x16A0,0x16EA); add(0x1681,0x169A); add(0x2726,0x2730); add(0x2B1F,0x2B24); add(0x2295,0x229B);
  return out;
}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

function buildEdGrid(map){
  const g=$('edGrid'), A=ALPHA[editingAlpha]; g.innerHTML='';
  g.dir = A.dir;
  A.letters.forEach((ch,i)=>{ const d=document.createElement('div'); d.className='edcell'+(A.optional.includes(ch)?' opt':'');
    const b=document.createElement('b'); b.textContent=ch; const inp=document.createElement('input'); inp.type='text';
    inp.id='ed-'+editingAlpha+'-'+i; inp.dataset.ch=ch; inp.value=map[ch]||''; inp.setAttribute('aria-label', t('edCellAria')(ch));
    inp.oninput=markDups; d.append(b,inp); g.appendChild(d); });
  markDups();
}
function edValues(){ const m={}; document.querySelectorAll('#edGrid input').forEach(i=>{const v=i.value.trim(); if(v) m[i.dataset.ch]=v;}); return m; }
function markDups(){ const cnt={}; const ins=[...document.querySelectorAll('#edGrid input')];
  ins.forEach(i=>{const v=i.value.trim(); if(v) cnt[v]=(cnt[v]||0)+1;});
  ins.forEach(i=>i.parentElement.classList.toggle('dup', !!i.value.trim() && cnt[i.value.trim()]>1)); }

function openEditor(src, isEdit){
  editingId = isEdit? src.id : null;
  editingAlpha = state.alpha;
  const n = src? nm(src) : '';
  $('edTitle').textContent = isEdit? t('edEdit')(n) : (src? t('edCopy')(n) : t('edNew'));
  $('edFor').textContent = t('edFor')(t('alpha')[editingAlpha]);
  $('edNote').textContent = t('edNote')[editingAlpha];
  $('edName').value = isEdit? n : (src? n+t('copySuffix') : '');
  $('edDir').value = src? dirOf(src, editingAlpha) : ALPHA[editingAlpha].dir;
  $('edSep').value = src? src.sep : '';
  $('edWord').value = src? src.wordSep : ' ';
  buildEdGrid(src? mapOf(src, editingAlpha) : {});
  if(!src) randomFill();
  setNote($('edMsg'),'');
  $('editor').hidden=false; $('editor').scrollIntoView({behavior:'smooth',block:'start'});
}
function randomFill(){ const p=shuffle(pool()); document.querySelectorAll('#edGrid input').forEach((i,k)=>{i.value=p[k];}); markDups(); }

function validate(l){
  const errs=[], A=ALPHA[l.alpha];
  if(!l.name) errs.push(t('errName'));
  const miss=A.required.filter(ch=>l.map[ch]==null); if(miss.length) errs.push(t('errMissing')+miss.join(' '));
  const vals=Object.values(l.map); const d=vals.filter((v,i)=>vals.indexOf(v)!==i); if(d.length) errs.push(t('errDup')+[...new Set(d)].join(' '));
  if(l.sep===l.wordSep) errs.push(t('errSepSame'));
  if(!l.wordSep) errs.push(t('errWord'));
  const sT=l.sep.trim(), wT=l.wordSep.trim();
  if(vals.some(v=>(sT&&v.includes(sT))||(wT&&v.includes(wT)))) errs.push(t('errSepIn'));
  if(vals.some(v=>/\s/.test(v))) errs.push(t('errSpace'));
  if(!l.sep && vals.some(v=>Array.from(v).length>1) && vals.some(a=>vals.some(b=>a!==b&&b.startsWith(a)))) errs.push(t('errAmb'));
  return errs;
}
function uid(){ return 'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }

$('edRandom').onclick=randomFill;
$('edClear').onclick=()=>{ document.querySelectorAll('#edGrid input').forEach(i=>i.value=''); markDups(); };
$('edCancel').onclick=()=>{ $('editor').hidden=true; };
$('edSave').onclick=()=>{
  const l={id:editingId||uid(), alpha:editingAlpha, name:$('edName').value.trim(), dir:$('edDir').value, sep:$('edSep').value, wordSep:$('edWord').value, map:edValues()};
  const errs=validate(l);
  if(errs.length){ setNote($('edMsg'), errs.join(' '), 'warn'); return; }
  if(editingId) custom=custom.map(x=>x.id===editingId?l:x); else custom.push(l);
  persist(); state.id=l.id; state.alpha=l.alpha; save('-id',l.id); save('-alpha',l.alpha);
  $('editor').hidden=true; renderAll();
  setNote(status, t('saved')(l.name), 'good');
};

/* ---------- الأزرار / controls ---------- */
$('uiLang').onchange=e=>{ ui=e.target.value; save('-uilang',ui); if(!$('editor').hidden) $('editor').hidden=true; renderAll(); };
$('msgLang').onchange=e=>{
  const old=state.alpha; state.alpha=e.target.value; save('-alpha',state.alpha);
  if(state.mode==='enc' && (!input.value.trim() || input.value===ALPHA[old].sample)) input.value=ALPHA[state.alpha].sample;
  else if(state.mode==='dec') input.value='';
  if(!$('editor').hidden) $('editor').hidden=true;
  renderAll();
};
$('pw').addEventListener('input',onKeyChange);
$('variable').checked = load('-var','0')==='1';
$('variable').addEventListener('change',()=>{ save('-var',$('variable').checked?'1':'0'); onKeyChange(); });
$('pwShow').onclick=()=>{ const p=$('pw'); p.type = p.type==='password'?'text':'password'; $('pwShow').textContent = p.type==='password'? t('show') : t('hide'); };

input.addEventListener('input',translate);
$('swap').onclick=()=>{ const out = output.classList.contains('empty')?'':output.textContent;
  state.mode = state.mode==='enc'?'dec':'enc'; input.value=out; renderTranslator(); };
$('useOut').onclick=$('swap').onclick;
$('clear').onclick=()=>{ input.value=''; translate(); input.focus(); };

function flash(btn, msg, back, ms){ btn.textContent=msg; setTimeout(()=>{ btn.textContent=t(back); }, ms||1400); }
$('copy').onclick=()=>{
  if(output.classList.contains('empty')) return;
  const btn=$('copy');
  const fallback=()=>{ const r=document.createRange(); r.selectNodeContents(output); const s=getSelection(); s.removeAllRanges(); s.addRange(r); flash(btn,t('copyManual'),'copy',2000); };
  try{ navigator.clipboard.writeText(output.textContent).then(()=>flash(btn,t('copied'),'copy'), fallback); }catch(e){ fallback(); }
};
$('copyExport').onclick=()=>{ const b=$('copyExport');
  try{ navigator.clipboard.writeText($('exportBox').value).then(()=>flash(b,t('copied'),'copyData'),()=>$('exportBox').select()); }catch(e){ $('exportBox').select(); } };

$('doImport').onclick=()=>{
  const m=$('importMsg'); let o;
  try{ o=JSON.parse($('importBox').value); }catch(e){ setNote(m, t('importBad'), 'warn'); return; }
  if(!o || typeof o!=='object'){ setNote(m, t('importBad'), 'warn'); return; }
  let alpha = ALPHA[o.alpha]? o.alpha : (o.map && o.map.a!=null ? 'en' : 'ar');
  const l={id:uid(), alpha, name:String(o.name||'').trim(), dir:o.dir==='ltr'?'ltr':'rtl',
           sep:typeof o.sep==='string'?o.sep:'', wordSep:typeof o.wordSep==='string'?o.wordSep:' ', map:{}};
  if(o.map&&typeof o.map==='object') for(const ch of ALPHA[alpha].letters) if(typeof o.map[ch]==='string'&&o.map[ch]) l.map[ch]=o.map[ch];
  if(all().some(x=>nm(x)===l.name)) l.name+=t('importedSuffix');
  const errs=validate(l); if(errs.length){ setNote(m, errs.join(' '), 'warn'); return; }
  custom.push(l); persist(); state.id=l.id; state.alpha=alpha; save('-id',l.id); save('-alpha',alpha);
  $('importBox').value=''; renderAll(); setNote(m, t('imported')(l.name), 'good');
};

input.value=ALPHA[state.alpha].sample;
renderAll();
})();
