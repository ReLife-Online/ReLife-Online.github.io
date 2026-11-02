class ReLifeRuntime {
  constructor() {
    this.registry = { systems: {}, functions: {}, events: [] };
    this.environment = { browser: navigator.userAgent, mode: this.mode() };
    this.start();
  }
  mode() { return innerWidth < 640 ? "mobile" : innerWidth < 1024 ? "tablet" : "desktop"; }
  start() {
    const style = document.createElement("style");
    style.textContent = "*{box-sizing:border-box}html{min-height:100%;background:#020817}body{margin:0;min-height:100vh;color:#f3f6ff;font-family:system-ui,sans-serif;background:radial-gradient(ellipse at 50% 44%,#123a6d 0%,#081d3c 34%,#030d21 66%,#01040e 100%)}main{min-height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;text-align:center;padding:clamp(1rem,4vw,3rem);padding-bottom:clamp(1.5rem,5vh,4rem);position:relative;isolation:isolate}main::before{content:\"\";position:absolute;inset:0;z-index:-1;background-image:url(\"/relife-emblem.png\");background-position:center;background-repeat:no-repeat;background-size:min(90vw,88vh,900px) auto;mask-image:radial-gradient(ellipse 60% 62% at 50% 50%,#000 65%,transparent 100%);pointer-events:none}p{margin:0;color:#b9d8fa;letter-spacing:.08em;font-size:clamp(.75rem,1.5vw,1rem)}";
    document.head.append(style);
    const main = document.createElement("main"), description = document.createElement("p");
    description.textContent = "In software, even power is artificial...";
    main.append(description); document.body.append(main);
    this.registry.events.push({ type: "runtime-start", time: new Date().toISOString(), mode: this.environment.mode });
    this.initAudit();
  }
  async initAudit() {
    try {
      const { WebR } = await import("https://webr.r-wasm.org/latest/webr.mjs");
      const engine = new WebR(); await engine.init();
      await engine.evalRVoid('source("index.R")');
      this.registry.systems.audit = { status: "ready", engine };
    } catch (error) {
      this.registry.systems.audit = { status: "unavailable", reason: String(error) };
      console.warn("Optional R audit runtime unavailable", error);
    }
  }
}
new ReLifeRuntime();
