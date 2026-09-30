(function(){
const BASE = Array.from('ابتثجحخدذرزسشصضطظعغفقكلمنهوي');
const OPT = ['ء','ة','ى'];
const LETTERS = BASE.concat(OPT);
const FALLBACK = {'أ':'ا','إ':'ا','آ':'ا','ٱ':'ا','ة':'ه','ى':'ي','ؤ':'و','ئ':'ي'};
const STRIP = /[ً-ٰٟـ‎‏؜]/g;
const KEY = 'rmz-langs-v1';

function zip(letters, syms){const m={};letters.forEach((l,i)=>{if(syms[i]!=null&&syms[i]!=='')m[l]=syms[i]});return m;}

const BUILTIN = [
  {id:'shapes',name:'الأشكال الهندسية',dir:'rtl',sep:'',wordSep:' ',builtin:true,
   desc:'لكل حرف شكل هندسي واحد.',
   map:zip(LETTERS,Array.from('◯◆◇▲△▼▽■□●◐◑◒◓★☆◈◉◎⬟⬢⬡◭◮⬠◊⊗✦✧⬣⊕'))},
  {id:'runes',name:'الرونية',dir:'ltr',sep:'',wordSep:' ',builtin:true,
   desc:'حروف من الأبجدية الرونية الإسكندنافية القديمة، أُعيد توزيعها على الحروف العربية.',
   map:zip(LETTERS,Array.from('ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟᚼᛅᛘᛦᚴᛋᛐ'))},
  {id:'dots',name:'نقاط وشرطات',dir:'ltr',sep:' ',wordSep:' / ',builtin:true,
   desc:'على طريقة مورس: الحروف مفصولة بمسافة، والكلمات بشرطة مائلة.',
   map:zip(LETTERS,['.-','-...','-','-.-.','.---','....','---','-..','--..','.-.','---.','...','----','-..-','...-','..-','-.--','.-.-','--.','..-.','--.-','-.-','.-..','--','-.','..-..','.--','..','.','..-.-','.-..-'])},
  {id:'abjad',name:'حساب الجُمَّل',dir:'rtl',sep:'·',wordSep:' ',builtin:true,
   desc:'كل حرف بقيمته في الترتيب الأبجدي (أبجد هوز)، والحروف مفصولة بنقطة وسطى.',
   map:{'ا':'1','ب':'2','ج':'3','د':'4','ه':'5','و':'6','ز':'7','ح':'8','ط':'9','ي':'10','ك':'20','ل':'30','م':'40','ن':'50','س':'60','ع':'70','ف':'80','ص':'90','ق':'100','ر':'200','ش':'300','ت':'400','ث':'500','خ':'600','ذ':'700','ض':'800','ظ':'900','غ':'1000'}}
];

let custom = [];
try{const raw=localStorage.getItem(KEY); if(raw) custom = JSON.parse(raw)||[];}catch(e){custom=[];}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(custom));}catch(e){}}
function all(){return BUILTIN.concat(custom);}
function get(id){return all().find(l=>l.id===id)||BUILTIN[0];}

let state = {id:'shapes', mode:'enc'};
try{const s=localStorage.getItem(KEY+'-ui'); if(s){const o=JSON.parse(s); if(o&&all().some(l=>l.id===o.id)) state.id=o.id;}}catch(e){}
function saveUi(){try{localStorage.setItem(KEY+'-ui',JSON.stringify({id:state.id}));}catch(e){}}

/* ---------- secret key ----------
   كلمة السر تولّد رقماً ثابتاً (بذرة)، ومنه:
   1) ترتيب جديد للرموز على الحروف (مصفوفة خاصة).
   2) في التشفير المتغير: إزاحة مختلفة لكل حرف حسب موقعه في الرسالة. */
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
  const next=function(){a>>>=0;b>>>=0;c>>>=0;d>>>=0;let t=(a+b)|0;a=b^b>>>9;b=c+(c<<3)|0;c=(c<<21|c>>>11);d=d+1|0;t=t+d|0;c=c+t|0;return (t>>>0)/4294967296;};
  for(let i=0;i<20;i++) next();
  return next;
}
function cleanPw(pw){ return (pw||'').normalize('NFC').trim(); }

