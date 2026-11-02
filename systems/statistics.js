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
  async open({ immediate = false } = {}) {
    if (this.registry.state.active) return;
    this.registry.state.active = true;
    if (location.hash !== '#statistics') history.replaceState(null, '', `${location.pathname}${location.search}#statistics`);
    const main = this.runtime.main;
    const animation = this.runtime.registry.systems.animation;
    const transition = immediate ? null : animation.animate(main, [{opacity:1,filter:'blur(0px)',transform:'scale(1)'},{opacity:0,filter:'blur(18px)',transform:'scale(.91)'}], {duration:2200,easing:'ease-in-out',fill:'forwards'});
    if (transition) await transition.finished.catch(() => {});
    main.remove();
    const dashboard = this.node('section','dashboard terminal-dashboard');
    const panels = this.node('div','terminal-grid');
    const worldSection = this.node('section','stats-section terminal-pane');
    worldSection.append(this.node('h2','','Worldometer · Real-time statistics'));
    worldSection.append(this.node('p','disclaimer','Embedded world population counter: continuously projected from published demographic data, not a direct census measurement.'));
    const populationCard = this.node('article','stat-card population-card');
    const frame = this.node('iframe','population-frame');
    frame.src = 'https://populationclock.org/embed';
    frame.title = 'Live world population counter';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-popups');
    populationCard.append(frame);
    populationCard.append(this.node('p','attribution','Population projection: populationclock.org · UN World Population Prospects 2024'));
    worldSection.append(populationCard);
    worldSection.append(this.node('p','disclaimer','Other Worldometer categories require separately licensed counter feeds or independently sourced data. No invented live values are displayed.'));

    panels.append(worldSection);
    const debt = this.node('section','stats-section terminal-pane');
    debt.append(this.node('h2','','Government debt clocks'));
    debt.append(this.node('p','disclaimer','Estimated government gross debt in USD, extrapolated from IMF-based baseline figures. Not official second-by-second accounting.'));
    const debtGrid = this.node('div','stats-grid');debt.append(debtGrid);
    const source = this.node('p','source');
    source.append('Data: ',this.link('Global Debt Clock · CC BY 4.0','https://www.global-debt-clock.com/'),' · ',this.link('Methodology','https://www.global-debt-clock.com/methodology/'));
    debt.append(source);panels.append(debt);
    const contextPane = this.node('section','stats-section terminal-pane');
    contextPane.append(this.node('h2','','Population & Health'));
    contextPane.append(this.node('p','disclaimer','Publisher-updated interactive charts; not second-by-second measurements.'));
    this.embedCharts(contextPane,[
      ['Population growth','population-growth-rate'],
      ['Life expectancy','life-expectancy'],
      ['Child mortality','child-mortality'],
      ['Food supply','daily-per-capita-caloric-supply']
    ]);
    panels.append(contextPane);
    const monitorPane = this.node('section','stats-section terminal-pane');
    monitorPane.append(this.node('h2','','Environment, Energy & Society'));
    monitorPane.append(this.node('p','disclaimer','Latest published research series, automatically updated by their provider.'));
    this.embedCharts(monitorPane,[
      ['Annual CO₂ emissions','annual-co2-emissions-per-country'],
      ['CO₂ per person','co2-emissions-per-capita'],
      ['Renewable energy share','renewable-share-energy'],
      ['Internet users','number-of-internet-users'],
      ['Internet usage share','share-of-individuals-using-the-internet']
    ]);
    panels.append(monitorPane);
    dashboard.append(panels);document.body.append(dashboard);
    const fade = animation.animate(dashboard,[{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{duration:1000,easing:'ease-out',fill:'both'});
    if (fade) fade.finished.catch(()=>{});
    await this.loadDebt(debtGrid);
    this.emit('dashboard-opened');
  }
  embedCharts(container, charts) {
    const tabs = this.node('div','chart-tabs');
    const viewport = this.node('div','chart-viewport');
    const frames = [];
    charts.forEach(([title, slug], index) => {
      const button = this.node('button','chart-tab',title);
      button.type = 'button'; button.setAttribute('aria-pressed',String(index===0));
      const frame = this.node('iframe','chart-frame');
      frame.title = title + ' · Our World in Data';
      frame.loading = 'lazy';
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.allow = 'web-share; clipboard-write';
      frame.dataset.source = 'https://ourworldindata.org/grapher/' + slug + '?tab=chart';
      frame.hidden = index!==0;
      if(index===0)frame.src=frame.dataset.source;
      frames.push(frame); viewport.append(frame);
      button.addEventListener('click',()=>{
        frames.forEach((item,i)=>{item.hidden=i!==index;});
        if(!frame.src)frame.src=frame.dataset.source;
        for(const child of tabs.children)child.setAttribute('aria-pressed',String(child===button));
        this.emit('chart-selected',{title});
      });
      tabs.append(button);
    });
    container.append(tabs,viewport);
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
