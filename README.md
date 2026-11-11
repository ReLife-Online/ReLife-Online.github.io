# ReLife

Open-source software preservation workbench. Public frontline: https://relifeonline.site

## Source decomposition

- This repository: minimal index.html, JavaScript lifecycle loader, generated index.R, systems/manifest.json, and approved Sites gateway source.
- ReLife-Online/relife-core: browser-local binary analysis and patch engine.
- ReLife-Online/relife-interface: JavaScript-generated HTML/CSS interface.

GitHub Pages serves the loader, which requests approved public modules through the Sites gateway. relifeonline.site belongs to ChatGPT Sites; do not add a Pages CNAME for it.

## Updates

The browser checks every 60 seconds. The gateway caches GitHub branch snapshots for up to 5 minutes to respect unauthenticated API limits. Each loaded module URL contains an exact Git commit SHA. New modules are imported before the previous system is disposed. Open bytes, patch history, current tab, offset and patch inputs are retained during module replacement. Failed module imports keep the running system. A source manifest can change the accent color; interface structure lives in the interface repository.

Only the three explicitly listed repositories are accepted by the gateway. Every writer to those repositories can change public client code. Uploaded binaries are never imported or executed. There are no secrets in this repository.

## Capabilities

Hex/ASCII inspection; limited 32-bit x86 subset disassembly and instruction pseudocode; ASCII strings; SHA-256; entropy; reversible byte patches; byte-exact binary export; browser-local saved projects. This is not a full decompiler, compiler, or malware scanner.

## R audit

index.R is generated from BinaryEngine.generateR(). Run Rscript index.R path-to-binary for numeric byte count and Shannon entropy. The browser also offers the generated file from Repository sources. An R interpreter is required to execute it.

## Gateway deployment

mirror/worker.js is the public gateway source. It runs as a Cloudflare Worker through ChatGPT Sites. Changing gateway routing or repository allowlists requires a Sites deployment; client modules and layout update from GitHub without redeployment.

## License

MIT. Licenses of software inspected by ReLife remain separate.