/* يجهّز اللغة: قائمة الحروف ورموزها بالترتيب، مع إعادة الترتيب إن وُجدت كلمة سر */
function prepare(l, pw){
  const letters = LETTERS.filter(ch=>l.map[ch]!=null);
  const syms = letters.map(ch=>l.map[ch]);
  if(pw){ const r=rng('map|'+pw); for(let i=syms.length-1;i>0;i--){const j=Math.floor(r()*(i+1)); [syms[i],syms[j]]=[syms[j],syms[i]];} }
  const map={}; letters.forEach((ch,i)=>map[ch]=syms[i]);
  return Object.assign({}, l, {map, letters, syms});
}
function fingerprint(pw){
  const G=Array.from('◆◇▲△■□●○★☆◈◉⬢⬡✦✧');
  const r=rng('fp|'+pw); return Array.from({length:4},()=>G[Math.floor(r()*G.length)]).join('');
}

/* ---------- core ---------- */
function canon(map,ch){ if(map[ch]!=null) return ch; const f=FALLBACK[ch]; if(f&&map[f]!=null) return f; return null; }

function encode(text, lang, stream){
  const missing = new Set(); const n=lang.letters.length;
  const idx={}; lang.letters.forEach((c,i)=>idx[c]=i);
  const lines = text.replace(STRIP,'').split('\n').map(line=>{
    const words = line.trim().split(/\s+/).filter(Boolean);
    return words.map(w=>Array.from(w).map(ch=>{
      const c = canon(lang.map,ch);
      if(c==null){ if(/[ء-ي]/.test(ch)) missing.add(ch); return ch; }
      if(stream){ const sh=Math.floor(stream()*n); return lang.syms[(idx[c]+sh)%n]; }
      return lang.map[c];
    }).join(lang.sep)).join(lang.wordSep);
  });
  return {text:lines.join('\n'), missing};
}

function decode(text, lang, stream){
  const rev = {}; const n=lang.letters.length;
  lang.syms.forEach((s,i)=>{ if(!(s in rev)) rev[s]=i; });
  const syms = Object.keys(rev).sort((a,b)=>b.length-a.length);
  const unknown = new Set();
  const wsT = lang.wordSep.trim(), sepT = lang.sep.trim();
  const lines = text.replace(/[‎‏؜]/g,'').split('\n').map(line=>{
    const words = wsT ? line.split(wsT).map(s=>s.trim()).filter(Boolean) : line.trim().split(/\s+/).filter(Boolean);
    return words.map(w=>{
      let toks;
      if(sepT) toks = w.split(sepT).map(s=>s.trim()).filter(Boolean);
      else if(lang.sep) toks = w.split(/\s+/).filter(Boolean);
      else { toks=[]; let i=0; while(i<w.length){ const m=syms.find(s=>w.startsWith(s,i)); if(m){toks.push(m);i+=m.length;} else {const cp=String.fromCodePoint(w.codePointAt(i)); toks.push(cp); i+=cp.length;} } }
      return toks.map(t=>{
        if(t in rev){ let i=rev[t]; if(stream){ const sh=Math.floor(stream()*n); i=((i-sh)%n+n)%n; } return lang.letters[i]; }
        if(!/[\s\p{P}]/u.test(t)) unknown.add(t); return t; }).join('');
    }).join(' ');
  });
  return {text:lines.join('\n'), unknown};
}

/* اللغة الفعلية المستخدمة الآن (بعد تطبيق كلمة السر) */
function pwNow(){ return cleanPw($('pw').value); }
function isVariable(){ return !!pwNow() && $('variable').checked; }
function active(){ return prepare(get(state.id), pwNow()); }
function streamNow(){ return isVariable()? rng('var|'+pwNow()) : null; }

/* ---------- ui ---------- */
const $ = id=>document.getElementById(id);
const input=$('input'), output=$('output'), status=$('status');

