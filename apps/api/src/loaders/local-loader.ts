import * as fs from 'node:fs';
import * as path from 'node:path';
import chokidar from 'chokidar';
import * as yaml from 'yaml';
import { NotFoundError } from '../errors/http-error';
import { parseResource } from '@schema/api/resource/common';
import { resources } from '@schema/resource/common/base';

export class LocalLoader {
  private resources = Object.fromEntries(resources.map((resourceType) => [resourceType, new Map()]));

  constructor(private rootDir: string) {
    this.loadAll();

    chokidar.watch(this.rootDir).on('all', (_, filePath) => {
      if (!filePath.endsWith('.yaml')) return;
      this.loadOne(filePath);
    });
  }

  private loadAll() {
    const files = this.walk(this.rootDir);

    for (const file of files) {
      if (file.endsWith('.yaml')) {
        this.loadOne(file);
      }
    }
  }

  private loadOne(filePath: string) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = yaml.parse(raw);
    parseResource(data);
    this.resources[data.type].set(data.id, data);
  }

  private walk(dir: string): string[] {
    const result: string[] = [];

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        result.push(...this.walk(full));
      } else {
        result.push(full);
      }
    }

    return result;
  }

  readResource(namespace: string, type: string, id: string) {
    const data = this.resources[type].get(`${namespace}/${type}/${id}`);
    if (!data) throw new NotFoundError();
    return data;
  }
}
