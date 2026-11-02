import { LayoutSystem, VectorSystem, AnimationSystem, MorphingSystem, WebAssemblySystem, WebGPUSystem, AuditSystem } from './systems/runtime.js';

class ReLifeRuntime {
  constructor() {
    this.registry = { systems: {}, functions: {}, events: [] };
    this.registry.functions.record = event => this.record(event);
    this.build();
    new LayoutSystem(this);
    const vector = new VectorSystem(this);
    new AnimationSystem(this);
    const morphing = new MorphingSystem(this);
    new WebAssemblySystem(this);
    new WebGPUSystem(this);
    vector.attach(this.main);
    morphing.begin(this.main.querySelector('.aura'));
    new AuditSystem(this);
    this.record({ system: 'runtime', type: 'started', time: new Date().toISOString() });
  }
  record(event) {
    this.registry.events.push(event);
    if (this.registry.events.length > 500) this.registry.events.shift();
  }
  build() {
    const style = document.createElement('style');
    style.textContent = `*{box-sizing:border-box}html{min-height:100%;background:#020817}body{margin:0;min-height:100vh;color:#f3f6ff;font-family:system-ui,sans-serif;background:radial-gradient(ellipse at 50% 44%,#123a6d 0%,#081d3c 34%,#030d21 66%,#01040e 100%)}main{min-height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;text-align:center;padding:clamp(1rem,4vw,3rem);padding-bottom:clamp(1.5rem,5vh,4rem);position:relative;isolation:isolate;overflow:hidden}main::before{content:"";position:absolute;inset:0;z-index:-1;background-image:url('/relife-emblem.png');background-position:center;background-repeat:no-repeat;background-size:min(90vw,88vh,900px) auto;mask-image:radial-gradient(ellipse 60% 62% at 50% 50%,#000 65%,transparent 100%);pointer-events:none}.aura{position:absolute;left:50%;top:50%;width:min(78vw,70vh,710px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,transparent 54%,rgba(74,120,255,.13) 72%,transparent 76%);pointer-events:none;z-index:-1;transform:translate(-50%,-50%)}.vector-aura{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(80vw,76vh,770px);height:auto;color:#73caff;pointer-events:none;z-index:-1;opacity:.28}p{margin:0;color:#b9d8fa;letter-spacing:.08em;font-size:clamp(.75rem,1.5vw,1rem)}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}`;
    document.head.append(style);
    const main = document.createElement('main');
    const aura = document.createElement('div'); aura.className = 'aura';
    const description = document.createElement('p');
    description.textContent = 'In software, even power is artificial...';
    main.append(aura, description);
    document.body.append(main);
    this.main = main;
  }
}
new ReLifeRuntime();
