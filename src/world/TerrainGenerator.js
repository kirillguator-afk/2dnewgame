
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
        if (dist < 80) biome = BIOMES.CITADEL;
        else if (dist < 200) biome = BIOMES.HIGH_CITY;
        else if (dist < 400) biome = BIOMES.FARMLAND;

        const roadVal = Math.abs(this.noises.roads.perlin(gx * 0.02, gy * 0.02));
        const isRoad = roadVal < 0.04 && dist > 20;
        if (isRoad) biome = BIOMES.ROAD;

        let structure = null, deco = null, npc = null;
        const objVal = (this.noises.objects.perlin(gx * 0.5, gy * 0.5) + 1) / 2;

        if (biome.id === 'citadel') {
            if (gx === this.centerX && gy === this.centerY) structure = 'castle_keep';
        } else if (biome.id === 'high_city' && !isRoad) {
            if (gx % 15 === 0 && gy % 15 === 0) structure = 'city_house';
        } else if (biome.id === 'farmland' && !isRoad) {
            if (gx % 20 === 0 && gy % 20 === 0) structure = 'peasant_hut';
            else if (objVal > 0.6) deco = 'nature_wheat';
            if (objVal < 0.05) npc = 'cow';
        } else if (biome.id === 'wild' && objVal > 0.9) {
            deco = 'nature_oak';
        }

        return { biome, isRoad, structure, deco, npc };
    }
}
