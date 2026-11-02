class ReLifeRuntime {
  constructor() {
    this.registry = { systems: {}, functions: {}, events: [] };
    this.environment = { browser: navigator.userAgent, mode: this.mode() };
    this.start();
  }
  mode() { return innerWidth < 640 ? "mobile" : innerWidth < 1024 ? "tablet" : "desktop"; }
  start() {
    const style = document.createElement("style");
    style.textContent = "*{box-sizing:border-box}html{min-height:100%;background:#020817}body{margin:0;min-height:100vh;color:#f3f6ff;font-family:system-ui,sans-serif;background:radial-gradient(ellipse at 50% 44%,#123a6d 0%,#081d3c 34%,#030d21 66%,#01040e 100%)}main{min-height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:clamp(1rem,4vw,3rem);gap:0}.brand{width:min(90vw,76vh,760px);height:auto;object-fit:contain;filter:drop-shadow(0 0 24px rgba(36,155,255,.22));mask-image:radial-gradient(ellipse 65% 65% at 50% 50%,#000 65%,transparent 100%)}p{margin:0;color:#b9d8fa;letter-spacing:.08em;font-size:clamp(.75rem,1.5vw,1rem)}";
    document.head.append(style);
    const main = document.createElement("main"), image = document.createElement("img"), description = document.createElement("p");
    image.src = "/relife-emblem.png"; image.alt = "ReLife"; image.className = "brand"; image.decoding = "async";
    description.textContent = "A new online environment is being established.";
    main.append(image,description); document.body.append(main);
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
