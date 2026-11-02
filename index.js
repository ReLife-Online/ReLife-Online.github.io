import { StatisticsSystem } from './systems/statistics.js';
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
    const statistics = new StatisticsSystem(this);
    this.main.querySelector('.emblem-trigger').addEventListener('click', () => statistics.open(), { once: true });
    this.record({ system: 'runtime', type: 'started', time: new Date().toISOString() });
  }
  record(event) {
    this.registry.events.push(event);
    if (this.registry.events.length > 500) this.registry.events.shift();
  }
  build() {
    const style = document.createElement('style');
    style.textContent = `*{box-sizing:border-box}html{min-height:100%;background:#020817}body{margin:0;min-height:100vh;color:#f3f6ff;font-family:system-ui,sans-serif;background:radial-gradient(ellipse at 50% 44%,#123a6d 0%,#081d3c 34%,#030d21 66%,#01040e 100%)}main{min-height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;text-align:center;padding:clamp(1rem,4vw,3rem);padding-bottom:clamp(1.5rem,5vh,4rem);position:relative;isolation:isolate;overflow:hidden}main::before{content:"";position:absolute;inset:0;z-index:-1;background-image:url('/relife-emblem.png');background-position:center;background-repeat:no-repeat;background-size:min(90vw,88vh,900px) auto;mask-image:radial-gradient(ellipse 60% 62% at 50% 50%,#000 65%,transparent 100%);pointer-events:none}.aura{position:absolute;left:50%;top:50%;width:min(78vw,70vh,710px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,transparent 54%,rgba(74,120,255,.13) 72%,transparent 76%);pointer-events:none;z-index:-1;transform:translate(-50%,-50%)}.vector-aura{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(80vw,76vh,770px);height:auto;color:#73caff;pointer-events:none;z-index:-1;opacity:.28}p{margin:0;color:#b9d8fa;letter-spacing:.08em;font-size:clamp(.75rem,1.5vw,1rem)}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}`;
    style.textContent += "@import url('https://fonts.googleapis.com/css2?family=Smooch+Sans:wght@300;400;500;600;700&display=swap');body{font-family:'Smooch Sans',sans-serif}.emblem-trigger{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(86vw,80vh,850px);aspect-ratio:1;background:transparent;border:0;cursor:pointer;z-index:2}.emblem-trigger:focus-visible{outline:2px solid #90d5ff;outline-offset:-8px;border-radius:50%}.dashboard{position:relative;min-height:100svh;padding:clamp(20px,5vw,60px);max-width:1450px;margin:auto}.dashboard-header{text-align:center;margin-bottom:36px}.dashboard h1{font-size:clamp(3rem,8vw,6rem);font-weight:600;margin:0}.dashboard h2{font-size:clamp(2rem,5vw,3.3rem);font-weight:500;margin:0 0 10px}.dashboard h3{font-size:clamp(1.65rem,3vw,2.25rem);font-weight:500;margin:0 0 12px}.dashboard p,.dashboard li,.dashboard a{font-size:clamp(1.25rem,2.4vw,1.65rem)}.dashboard-header p{margin:0}.stats-section{margin:30px 0 50px}.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,270px),1fr));gap:16px}.stat-card{padding:20px 22px;border-radius:22px;background:rgba(16,43,80,.52);border:1px solid rgba(130,192,255,.2);backdrop-filter:blur(12px)}.stat-card ul{margin:0 0 15px;padding-left:22px}.stat-card a,.source a{color:#a4ddff}.disclaimer{color:#bbd2e8;margin:0 0 20px;line-height:1.2}.debt-value{font-size:clamp(1.65rem,3vw,2.55rem);font-weight:600;overflow-wrap:anywhere;display:block;color:#b9e8ff;font-variant-numeric:tabular-nums}.debt-card p{margin:8px 0}.source{margin-top:15px}";
    document.head.append(style);
    const main = document.createElement('main');
    const aura = document.createElement('div'); aura.className = 'aura';
    const description = document.createElement('p');
    description.textContent = 'In software, even power is artificial...';
    const trigger = document.createElement('button');
    trigger.type = 'button'; trigger.className = 'emblem-trigger'; trigger.setAttribute('aria-label','Open world statistics');
    main.append(aura, trigger, description);
    document.body.append(main);
    this.main = main;
  }
}
new ReLifeRuntime();
