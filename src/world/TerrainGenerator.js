
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

        // 1. Определение зоны (Зонирование Королевства)
        let biome = BIOMES.WILDERNESS;
        if (dist < 80) biome = BIOMES.CITADEL;
        else if (dist < 250) biome = BIOMES.HIGH_CITY;
        else if (dist < 500) biome = BIOMES.SUBURBS;
        else if (dist < 800) biome = BIOMES.FARMLAND;

        // 2. Королевские тракты (Дороги)
        const roadVal = Math.abs(this.noises.roads.perlin(gx * 0.02, gy * 0.02));
        const isRoad = roadVal < 0.04 && dist > 30; // Дороги начинаются за пределами дворца
        if (isRoad) biome = BIOMES.ROAD;

        // 3. Структурная логика (Размещение без хаоса)
        let structure = null, deco = null, npc = null;
        const objVal = (this.noises.objects.perlin(gx * 0.5, gy * 0.5) + 1) / 2;

        if (biome.id === 'citadel') {
            if (gx === this.centerX - 5 && gy === this.centerY - 5) structure = 'castle_keep';
            else if (dist > 75 && dist < 78 && gx % 8 === 0) structure = 'watchtower';
        } 
        else if (biome.id === 'high_city' && !isRoad) {
            if (gx % 16 === 0 && gy % 16 === 0) structure = 'noble_house';
            else if (objVal > 0.8) deco = 'garden_statue';
        }
        else if (biome.id === 'suburbs' && !isRoad) {
            if (gx % 12 === 0 && gy % 12 === 0) structure = 'city_shop';
            else if (objVal > 0.7) deco = 'market_cart';
        }
        else if (biome.id === 'farmland' && !isRoad) {
            if (gx % 20 === 0 && gy % 20 === 0) structure = 'peasant_hut';
            else if (objVal > 0.6) deco = 'village_haystack';
            if (objVal < 0.05) npc = 'cow';
        }
        else if (biome.id === 'wild' && objVal > 0.9) {
            deco = 'nature_oak';
            if (objVal > 0.98) npc = 'deer';
        }

        return { biome, isRoad, structure, deco, npc };
    }
}