function firstGlyph(l){ const v=l.map['ا']||Object.values(l.map)[0]||'؟'; return v.length>4?v.slice(0,4):v; }

function renderChips(){
  const c=$('chips'); c.innerHTML='';
  all().forEach(l=>{
    const b=document.createElement('button'); b.className='chip'; b.setAttribute('aria-pressed', l.id===state.id);
    b.innerHTML='<span class="glyph"></span><span></span>';
    b.children[0].textContent=firstGlyph(l); b.children[1].textContent=l.name;
    b.onclick=()=>{state.id=l.id; saveUi(); renderAll();};
    c.appendChild(b);
  });
  const a=document.createElement('button'); a.className='chip add'; a.textContent='＋ لغة جديدة';
  a.onclick=()=>openEditor(null); c.appendChild(a);
  const cur=c.querySelector('[aria-pressed="true"]'); if(cur) cur.scrollIntoView({block:'nearest',inline:'nearest'});
}

function translate(){
  const l=active(); const v=input.value;
  if(!v.trim()){ output.textContent = state.mode==='enc'?'ستظهر الرموز هنا':'سيظهر النص العربي هنا'; output.className='out empty'; status.textContent=''; status.className='note'; return; }
  if(state.mode==='enc'){
    const r=encode(v,l,streamNow()); output.textContent=r.text; output.className='out g'; output.dir=l.dir;
    if(r.missing.size){status.textContent='حروف ليس لها رمز في هذه اللغة وبقيت كما هي: '+[...r.missing].join(' ');status.className='note warn';}
    else {status.textContent='';status.className='note';}
  } else {
    const r=decode(v,l,streamNow()); output.textContent=r.text; output.className='out'; output.dir='rtl';
    if(r.unknown.size){status.textContent='رموز غير معروفة في «'+l.name+'»: '+[...r.unknown].slice(0,12).join(' ')+'. ربما تنتمي إلى لغة أخرى.';status.className='note warn';}
    else if(pwNow()){status.textContent='إذا ظهر النص بلا معنى فتأكد من كلمة السر ومن خيار التشفير المتغير.';status.className='note';}
    else {status.textContent='';status.className='note';}
  }
}

function renderKey(){
  const pw=pwNow(), v=isVariable();
  $('variable').disabled=!pw;
  const st=$('keyState');
  st.textContent = !pw? 'غير مفعّل' : (v? 'مفعّل: تشفير متغير' : 'مفعّل: ترتيب خاص');
  st.className = 'pill'+(pw?' on':'');
  $('fp').hidden=!pw;
  if(pw) $('fpGlyphs').textContent=fingerprint(pw);
  $('keyNote').textContent = !pw
    ? 'بدون كلمة سر يستخدم البرنامج الترتيب العام، ويستطيع أي شخص يملك البرنامج قراءة رسالتك.'
    : 'لا تُحفظ كلمة السر ولا تُرسل مع الرسالة. أرسلها لصديقك بطريق آخر، وليكتبها هو بنفس الحروف تماماً.';
}

function renderTranslator(){
  const l=get(state.id);
  $('fromName').textContent = state.mode==='enc'?'العربية':l.name;
  $('toName').textContent = state.mode==='enc'?l.name:'العربية';
  $('inLbl').textContent = state.mode==='enc'?'النص العربي':'النص المشفر ('+l.name+')';
  input.dir = state.mode==='enc'?'rtl':l.dir;
  input.className = state.mode==='enc'?'':'g';
  input.placeholder = state.mode==='enc'?'اكتب رسالتك هنا…':'الصق الرموز أو استخدم لوحة الرموز بالأسفل…';
  $('keypadCard').hidden = state.mode!=='dec';
  renderKeys(); translate();
}

