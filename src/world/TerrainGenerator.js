
import { Noise } from '../utils/Noise.js';
import { BIOMES, CONFIG } from '../core/Constants.js';

export class TerrainGenerator {
    constructor(seed) {
        this.seed = seed;
        this.noises = {
            height: new Noise(seed),
            roads: new Noise(seed + 10),
            objects: new Noise(seed + 20)
        };
        this.centerX = CONFIG.KINGDOM_CENTER;
        this.centerY = CONFIG.KINGDOM_CENTER;
    }

    getTileData(gx, gy) {
        const dx = gx - this.centerX;
        const dy = gy - this.centerY;
        const dist = Math.sqrt(dx*dx + dy*dy);

        // Зонирование
        let biome = BIOMES.WILDERNESS;
        if (dist < 100) biome = BIOMES.CITADEL;
        else if (dist < 300) biome = BIOMES.HIGH_CITY;
        else if (dist < 600) biome = BIOMES.SUBURBS;
        else if (dist < 1000) biome = BIOMES.FARMLAND;

        const roadVal = Math.abs(this.noises.roads.perlin(gx * 0.02, gy * 0.02));
        const isRoad = roadVal < 0.035 && dist > 20;
        if (isRoad) biome = BIOMES.ROAD;

        let structure = null;
        let deco = null;
        let npc = null;
        const objVal = (this.noises.objects.perlin(gx * 0.5, gy * 0.5) + 1) / 2;

        // ЛОГИКА ГЕНЕРАЦИИ РАЗНООБРАЗНЫХ ЗДАНИЙ
        if (!isRoad) {
            const seed = Math.abs(gx * 17 + gy * 31) % 100;
            
            if (biome.id === 'citadel' && gx % 30 === 0 && gy % 30 === 0) {
                structure = `noble_${seed % 5}`;
            } 
            else if (biome.id === 'high_city' && gx % 20 === 0 && gy % 20 === 0) {
                structure = seed > 50 ? `tavern_${seed % 10}` : `noble_${seed % 5}`;
            }
            else if (biome.id === 'suburbs' && gx % 16 === 0 && gy % 16 === 0) {
                structure = seed > 80 ? `tavern_${seed % 10}` : `villager_${seed % 10}`;
            }
            else if (biome.id === 'farmland' && gx % 24 === 0 && gy % 24 === 0) {
                structure = `villager_${seed % 10}`;
            }

            // Декор
            if (!structure) {
                if (biome.id === 'wild' && objVal > 0.9) deco = (gx % 2 === 0) ? 'nature_tree_1' : 'nature_tree_2';
                if (biome.id === 'farmland' && objVal > 0.7) deco = 'nature_wheat';
            }
        }

        return { biome, isRoad, structure, deco, npc };
    }
}
