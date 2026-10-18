import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'next/headers') {
    return {
      url: pathToFileURL(path.resolve(process.cwd(), 'scripts/mock-headers.mjs')).href,
      shortCircuit: true,
    };
  }
  if (specifier === 'next/navigation') {
    return nextResolve('next/navigation.js', context);
  }
  if (specifier === 'next/cache') {
    return nextResolve('next/cache.js', context);
  }
  if (specifier.startsWith('@/')) {
    const subpath = specifier.slice(2);
    let resolvedPath = path.resolve(process.cwd(), subpath);
    if (fs.existsSync(resolvedPath)) {
      if (fs.statSync(resolvedPath).isDirectory()) {
        resolvedPath = path.join(resolvedPath, 'index.js');
      }
    } else if (fs.existsSync(resolvedPath + '.js')) {
      resolvedPath = resolvedPath + '.js';
    } else if (fs.existsSync(resolvedPath + '.jsx')) {
      resolvedPath = resolvedPath + '.jsx';
    }
    return {
      url: pathToFileURL(resolvedPath).href,
      shortCircuit: true,
    };
  }
  return nextResolve(specifier, context);
}