function renderKeys(){
  const l=active(), k=$('keys'), v=isVariable(); k.innerHTML=''; k.dir=l.dir;
  const order = v? get(state.id) : l;  // في المتغير: الرموز بترتيبها العام وبلا حروف
  LETTERS.forEach(ch=>{ const s=order.map[ch]; if(s==null) return;
    const b=document.createElement('button'); b.textContent=s;
    if(!v){ const sm=document.createElement('small'); sm.textContent=ch; b.appendChild(sm); }
    b.setAttribute('aria-label', v? 'الرمز '+s : 'الرمز '+s+' للحرف '+ch);
    b.onclick=()=>insert(s+(l.sep||'')); k.appendChild(b); });
  const sp=document.createElement('button'); sp.className='wide'; sp.textContent='فاصل كلمة'; sp.onclick=()=>insert(l.wordSep); k.appendChild(sp);
  const bk=document.createElement('button'); bk.className='wide'; bk.textContent='⌫ حذف'; bk.onclick=backspace; k.appendChild(bk);
}
function insert(t){ const a=input.selectionStart??input.value.length, b=input.selectionEnd??a; input.value=input.value.slice(0,a)+t+input.value.slice(b); const p=a+t.length; input.setSelectionRange(p,p); translate(); }
function backspace(){ const l=get(state.id); let v=input.value; if(!v) return;
  if(l.sep && v.endsWith(l.sep)) v=v.slice(0,-l.sep.length);
  const syms=Object.values(l.map).sort((a,b)=>b.length-a.length); const m=syms.find(s=>v.endsWith(s));
  v = m? v.slice(0,-m.length) : v.slice(0,-(Array.from(v).pop().length));
  input.value=v; translate(); }

let delArmed=false;
function renderTable(){
  const base=get(state.id), l=active(), pw=pwNow(), v=isVariable();
  $('tblTitle').textContent= pw? 'جدولك الخاص في «'+l.name+'»' : 'جدول مفاتيح «'+l.name+'»';
  const sepTxt = l.sep? ('فاصل الحروف: «'+l.sep.replace(/ /g,'␣')+'»، ') : '';
  $('langDesc').textContent= v
    ? 'في التشفير المتغير لا يوجد جدول ثابت: الحرف نفسه يأخذ شكلاً مختلفاً حسب موقعه في الرسالة.'
    : (pw? 'هذا الترتيب ناتج عن كلمة السر، ولا يعرفه إلا من يعرفها. ' : '')+(base.desc?base.desc+' ':'')+sepTxt+(base.builtin?'':'لغة من إنشائك.');
  const t=$('table'); t.innerHTML=''; t.hidden=v;
  LETTERS.forEach(ch=>{ const s=l.map[ch]; const d=document.createElement('div'); d.className='cell'+(s==null?' missing':'');
    const b=document.createElement('b'); b.textContent=ch; const sp=document.createElement('span');
    sp.textContent = s!=null? s : (FALLBACK[ch]&&l.map[FALLBACK[ch]]!=null? 'كـ '+FALLBACK[ch] : '—');
    sp.dir=l.dir; d.append(b,sp); t.appendChild(d); });
  const a=$('langActions'); a.innerHTML=''; delArmed=false;
  const dup=document.createElement('button'); dup.textContent= base.builtin?'نسخ وتعديل':'تعديل';
  dup.onclick=()=>openEditor(base, !base.builtin); a.appendChild(dup);
  if(!base.builtin){ const del=document.createElement('button'); del.className='danger'; del.textContent='حذف';
    del.onclick=()=>{ if(!delArmed){delArmed=true;del.textContent='اضغط مرة أخرى للتأكيد';return;}
      custom=custom.filter(x=>x.id!==base.id); persist(); state.id='shapes'; saveUi(); renderAll(); };
    a.appendChild(del); }
  const ex={name:base.name,dir:base.dir,sep:base.sep,wordSep:base.wordSep,map:base.map};
  $('exportBox').value=JSON.stringify(ex,null,1);
  $('exportLbl').textContent='بيانات «'+base.name+'» (بدون كلمة السر)';
}

