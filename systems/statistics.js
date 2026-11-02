import { RegisteredSystem } from './runtime.js';

export class StatisticsSystem extends RegisteredSystem {
  constructor(runtime) {
    super(runtime, 'statistics');
    this.registry.state.active = false;
    this.registry.functions.open = () => this.open();
    this.groups = [
      ['World Population', ['Population', 'Births today', 'Deaths today', 'Population growth']],
      ['Government & Economics', ['Government spending', 'Public debt', 'Healthcare spending', 'Education spending']],
      ['Society & Media', ['Internet users', 'Social media', 'Books published', 'Newspapers circulated']],
      ['Environment', ['Forests lost', 'CO₂ emissions', 'Desertification', 'Toxic chemicals']],
      ['Food & Water', ['Undernourished people', 'Obesity', 'Water used', 'People without safe water']],
      ['Energy', ['Energy consumption', 'Renewable energy', 'Oil remaining', 'Gas remaining']],
      ['Health', ['Deaths by cause', 'Disease burden', 'Health indicators']]
    ];
  }
  node(tag, className, content) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (content !== undefined) el.textContent = content;
    return el;
  }
  link(label, href) {
    const a = this.node('a', '', label);
    a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
    return a;
  }
  async open() {
    if (this.registry.state.active) return;
    this.registry.state.active = true;
    const main = this.runtime.main;
    const animation = this.runtime.registry.systems.animation;
    const transition = animation.animate(main, [{opacity:1,filter:'blur(0px)',transform:'scale(1)'},{opacity:0,filter:'blur(18px)',transform:'scale(.91)'}], {duration:2200,easing:'ease-in-out',fill:'forwards'});
    if (transition) await transition.finished.catch(() => {});
    main.remove();
    const dashboard = this.node('section','dashboard');
    const heading = this.node('header','dashboard-header');
    heading.append(this.node('h1','', 'World Statistics'),this.node('p','','Statistics, projections and source-linked counters'));
    dashboard.append(heading);
    const worldSection = this.node('section','stats-section');
    worldSection.append(this.node('h2','','Worldometer · Real-time statistics'));
    const disclaimer = this.node('p','disclaimer','Worldometer counters are independently modeled estimates. Open each category at the source for its current values; ReLife does not reproduce proprietary counters.');
    worldSection.append(disclaimer);
    const groups = this.node('div','stats-grid');
    for (const [name, metrics] of this.groups) {
      const card = this.node('article','stat-card');
      card.append(this.node('h3','',name));
      const list = this.node('ul','');
      for (const metric of metrics) list.append(this.node('li','',metric));
      card.append(list,this.link('View live counters ↗','https://www.worldometers.info/'));
      groups.append(card);
    }
    worldSection.append(groups);dashboard.append(worldSection);
    const debt = this.node('section','stats-section');
    debt.append(this.node('h2','','Government debt clocks'));
    debt.append(this.node('p','disclaimer','Estimated government gross debt in USD, extrapolated from IMF-based baseline figures. Not official second-by-second accounting.'));
    const debtGrid = this.node('div','stats-grid');debt.append(debtGrid);
    const source = this.node('p','source');
    source.append('Data: ',this.link('Global Debt Clock · CC BY 4.0','https://www.global-debt-clock.com/'),' · ',this.link('Methodology','https://www.global-debt-clock.com/methodology/'));
    debt.append(source);dashboard.append(debt);document.body.append(dashboard);
    const fade = animation.animate(dashboard,[{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{duration:1000,easing:'ease-out',fill:'both'});
    if (fade) fade.finished.catch(()=>{});
    await this.loadDebt(debtGrid);
    this.emit('dashboard-opened');
  }
  async loadDebt(container) {
    try {
      const response = await fetch('https://www.global-debt-clock.com/data/debt.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const keys = ['world','fi','nl','in'];
      const formatter = new Intl.NumberFormat('en-US',{maximumFractionDigits:0});
      const cards = keys.map(key => {
        const entry = data[key];
        if (!entry || !Number.isFinite(entry.base) || !Number.isFinite(entry.rate)) return null;
        const card = this.node('article','stat-card debt-card');
        const amount = this.node('strong','debt-value','—');
        const baseTime = Date.parse(`${entry.baseDate}T00:00:00Z`);
        const update = () => { amount.textContent = '$' + formatter.format(Math.max(0,entry.base + entry.rate * ((Date.now()-baseTime)/1000))); };
        card.append(this.node('h3','',`${entry.flag || ''} ${entry.name}`),amount,this.node('p','',`${entry.gdpPct ?? '—'}% of GDP · +$${formatter.format(entry.rate)}/sec (modeled)`));
        const perCapita = this.node('p','',`Base per person: $${formatter.format(entry.base/entry.pop)}`);
        card.append(perCapita);
        container.append(card);update();
        return update;
      }).filter(Boolean);
      this.registry.state.clockUpdates = cards;
      this.registry.state.interval = setInterval(()=>{for(const update of cards)update();},1000);
      this.emit('debt-loaded',{count:cards.length});
    } catch (error) {
      container.append(this.node('p','disclaimer','Debt data is temporarily unavailable. Open the source for current estimates.'));
      container.append(this.link('View debt clocks ↗','https://www.global-debt-clock.com/map/'));
      this.emit('debt-unavailable',{reason:String(error)});
    }
  }
  dispose() { if(this.registry.state.interval) clearInterval(this.registry.state.interval); }
}
