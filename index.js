class ReLifeRuntime {
  constructor() {
    this.registry = { systems: {}, functions: {}, events: [] };
    this.environment = { browser: navigator.userAgent, mode: this.mode() };
    this.start();
  }
  mode() { return innerWidth < 640 ? "mobile" : innerWidth < 1024 ? "tablet" : "desktop"; }
  start() {
    const style = document.createElement("style");
    style.textContent = "body{margin:0;background:#101820;color:#f3f6f8;font-family:system-ui,sans-serif}main{min-height:100vh;display:grid;place-content:center;text-align:center;padding:2rem}h1{font-weight:500;letter-spacing:.07em}p{opacity:.75}";
    document.head.append(style);
    const main = document.createElement("main"), title = document.createElement("h1"), description = document.createElement("p");
    title.textContent = "ReLife Online"; description.textContent = "A new online environment is being established.";
    main.append(title,description); document.body.append(main);
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
