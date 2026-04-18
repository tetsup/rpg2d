import { AppearanceData, AppearanceRuleData, AppearanceSchema, LayersData } from '@/schemas/appearance';
import { SkinSchema } from '@/schemas/image/skin';
import { Condition } from '@/schemas/condition';
import { ResourceManager } from './resource-manager';
import { ResourceBase } from './resource-base';
import { Skin } from './skin';

type Layers = Record<string, Skin | null>;

type Rule = { when: Condition; set: Layers };

export type AppearanceDeps = {
  default: Layers;
  rules: Rule[];
};

export class Appearance extends ResourceBase<'appearance'> {
  static schema = AppearanceSchema;
  currentLayers: Layers;

  constructor(resources: ResourceManager, data: AppearanceData, deps: AppearanceDeps) {
    super(resources, data, deps);
    this.currentLayers = deps.default;
  }

  static async loadLayers(resources: ResourceManager, layers: LayersData): Promise<Layers> {
    const layerEntries = await Promise.all(
      Object.entries(layers).map(async ([layer, skin]) => [
        layer,
        skin != null ? await resources.get(skin, SkinSchema, Skin.factory) : null,
      ])
    );
    return Object.fromEntries(layerEntries);
  }

  static async loadRule(resources: ResourceManager, rule: AppearanceRuleData): Promise<Rule> {
    return {
      when: rule.when,
      set: await this.loadLayers(resources, rule.set),
    };
  }

  static async loadDeps(resources: ResourceManager, data: AppearanceData) {
    const layers = {
      default: await this.loadLayers(resources, data.default),
      rules: await Promise.all(data.rules.map(async (rule) => await this.loadRule(resources, rule))),
    };
    return { layers };
  }

  resolveLayers() {
    return this.deps.default;
  }
}
