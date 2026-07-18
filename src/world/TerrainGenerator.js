
import { Noise } from '../utils/Noise.js';
import { BIOMES, CONFIG } from '../core/Constants.js';

export class TerrainGenerator {
    constructor(seed) {
        this.seed = seed;
        this.noises = {
            height: new Noise(seed),
            moisture: new Noise(seed + 101),
            roads: new Noise(seed + 202),
            objects: new Noise(seed + 303),
            biomes: new Noise(seed + 404)
        };
        this.centerX = 500000;
        this.centerY = 500000;
    }

    getTileData(gx, gy) {
        // 1. Климат
        const h = (this.noises.height.perlin(gx * 0.005, gy * 0.005) + 1) / 2;
        const m = (this.noises.moisture.perlin(gx * 0.01, gy * 0.01) + 1) / 2;
        
        let biome = BIOMES.OCEAN;
        if (h > 0.28) {
            if (h < 0.31) biome = BIOMES.BEACH;
            else if (h > 0.75) biome = BIOMES.MOUNTAINS;
            else biome = m > 0.6 ? BIOMES.FOREST : m > 0.4 ? BIOMES.PLAINS : BIOMES.WASTELAND;
        }

        const distToCenter = Math.sqrt(Math.pow(gx-this.centerX, 2) + Math.pow(gy-this.centerY, 2));
        if (distToCenter < 120) biome = BIOMES.VILLAGE;

        // 2. Дороги
        const rVal = Math.abs(this.noises.roads.perlin(gx * 0.02, gy * 0.02));
        const isRoad = rVal < 0.035 && h > 0.28;

        // 3. Объекты и логика размещения
        let structure = null, deco = null, npc = null;
        const objN = (this.noises.objects.perlin(gx * 0.4, gy * 0.4) + 1) / 2;

        if (biome.id === 'village' && !isRoad) {
            if (gx % 20 === 0 && gy % 20 === 0) {
                structure = (gx + gy) % 40 === 0 ? 'town_hall' : 'tavern';
            } else if (objN > 0.85) {
                deco = (gx % 2 === 0) ? 'market_stall' : 'village_cart';
            }
        } else if (biome.id === 'forest' && !isRoad) {
            if (objN > 0.8) deco = (objN > 0.9) ? 'tree_oak' : 'tree_pine';
            if (objN < 0.05) npc = 'deer';
        } else if (biome.id === 'plains' && !isRoad) {
            if (objN > 0.95) deco = 'tree_birch';
            if (objN < 0.02) npc = 'bird';
        } else if (h > 0.5 && objN > 0.99) {
            // Редкие руины в горах/лесах
            structure = 'wizard_tower';
        }

        return { biome, isRoad, structure, deco, npc };
    }
}