function renderAll(){ renderKey(); renderChips(); renderTranslator(); renderTable(); }
function onKeyChange(){ renderKey(); renderKeys(); translate(); renderTable(); }
$('pw').addEventListener('input',onKeyChange);
$('variable').addEventListener('change',()=>{ try{localStorage.setItem(KEY+'-var',$('variable').checked?'1':'0');}catch(e){} onKeyChange(); });
try{ $('variable').checked = localStorage.getItem(KEY+'-var')==='1'; }catch(e){}
$('pwShow').onclick=()=>{ const p=$('pw'); const show=p.type==='password'; p.type=show?'text':'password'; $('pwShow').textContent=show?'إخفاء':'إظهار'; };

/* ---------- editor ---------- */
let editingId=null;
function pool(){
  const out=[]; const add=(a,b,skip=[])=>{for(let c=a;c<=b;c++) if(!skip.includes(c)) out.push(String.fromCodePoint(c));};
  add(0x25A0,0x25FF,[0x25AA,0x25AB,0x25B6,0x25C0,0x25FB,0x25FC,0x25FD,0x25FE]);
  add(0x16A0,0x16EA); add(0x1681,0x169A); add(0x2726,0x2730); add(0x2B1F,0x2B24);
  add(0x2295,0x229B); add(0x2600,0x2603,[0x2600,0x2601,0x2602,0x2603]);
  return out;
}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

function buildEdGrid(map){
  const g=$('edGrid'); g.innerHTML='';
  LETTERS.forEach((ch,i)=>{ const d=document.createElement('div'); d.className='edcell'+(OPT.includes(ch)?' opt':'');
    const b=document.createElement('b'); b.textContent=ch; const inp=document.createElement('input'); inp.type='text';
    inp.id='ed-'+i; inp.dataset.ch=ch; inp.value=map[ch]||''; inp.setAttribute('aria-label','رمز الحرف '+ch);
    inp.oninput=markDups; d.append(b,inp); g.appendChild(d); });
  markDups();
}
function edValues(){ const m={}; document.querySelectorAll('#edGrid input').forEach(i=>{const v=i.value.trim(); if(v) m[i.dataset.ch]=v;}); return m; }
function markDups(){ const cnt={}; const ins=[...document.querySelectorAll('#edGrid input')];
  ins.forEach(i=>{const v=i.value.trim(); if(v) cnt[v]=(cnt[v]||0)+1;});
  ins.forEach(i=>i.parentElement.classList.toggle('dup', !!i.value.trim() && cnt[i.value.trim()]>1)); }

function openEditor(src, isEdit){
  editingId = isEdit? src.id : null;
  $('edTitle').textContent = isEdit? 'تعديل «'+src.name+'»' : (src? 'نسخة من «'+src.name+'»' : 'لغة جديدة');
  $('edName').value = isEdit? src.name : (src? src.name+' (نسختي)' : '');
  $('edDir').value = src? src.dir : 'rtl';
  $('edSep').value = src? src.sep : '';
  $('edWord').value = src? src.wordSep : ' ';
  buildEdGrid(src? src.map : {});
  if(!src) randomFill();
  $('edMsg').textContent=''; $('edMsg').className='note';
  $('editor').hidden=false; $('editor').scrollIntoView({behavior:'smooth',block:'start'});
}
function randomFill(){ const p=shuffle(pool()); document.querySelectorAll('#edGrid input').forEach((i,k)=>{i.value=p[k];}); markDups(); }

