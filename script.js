const form=document.querySelector('#form'),nameEl=document.querySelector('#name'),msgEl=document.querySelector('#message'),list=document.querySelector('#list'),empty=document.querySelector('#empty'),total=document.querySelector('#total'),statusEl=document.querySelector('#status'),count=document.querySelector('#count');
// Supabase configuration: replace these two values after creating a Supabase project.
const SUPABASE_URL='YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY='YOUR_SUPABASE_ANON_KEY';
const ready=SUPABASE_URL.startsWith('https://')&&SUPABASE_ANON_KEY!=='YOUR_SUPABASE_ANON_KEY';
const db=ready?supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY):null;
msgEl.addEventListener('input',()=>count.textContent=msgEl.value.length);
function esc(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}
function render(rows){list.innerHTML='';total.textContent=`${rows.length}개의 글`;empty.style.display=rows.length?'none':'block';rows.forEach(r=>{const el=document.createElement('article');el.className='entry';el.innerHTML=`<div class="head"><span class="name">${esc(r.name)}</span><span class="date">${new Date(r.created_at).toLocaleString('ko-KR')}</span></div><div class="msg">${esc(r.message)}</div>`;list.appendChild(el)})}
async function load(){if(!db){statusEl.textContent='⚠️ 공유 저장소 설정이 필요합니다. 아래 안내의 Supabase 설정을 완료하세요.';return}statusEl.textContent='🔄 방명록을 불러오는 중...';const {data,error}=await db.from('guestbooks').select('*').order('created_at',{ascending:false});if(error){statusEl.textContent='❌ DB 연결 오류: '+error.message;return}statusEl.textContent='🟢 실시간 공유 방명록';render(data||[]);db.channel('guestbook-live').on('postgres_changes',{event:'*',schema:'public',table:'guestbooks'},load).subscribe()}
form.addEventListener('submit',async e=>{e.preventDefault();if(!db){alert('아직 공유 DB가 연결되지 않았습니다. Supabase 설정을 먼저 완료해주세요.');return}const name=nameEl.value.trim(),message=msgEl.value.trim();if(!name||!message)return;const {error}=await db.from('guestbooks').insert({name,message});if(error){alert('등록 실패: '+error.message);return}form.reset();count.textContent='0';load()});
load();