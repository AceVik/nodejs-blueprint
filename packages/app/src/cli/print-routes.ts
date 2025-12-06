#!/usr/bin/env node
import { createRoutesApp } from '@micro/routes';
import { findRoutesFolder, importRoutes } from '@micro/routes/router';

type Row = {
  method: string;
  path: string;
  name: string;
  hostnames: string;
  params: string;
};

const METHOD_ORDER = [
  'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD', 'TRACE', 'CONNECT', 'ANY',
];

function stringifyHostnames(h: unknown): string {
  if (h === 'any' || h === 'all' || h === 'base') return String(h);
  if (Array.isArray(h)) return h.join(',');
  if (typeof h === 'string') return h;
  return '';
}

function summarizeParams(params: Record<string, any> | undefined): string {
  if (!params) return '';
  const parts: string[] = [];
  for (const [key, p] of Object.entries(params)) {
    const type = (p as any).type as 'path' | 'query' | 'header' | string;
    const readType = (p as any).readType as string | undefined;
    parts.push(`${type}:${key}${readType && readType !== 'first' ? `[${readType}]` : ''}`);
  }
  return parts.join(' ');
}

function pad(str: string, len: number): string {
  return str.length >= len ? str : str + ' '.repeat(len - str.length);
}

function makeTable(rows: Row[]) {
  const headers = ['METHOD', 'PATH', 'NAME', 'HOSTNAMES', 'PARAMS'];
  const widths = [
    Math.max(headers[0].length, ...rows.map(r => r.method.length)),
    Math.max(headers[1].length, ...rows.map(r => r.path.length)),
    Math.max(headers[2].length, ...rows.map(r => r.name.length)),
    Math.max(headers[3].length, ...rows.map(r => r.hostnames.length)),
    Math.max(headers[4].length, ...rows.map(r => r.params.length)),
  ];

  const sep = widths.map(w => '-'.repeat(w)).join('  ');
  const header = headers.map((h, i) => pad(h, widths[i]!)).join('  ');
  const lines = rows.map(r => [r.method, r.path, r.name, r.hostnames, r.params]
    .map((c, i) => pad(c, widths[i]!)).join('  '));
  return [header, sep, ...lines].join('\n');
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const asJson = args.has('--json');

  const routesPath = await findRoutesFolder();
  if (!routesPath) {
    console.error('[routes] No routes folder found.');
    process.exit(1);
  }

  const app = createRoutesApp();
  const routes = await importRoutes(routesPath);
  app.use(...routes);

  const rows: Row[] = [...app.routes].map((r: any) => ({
    method: String(r.method).toUpperCase(),
    path: r.path,
    name: r.name,
    hostnames: stringifyHostnames(r.hostnames),
    params: summarizeParams(r.params),
  }));

  rows.sort((a, b) => {
    const ai = METHOD_ORDER.indexOf(a.method);
    const bi = METHOD_ORDER.indexOf(b.method);
    if (ai !== bi) return ai - bi;
    if (a.path !== b.path) return a.path.localeCompare(b.path);
    return a.name.localeCompare(b.name);
  });

  if (asJson) {
    console.log(JSON.stringify({ routes: rows }, null, 2));
    return;
  }

  const title = `Registered routes (${rows.length})`;
  console.log(title);
  console.log('='.repeat(title.length));
  console.log(makeTable(rows));
}

// Run
main().catch((err) => {
  console.error('[routes] Failed to print routes:', err);
  process.exit(1);
});
