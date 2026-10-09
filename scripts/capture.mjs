#!/usr/bin/env node
/* CAPTURE THE TOOL SURFACE. Nothing on this site's grid is typed.
 *
 *   npm run capture
 *
 * Four reads, all primary, all frozen into ONE MODULE at src/lib/captured.ts. A module and not
 * a JSON data file, because the page is served by a Cloudflare Worker and a Worker has no
 * filesystem to read a data file from at request time.
 *
 * 1. THE SERVER ITSELF. It spawns the built parserail-mcp over stdio, completes the MCP
 *    handshake and asks for tools/list. That reply is the tool surface, answered locally by the
 *    SDK out of the registrations in dist/index.js. It reaches no network and it spends no
 *    credit: tools/list never calls ParseRail. The key in the environment is a placeholder,
 *    present only because the server exits 1 without one.
 * 2. THE PRICES, off https://parserail.thecompound.tech/pricing.json, which is what the API
 *    publishes today. A price typed onto a page is a price that is wrong the day it moves.
 * 3. ASYNC, off https://parserail.thecompound.tech/openapi.json. An endpoint accepts async:true
 *    when its own OpenAPI operation documents the parameter, so this counts operations rather
 *    than keeping a second list.
 * 4. THE COLLECTIONS, off ~/CompoundLabs/parserail/src/lib/platform/constants.ts, which is the
 *    one place the API groups its endpoints. It is not published on a public URL, so it is read
 *    off the file and SOURCES records the path and the day.
 *
 * STDERR IS MERGED, and a capture that came back missing what it exists to show is REFUSED
 * rather than written. A short capture that still looks like output is the failure this guards.
 */
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PKG = join(homedir(), 'CompoundLabs/parserail-mcp');
const CONSTANTS = join(homedir(), 'CompoundLabs/parserail/src/lib/platform/constants.ts');
const refuse = (why) => { process.stderr.write(`capture refused: ${why}\n`); process.exit(1); };

