const REPOS={pages:'ReLife-Online/ReLife-Online.github.io',core:'ReLife-Online/relife-core',interface:'ReLife-Online/relife-interface'};
const FILES={pages:new Set(['index.js','index.R','systems/manifest.json','README.md','AGENTS.md']),core:new Set(['binary.js']),interface:new Set(['workbench.js'])};
const ENTRY='<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ReLife — Open Source Software Preservation</title><script type="module" src="/index.js"></script></head><body></body></html>';
const headers={'Access-Control-Allow-Origin':'*','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
class SourceGateway{
 constructor(request,ctx){this.registry={systems:{},functions:{},events:[]};this.request=request;this.ctx=ctx;this.url=new URL(request.url);this.registry.functions.routes={snapshot:()=>this.snapshot()};}
 async cached(url,ttl,kind='text'){
   const cache=globalThis.caches?.default;const key=new Request(url,{method:'GET'});const hit=cache?await cache.match(key):null;
   if(hit)return kind==='json'?hit.json():hit.text();
   const response=await fetch(url,{headers:{'User-Agent':'ReLife-Open-Source-Mirror','Accept':kind==='json'?'application/vnd.github+json':'text/plain'}});
   if(!response.ok)throw new Error('GitHub source unavailable ('+response.status+').');
   const text=await response.text();if(text.length>1024*1024)throw new Error('Source exceeds module limit.');
   if(cache){const stored=new Response(text,{headers:{'Cache-Control':'public, max-age='+ttl}});this.ctx.waitUntil(cache.put(key,stored));}
   return kind==='json'?JSON.parse(text):text;
 }
 async head(alias){const ref=await this.cached('https://api.github.com/repos/'+REPOS[alias]+'/git/ref/heads/main',300,'json');const sha=ref.object?.sha;if(!/^[a-f0-9]{40}$/.test(sha||''))throw new Error('Invalid source revision.');return sha;}
 async source(alias,sha,path){if(!REPOS[alias]||!FILES[alias].has(path)||!/^[a-f0-9]{40}$/.test(sha))throw new Error('Source path is not approved.');return this.cached('https://raw.githubusercontent.com/'+REPOS[alias]+'/'+sha+'/'+path,86400);}
 async snapshot(){const entries=await Promise.all(Object.keys(REPOS).map(async alias=>[alias,{repository:REPOS[alias],sha:await this.head(alias)}]));const sources=Object.fromEntries(entries);const manifest=JSON.parse(await this.source('pages',sources.pages.sha,'systems/manifest.json'));if(manifest.schema!==1||manifest.sources?.core!==REPOS.core||manifest.sources?.interface!==REPOS.interface)throw new Error('Manifest sources are not approved.');return {sources,manifest,checkedAt:new Date().toISOString()};}
 response(body,type='text/plain; charset=utf-8',status=200,cache='no-store'){return new Response(this.request.method==='HEAD'?null:body,{status,headers:{...headers,'Content-Type':type,'Cache-Control':cache}});}
 async route(){
  if(!['GET','HEAD'].includes(this.request.method))return this.response('Method not allowed',undefined,405);
  const path=this.url.pathname;
  if(path==='/'||path==='/index.html')return this.response(ENTRY,'text/html; charset=utf-8');
  if(path==='/api/snapshot')return this.response(JSON.stringify(await this.snapshot()),'application/json');
  if(path==='/index.js'||path==='/index.R'){const sha=await this.head('pages');const text=await this.source('pages',sha,path.slice(1));return this.response(text,path.endsWith('.js')?'text/javascript; charset=utf-8':'text/plain; charset=utf-8');}
  const match=path.match(/^\/source\/(pages|core|interface)\/([a-f0-9]{40})\/([a-zA-Z0-9./-]+)$/);
  if(match&&FILES[match[1]].has(match[3]))return this.response(await this.source(match[1],match[2],match[3]),match[3].endsWith('.js')?'text/javascript; charset=utf-8':'text/plain; charset=utf-8',200,'public, max-age=31536000, immutable');
  if(path==='/favicon.ico')return this.response('',undefined,204);
  return this.response('Not found',undefined,404);
 }
}
export default {async fetch(request,env,ctx){try{return await new SourceGateway(request,ctx).route()}catch(error){return new Response(JSON.stringify({error:'Source synchronization temporarily unavailable',detail:error.message}),{status:503,headers:{...headers,'Content-Type':'application/json','Cache-Control':'no-store'}})}};
