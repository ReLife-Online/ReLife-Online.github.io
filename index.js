class RepositoryMirror {
  constructor(){
    this.registry={systems:{},functions:{lifecycle:{},sources:{}},events:[]};
    this.state={};this.signature='';this.stop=null;this.busy=false;
    this.root=document.createElement('div');this.root.id='relife-root';document.body.append(this.root);
    this.gateway=location.hostname.endsWith('.github.io')?'https://relifeonline.site':location.origin;
    this.registry.functions.lifecycle.sync=manual=>this.sync(manual);
    this.root.textContent='Connecting ReLife to its public source repositories…';
    this.sync();this.timer=setInterval(()=>this.sync(),60000);
  }
  async sync(manual=false){
    if(this.busy)return;this.busy=true;
    try{
      const response=await fetch(this.gateway+'/api/snapshot'+(manual?'?refresh=1':''),{cache:'no-store'});
      if(!response.ok)throw new Error('Source snapshot unavailable ('+response.status+').');
      const snapshot=await response.json();
      const signature=Object.values(snapshot.sources).map(s=>s.sha).join(':');
      if(signature===this.signature){this.status('Sources up to date');return;}
      const moduleURL=(alias,file)=>this.gateway+'/source/'+alias+'/'+snapshot.sources[alias].sha+'/'+file;
      const [core,ui]=await Promise.all([import(moduleURL('core','binary.js')),import(moduleURL('interface','workbench.js'))]);
      if(typeof core.BinaryEngine!=='function'||typeof ui.mount!=='function')throw new Error('Unsupported source module contract.');
      const engine=new core.BinaryEngine();
      const oldStop=this.stop;const oldSnapshot=this.snapshot;
      oldStop?.();
      try{this.stop=ui.mount({root:this.root,state:this.state,engine,snapshot,sync:manual=>this.sync(manual)});}
      catch(error){if(this.ui&&oldSnapshot)this.stop=this.ui.mount({root:this.root,state:this.state,engine:this.engine,snapshot:oldSnapshot,sync:manual=>this.sync(manual)});throw error;}
      this.ui=ui;this.engine=engine;this.snapshot=snapshot;this.signature=signature;
      this.registry.systems={engine,interface:ui};this.registry.functions.sources.snapshot=()=>this.snapshot;
      this.registry.events.push({type:'source-applied',at:new Date().toISOString(),signature});
      if(this.registry.events.length>100)this.registry.events.shift();
      const accent=snapshot.manifest.theme?.accent;
      if(/^#[0-9a-f]{6}$/i.test(accent||''))this.root.style.setProperty('--green',accent);
      this.status('GitHub sources connected');
    }catch(error){
      this.status('Sync unavailable · keeping current session');
      if(!this.signature){this.root.replaceChildren();const p=document.createElement('p');p.textContent=error.message;const retry=document.createElement('button');retry.textContent='Retry source connection';retry.onclick=()=>this.sync(true);this.root.append(p,retry);}
      console.warn('ReLife source synchronization:',error.message);
    }finally{this.busy=false;}
  }
  status(text){const label=this.root.querySelector('#mirror-health');if(label)label.textContent=text;}
}
new RepositoryMirror();

