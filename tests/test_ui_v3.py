"""DOM smoke tests for new TypeScript UI/controller in Chromium, without Phaser vendor code.
This verifies narrative, gallery, saving, mobility and cutscenes. GPU/Phaser requires npm install.
"""
import base64,json,sys,re,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'index.html').read_text()
html=re.sub(r'<script type="module" src="/src/main.ts"></script>','',html)
css=(ROOT/'src/style.css').read_text()
paths=json.loads((ROOT/'tests/reachable_paths.json').read_text())
assets={p.stem:'data:image/webp;base64,'+base64.b64encode(p.read_bytes()).decode() for p in (ROOT/'public/assets').glob('*.webp')}
for name,data in assets.items():html=html.replace(f'src="/assets/{name}.webp"',f'src="{data}"')
compiled=ROOT/'tests/_compiled'
mods={str(p.relative_to(compiled)).replace('\\','/'):p.read_text() for p in compiled.rglob('*.js')}
boot='''(()=>{
  const sources=JSON.parse(document.getElementById('codeStore').textContent);
  const cache={};
  function resolve(target,caller){
    const parts=(caller?caller.split('/').slice(0,-1):[]).concat(target.split('/'));
    const out=[];
    for(const p of parts){if(!p||p==='.')continue;if(p==='..')out.pop();else out.push(p)}
    const filename=out.join('/');return filename.endsWith('.js')?filename:filename+'.js';
  }
  function requireModule(target,from=''){
    const key=resolve(target,from);
    if(cache[key])return cache[key].exports;
    if(!sources[key])throw Error('Missing '+key);
    const m={exports:{}};cache[key]=m;
    new Function('require','module','exports',sources[key])((child)=>requireModule(child,key),m,m.exports);
    return m.exports;
  }
  const {story}=requireModule('./story.js');
  const {UIController}=requireModule('./ui/UIController.js');
  window.__APP__=new UIController(story,{show:()=>{}});
  window.__APP__.install();
})();'''
# codeStore script is JSON; `</script>` won't appear in compiled sources
html=html.replace('</body>','<script type="application/json" id="codeStore">'+json.dumps(mods).replace('</','<\\/')+'</script></body>')
checks=[]
def check(name,call):
 try:
  result=call();checks.append({'check':name,'status':'PASS','detail':str(result)[:100]});print('PASS',name,result)
 except Exception as e:
  checks.append({'check':name,'status':'FAIL','detail':str(e)[:170]});print('FAIL',name,e);traceback.print_exc(limit=3)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 errors=[]
 def new_page(width=1365,height=860,initial=None):
  page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
  page.on('pageerror',lambda err:errors.append(str(err)))
  page.set_content(html,wait_until='load')
  page.add_style_tag(content=css)
  page.evaluate('''values=>{
    const store=values;
    Object.defineProperty(window,'localStorage',{configurable:true,value:{
      getItem:k=>Object.prototype.hasOwnProperty.call(store,k)?store[k]:null,
      setItem:(k,v)=>{store[k]=String(v)},
      removeItem:k=>delete store[k],
      clear:()=>Object.keys(store).forEach(k=>delete store[k]),
      key:i=>Object.keys(store)[i]||null,
      get length(){return Object.keys(store).length}
    }});
  }''',initial or {})
  page.add_script_tag(content=boot)
  return page
 page=new_page()
 def home():
  assert page.locator('#homeScreen').is_visible()
  assert page.locator('#newGame').is_enabled()
  assert page.locator('#continueGame').is_disabled()
  assert page.locator('#headerProgress').inner_text()=='0/10'
  return 'menu e botões de entrada'
 check('Menu inicial',home)
 def controls():
  page.locator('#newGame').click();assert page.locator('#gameScreen').is_visible()
  page.keyboard.press('1');assert page.locator('#storyBody').inner_text().startswith('Você voltou')
  page.keyboard.press('d');assert page.locator('#modal').is_visible()
  page.keyboard.press('Escape');assert page.locator('#modal').is_hidden()
  return 'novo jogo, teclado, diário, escape'
 check('Controles do jogo',controls)
 def saving():
  saved=page.evaluate('''()=>({value:localStorage.getItem('epp_reinado_run_v2'),text:document.getElementById('storyBody').textContent})''')
  assert saved['value']
  page2=new_page(initial={'epp_reinado_run_v2':saved['value']})
  assert page2.locator('#continueGame').is_enabled()
  page2.locator('#continueGame').click()
  assert page2.locator('#storyBody').inner_text()==saved['text']
  page2.close()
  return 'progresso recuperado em nova sessão'
 check('Salvamento e retomada',saving)
 page.close()
 def ending_one(ending,steps):
  page=new_page()
  page.locator('#newGame').click()
  progress=page.evaluate('''steps=>{
    for(const step of steps){
      const opts=[...document.querySelectorAll('#choices .choice')];
      const btn=opts.find(b=>b.querySelector('.choice-text')?.textContent===step.label);
      if(!btn)throw Error('Opção ausente em '+step.node+': '+step.label);
      btn.click();
    }
    return {cinema:!document.getElementById('cinema').hidden,title:document.getElementById('cinemaTitle').textContent,header:document.getElementById('headerProgress').textContent};
  }''',steps)
  assert progress['cinema'],(ending,progress)
  for _ in range(3):page.locator('#cinemaNext').click()
  assert page.locator('#modal').is_visible()
  page.locator('#viewCardsNow').click()
  assert page.locator('.ending-card:not(.locked)').count()==1
  page.locator('.ending-card:not(.locked)').click()
  assert page.locator('#cinema').is_visible()
  page.locator('#cinemaSkip').click()
  assert page.locator('#modal').is_visible()
  page.close()
  return len(steps)
 for ending,steps in paths.items():check('Final '+ending,lambda ending=ending,steps=steps:ending_one(ending,steps))
 def sizes(width,height):
  page=new_page(width,height)
  page.locator('#newGame').click()
  measure=page.evaluate('''()=>({document:document.documentElement.scrollWidth,screen:innerWidth,choice:document.querySelector('#choices').getBoundingClientRect().width})''')
  assert measure['document']<=measure['screen']+2,measure
  assert measure['choice']>100
  page.close()
  return f'{width}x{height}, sem overflow horizontal'
 for wh in [(390,844),(320,700),(844,390),(768,1024)]:check('Mobile/tablet '+str(wh),lambda wh=wh:sizes(*wh))
 def legacy():
  old={'v':2,'node':'carta_1824','docs':['carta1822'],'flags':{'viu_corte':True},'meters':{'saber':2,'prudencia':0,'escuta':0,'pressa':0},'focus':'corte','trace':[],'visited':['p1'],'lastEnding':None}
  page=new_page(initial={'epp_reinado_run_v2':json.dumps(old)})
  page.locator('#continueGame').click()
  assert page.locator('#sceneYear').inner_text()=='1824'
  page.close();return 'save v2 preservado'
 check('Migração save v2',legacy)
 def backup():
  page=new_page();page.locator('#newGame').click();page.locator('#navMenu').click()
  with page.expect_download() as d:page.locator('[data-action="backup"]').click()
  dl=d.value;assert dl.suggested_filename.endswith('.json')
  page.close();return dl.suggested_filename
 check('Exportar arquivo de salvamento',backup)
 def restore():
  page=new_page();page.locator('#navMenu').click()
  save={'format':'entre-papeis-e-portais','version':3,'state':{'v':3,'node':'carta_1824','docs':['carta1822'],'flags':{},'meters':{'saber':1,'prudencia':0,'escuta':0,'pressa':0},'focus':'','visited':[],'trace':[],'lastEnding':None},'gallery':{'retorno_consciente':{'at':'2026-11-10T00:00:00Z'}}}
  with page.expect_file_chooser() as handler:page.locator('[data-action=restore]').click()
  handler.value.set_files({'name':'progresso.json','mimeType':'application/json','buffer':json.dumps(save).encode()})
  page.once('dialog',lambda d:d.accept())
  page.locator('#modal').wait_for(state='hidden')
  assert page.locator('#headerProgress').inner_text()=='1/10'
  page.locator('#continueGame').click()
  assert page.locator('#sceneYear').inner_text()=='1824'
  page.close();return 'save JSON externo importado, carta preservada'
 check('Importar arquivo de salvamento',restore)
 check('Sem erros JS',lambda: (_ for _ in ()).throw(Exception(errors)) if errors else 'nenhum pageerror')
 browser.close()
(ROOT/'tests/ui_results.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2))
print('TOTAL:',sum(x['status']=='PASS' for x in checks),'/',len(checks))
if any(x['status']!='PASS' for x in checks):sys.exit(1)