/* 1. tools/list, off the built server. */
const handshake = await new Promise((done) => {
  if (!existsSync(join(PKG, 'dist/index.js'))) refuse(`${PKG}/dist/index.js is not built`);
  const p = spawn('node', [join(PKG, 'dist/index.js')], {
    env: { ...process.env, PARSERAIL_API_KEY: 'ksk_live_PLACEHOLDER_NO_CALL_IS_MADE' },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  let out = '';
  let err = '';
  p.stdout.on('data', (d) => (out += d));
  p.stderr.on('data', (d) => (err += d));
  const send = (o) => p.stdin.write(JSON.stringify(o) + '\n');
  send({ jsonrpc: '2.0', id: 1, method: 'initialize',
    params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'parserail-mcp-site capture', version: '1' } } });
  setTimeout(() => {
    send({ jsonrpc: '2.0', method: 'notifications/initialized' });
    send({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
  }, 500);
  setTimeout(() => {
    p.kill();
    const lines = out.split('\n').filter(Boolean).map((l) => JSON.parse(l));
    done({ init: lines.find((l) => l.id === 1)?.result, list: lines.find((l) => l.id === 2)?.result, err: err.trim() });
  }, 2600);
});

const raw = handshake.list?.tools;
if (!Array.isArray(raw) || raw.length < 41) refuse(`tools/list came back with ${raw ? raw.length : 'no'} tools`);
if (!handshake.init?.serverInfo?.version) refuse('the handshake returned no server version');
if (!handshake.err) refuse('the server printed nothing on stderr, so the run is not the run it reports');

const TOOLS = raw.map((t) => {
  const s = t.inputSchema || {};
  const props = Object.keys(s.properties || {});
  const req = s.required || [];
  return {
    name: t.name,
    key: t.name.replace(/^parserail_/, '').replace(/_/g, '-'),
    title: t.title,
    description: t.description,
    required: req,
    optional: props.filter((p) => !req.includes(p)),
    readOnly: t.annotations?.readOnlyHint === true,
    idempotent: t.annotations?.idempotentHint === true,
  };
});

/* 2. the prices. */
const pricing = await (await fetch('https://parserail.thecompound.tech/pricing.json')).json();
if (!Array.isArray(pricing.endpoints) || pricing.endpoints.length < 39) refuse(`pricing.json listed ${pricing.endpoints?.length} endpoints`);
if (typeof pricing.credit_usd !== 'number') refuse('pricing.json states no credit price');

/* 3. async, off the OpenAPI document. */
const openapi = await (await fetch('https://parserail.thecompound.tech/openapi.json')).json();
const ASYNC = Object.entries(openapi.paths || {})
  .filter(([, v]) => v.post && /"async"/.test(JSON.stringify(v.post)))
  .map(([p]) => p.replace('/v1/', ''));
if (ASYNC.length < 1) refuse('no operation in the OpenAPI document mentions the async parameter');

/* 4. the collections and the throttles, off the API's own constants. */
const cs = readFileSync(CONSTANTS, 'utf8');
const COLLECTIONS = [...cs.matchAll(/\{ key: "([a-z]+)", title: "([^"]+)", blurb: "([^"]+)" \}/g)]
  .map((m) => ({ key: m[1], title: m[2], blurb: m[3] }));
if (COLLECTIONS.length !== 7) refuse(`${COLLECTIONS.length} collections parsed out of the constants, not 7`);
const OF = Object.fromEntries([...cs.matchAll(/\{ key: "([a-z-]+)", collection: "([a-z]+)"/g)].map((m) => [m[1], m[2]]));
if (Object.keys(OF).length !== 39) refuse(`${Object.keys(OF).length} endpoints carry a collection, not 39`);
const RATES = Object.fromEntries(
  [...cs.matchAll(/\n {2}"?([a-z-]+)"?: \{ limit: (\d+), windowSec: (\d+) \}/g)].map((m) => [m[1], Number(m[2])]),
);
if (Object.keys(RATES).length !== 39) refuse(`${Object.keys(RATES).length} endpoints carry a throttle, not 39`);

const day = new Date().toISOString().slice(0, 10);
const body =
  `// GENERATED by scripts/capture.mjs. Do not edit: every value here was read from the thing\n` +
  `// that produces it, and a hand edit makes this file stop being that.\n` +
  `//\n` +
  `//   the surface   parserail-mcp/dist/index.js, over stdio, tools/list\n` +
  `//   the prices    https://parserail.thecompound.tech/pricing.json\n` +
  `//   async         https://parserail.thecompound.tech/openapi.json\n` +
  `//   collections   ~/CompoundLabs/parserail/src/lib/platform/constants.ts\n` +
  `export const CAPTURED_AT = ${JSON.stringify(day)};\n` +
  `export const SERVER = ${JSON.stringify({
    name: handshake.init.serverInfo.name,
    version: handshake.init.serverInfo.version,
    protocol: handshake.init.protocolVersion,
    capabilities: Object.keys(handshake.init.capabilities || {}),
    stderr: handshake.err,
  }, null, 1)} as const;\n` +
  `export const CREDIT_USD = ${pricing.credit_usd};\n` +
  `export const TOOLS = ${JSON.stringify(TOOLS, null, 1)} as const;\n` +
  `export const PRICES = ${JSON.stringify(
    Object.fromEntries(pricing.endpoints.map((e) => [e.key, { credits: e.credits, usd: e.usd, unit: e.unit, available: e.available }])),
    null, 1,
  )} as const;\n` +
  `export const ASYNC = ${JSON.stringify(ASYNC, null, 1)} as const;\n` +
  `export const COLLECTIONS = ${JSON.stringify(COLLECTIONS, null, 1)} as const;\n` +
  `export const COLLECTION_OF: Record<string, string> = ${JSON.stringify(OF, null, 1)};\n` +
  `export const RATE_PER_MINUTE: Record<string, number> = ${JSON.stringify(RATES, null, 1)};\n`;

writeFileSync(resolve(ROOT, 'src/lib/captured.ts'), body);
process.stdout.write(
  `captured ${TOOLS.length} tools off ${handshake.init.serverInfo.name} ${handshake.init.serverInfo.version}, ` +
  `${pricing.endpoints.length} prices, ${ASYNC.length} async endpoints, ${COLLECTIONS.length} collections\n` +
  `stderr: ${handshake.err}\n`,
);
