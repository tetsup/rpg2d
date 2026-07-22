import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project, type SourceFile } from 'ts-morph';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const ROOT_TSCONFIG = path.resolve(__dirname, '../tsconfig.json');
const OUTPUT = path.resolve(__dirname, '../tools/deps-graph/src/deps-graph.json');

type Edge = {
  from: string;
  to: string;
  typeOnly: boolean;
};

const visitedConfigs = new Set<string>();
const projects: Project[] = [];
const sourceFiles = new Map<string, SourceFile>();

function normalize(filePath: string) {
  return path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
}

function resolveTsConfig(configPath: string) {
  let resolved = configPath;
  if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) resolved = path.join(resolved, 'tsconfig.json');
  if (!resolved.endsWith('.json')) resolved += '.json';
  return resolved;
}

function loadTsProject(tsconfigPath: string) {
  const absolute = resolveTsConfig(path.resolve(tsconfigPath));
  if (visitedConfigs.has(absolute)) return;

  if (!fs.existsSync(absolute)) {
    console.warn(`skip missing tsconfig: ${absolute}`);
    return;
  }

  visitedConfigs.add(absolute);
  const project = new Project({ tsConfigFilePath: absolute });
  projects.push(project);
  for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath();
    sourceFiles.set(filePath, sourceFile);
  }

  const config = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  for (const reference of config.references ?? []) {
    loadTsProject(path.resolve(path.dirname(absolute), reference.path));
  }
}

// ----------------------
// load projects
// ----------------------
loadTsProject(ROOT_TSCONFIG);

// ----------------------
// create graph
// ----------------------
const nodes = new Set<string>();
const edgeMap = new Map<string, Edge>();

for (const sourceFile of sourceFiles.values()) {
  const from = normalize(sourceFile.getFilePath());
  nodes.add(from);
}

for (const sourceFile of sourceFiles.values()) {
  const from = normalize(sourceFile.getFilePath());

  for (const declaration of sourceFile.getImportDeclarations()) {
    const target = declaration.getModuleSpecifierSourceFile();
    if (!target) continue;
    const to = normalize(target.getFilePath());
    if (!nodes.has(to)) {
      if (!to.includes('node_modules')) {
        console.warn(`${from}: import target ${to} was not found`);
      }
      continue;
    }

    const typeOnly =
      declaration.isTypeOnly() ||
      (declaration.getNamedImports().length > 0 &&
        declaration.getNamedImports().every((specifier) => specifier.isTypeOnly()));

    const key = `${from}->${to}`;

    const existing = edgeMap.get(key);

    if (existing) {
      // 値importが1つでもあれば通常import扱い
      existing.typeOnly = existing.typeOnly && typeOnly;
    } else {
      edgeMap.set(key, {
        from,
        to,
        typeOnly,
      });
    }
  }
}

const edges = [...edgeMap.values()];

// ----------------------
// output
// ----------------------

const result = {
  nodes: [...nodes],
  edges,
};

fs.writeFileSync(OUTPUT, JSON.stringify(result, null, 2));
console.log(`generated: ${OUTPUT}`);
console.log(`projects: ${projects.length}`);
console.log(`files: ${nodes.size}`);
console.log(`edges: ${edges.length}`);
