import fs from 'node:fs/promises';
import path from 'node:path';
import { createFilter } from 'vite';
import type { Plugin } from 'vite';
import { Vino } from './vino';
import { readDir } from './util';

export default async function vinoPlugin(options = {}): Promise<Plugin> {
  const vino = await Vino.make();

  function isPage(id: string) {
    const filter = createFilter(
      vino.config.include || '**/*.vue',
      vino.config.exclude,
    );

    return filter(id) && id.startsWith(vino.absolutePagesDirectory());
  }

  return {
    name: 'vino-plugin',

    async buildStart() {
      const files = await readDir(vino.absolutePagesDirectory());
      for (const file of files) {
        const code = await fs.readFile(path.resolve(file), 'utf-8');
        await vino.compileFile(path.resolve(file), code);
      }
      await vino.generateVinoFiles();
    },

    async transform(code, id) {
      let transformedCode = code;

      if (isPage(id)) {
        transformedCode = await vino.compileFile(path.resolve(id), code);

        await vino.generateVinoFiles();
      }

      return {
        code: transformedCode,
        map: null,
      };
    },

    async handleHotUpdate(ctx) {
      if (isPage(ctx.file)) {
        await vino.compileFile(ctx.file, await ctx.read());
      }
    },
  };
}
