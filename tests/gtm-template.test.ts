import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Validates the GTM custom template's shape and consistency. GTM's own
// sandboxed test runner only executes inside the template editor UI, so these
// checks cover the failures that bite locally: malformed JSON sections (which
// GTM silently rejects on import), missing sections, and the template's baked-in
// "latest" version drifting away from the published package version.

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const tplSource = readFileSync(join(repoRoot, 'gtm-template', 'template.tpl'), 'utf8');
const pkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8')) as {
  version: string;
};

// A .tpl file is a set of `___SECTION___`-delimited blocks. Split it into a
// name -> content map so each block can be validated independently.
function parseSections(source: string): Record<string, string> {
  const markers = [...source.matchAll(/^___([A-Z_]+)___$/gm)];
  const sections: Record<string, string> = {};

  for (let i = 0; i < markers.length; i++) {
    const current = markers[i];
    const name = current[1];
    const contentStart = (current.index ?? 0) + current[0].length;
    const next = markers[i + 1];
    const contentEnd = next ? (next.index ?? source.length) : source.length;
    sections[name] = source.slice(contentStart, contentEnd).trim();
  }

  return sections;
}

const sections = parseSections(tplSource);

const REQUIRED_SECTIONS = [
  'INFO',
  'TEMPLATE_PARAMETERS',
  'SANDBOXED_JS_FOR_WEB_TEMPLATE',
  'WEB_PERMISSIONS',
  'TESTS',
] as const;

// The sections GTM parses as JSON — a stray trailing comma here makes the
// whole template fail to import, with no useful error in the GTM UI.
const JSON_SECTIONS = ['INFO', 'TEMPLATE_PARAMETERS', 'WEB_PERMISSIONS'] as const;

describe('gtm custom template', () => {
  it('contains every required section', () => {
    for (const name of REQUIRED_SECTIONS) {
      expect(sections[name], `missing ___${name}___ section`).toBeTruthy();
    }
  });

  it.each(JSON_SECTIONS)('has valid JSON in the %s section', (name) => {
    expect(() => JSON.parse(sections[name])).not.toThrow();
  });

  it('bakes the current package version into LATEST_VERSION', () => {
    const match = sections.SANDBOXED_JS_FOR_WEB_TEMPLATE.match(/const LATEST_VERSION = '([^']+)';/);

    expect(match, 'could not find a LATEST_VERSION constant in the sandboxed code').not.toBeNull();
    expect(
      match?.[1],
      `LATEST_VERSION (${match?.[1]}) is stale — bump it to match package.json (${pkg.version}) and re-run the template tests in GTM`,
    ).toBe(pkg.version);
  });

  it('defines test scenarios', () => {
    expect(sections.TESTS).toContain('scenarios:');
  });
});