function validate(l){
  const errs=[];
  if(!l.name) errs.push('اكتب اسماً للغة.');
  const miss=BASE.filter(ch=>l.map[ch]==null); if(miss.length) errs.push('حروف بلا رمز: '+miss.join(' '));
  const vals=Object.values(l.map); const d=vals.filter((v,i)=>vals.indexOf(v)!==i); if(d.length) errs.push('رموز مكررة: '+[...new Set(d)].join(' '));
  if(l.sep===l.wordSep) errs.push('فاصل الحروف يجب أن يختلف عن فاصل الكلمات.');
  if(!l.wordSep) errs.push('فاصل الكلمات لا يمكن أن يكون فارغاً.');
  const sT=l.sep.trim(), wT=l.wordSep.trim();
  if(vals.some(v=>(sT&&v.includes(sT))||(wT&&v.includes(wT)))) errs.push('بعض الرموز تحتوي على الفاصل نفسه.');
  if(vals.some(v=>/\s/.test(v))) errs.push('الرموز لا تحتوي على مسافات.');
  if(!l.sep && vals.some(v=>Array.from(v).length>1)){
    const amb=vals.some(a=>vals.some(b=>a!==b&&b.startsWith(a)));
    if(amb) errs.push('بعض الرموز تبدأ برمز آخر؛ أضف فاصلاً بين الحروف حتى لا يلتبس فك التشفير.');
  }
  return errs;
}
function uid(){return 'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}

$('edRandom').onclick=randomFill;
$('edClear').onclick=()=>{document.querySelectorAll('#edGrid input').forEach(i=>i.value=''); markDups();};
$('edCancel').onclick=()=>{$('editor').hidden=true;};
$('edSave').onclick=()=>{
  const l={id:editingId||uid(),name:$('edName').value.trim(),dir:$('edDir').value,sep:$('edSep').value,wordSep:$('edWord').value,map:edValues(),desc:''};
  const errs=validate(l); const m=$('edMsg');
  if(errs.length){m.textContent=errs.join(' '); m.className='note warn'; return;}
  if(editingId) custom=custom.map(x=>x.id===editingId?l:x); else custom.push(l);
  persist(); state.id=l.id; saveUi(); $('editor').hidden=true; renderAll();
  status.textContent='حُفظت «'+l.name+'» وأصبحت اللغة المختارة.'; status.className='note good';
};

/* ---------- translator controls ---------- */
input.addEventListener('input',translate);
$('swap').onclick=()=>{ const out = output.classList.contains('empty')?'':output.textContent;
  state.mode = state.mode==='enc'?'dec':'enc'; input.value=out; renderTranslator(); };
$('useOut').onclick=$('swap').onclick;
$('clear').onclick=()=>{input.value=''; translate(); input.focus();};

function copyText(txt, btn, label){
  const done=()=>{btn.textContent='نُسخ ✓'; setTimeout(()=>btn.textContent=label,1400);};
  const fallback=()=>{ const r=document.createRange(); r.selectNodeContents(output); const s=getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent='حدّد النص وانسخه يدوياً'; setTimeout(()=>btn.textContent=label,2000); };
  try{ navigator.clipboard.writeText(txt).then(done,fallback); }catch(e){ fallback(); }
}
$('copy').onclick=()=>{ if(output.classList.contains('empty')) return; copyText(output.textContent,$('copy'),'نسخ الناتج'); };
$('copyExport').onclick=()=>{ const b=$('copyExport'); try{navigator.clipboard.writeText($('exportBox').value).then(()=>{b.textContent='نُسخ ✓';setTimeout(()=>b.textContent='نسخ البيانات',1400);},()=>{$('exportBox').select();});}catch(e){$('exportBox').select();} };

$('doImport').onclick=()=>{
  const m=$('importMsg');
  let o; try{o=JSON.parse($('importBox').value);}catch(e){m.textContent='البيانات ليست بصيغة صحيحة. انسخها كاملة من خانة التصدير.';m.className='note warn';return;}
  const l={id:uid(),name:String(o.name||'').trim(),dir:o.dir==='ltr'?'ltr':'rtl',sep:typeof o.sep==='string'?o.sep:'',wordSep:typeof o.wordSep==='string'?o.wordSep:' ',map:{},desc:''};
  if(o.map&&typeof o.map==='object') for(const ch of LETTERS) if(typeof o.map[ch]==='string'&&o.map[ch]) l.map[ch]=o.map[ch];
  if(all().some(x=>x.name===l.name)) l.name+=' (مستوردة)';
  const errs=validate(l); if(errs.length){m.textContent=errs.join(' ');m.className='note warn';return;}
  custom.push(l); persist(); state.id=l.id; saveUi(); $('importBox').value='';
  m.textContent='أُضيفت «'+l.name+'».'; m.className='note good'; renderAll();
};

input.value='السلام عليكم ورحمة الله';
renderAll();
})();
