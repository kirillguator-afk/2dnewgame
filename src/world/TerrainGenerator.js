
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
            distort: new Noise(seed + 404)
        };
        this.centerX = 500000;
        this.centerY = 500000;
    }

    getFractalNoise(noise, x, y, oct = 4) {
        let t = 0, f = 0.005, a = 1, max = 0;
        for (let i = 0; i < oct; i++) {
            t += noise.perlin(x * f, y * f) * a;
            max += a; a *= 0.5; f *= 2;
        }
        return (t / max + 1) / 2;
    }

    getTileData(gx, gy) {
        // Искажение для "ручного" вида дорог
        const dX = this.noises.distort.perlin(gx*0.04, gy*0.04) * 10;
        const dY = this.noises.distort.perlin(gy*0.04, gx*0.04) * 10;

        // 1. Климат и форма материка
        const dx = (gx - this.centerX) / 3000, dy = (gy - this.centerY) / 3000;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        let h = this.getFractalNoise(this.noises.height, gx + dX, gy + dY, 6);
        h *= Math.max(0, 1.15 - dist * dist); // Океан по краям

        const m = this.getFractalNoise(this.noises.moisture, gx, gy, 3);
        const roadVal = Math.abs(this.noises.roads.perlin((gx+dX)*0.015, (gy+dY)*0.015));
        const isRoad = roadVal < 0.032 && h > CONFIG.SEA_LEVEL;

        let biome = BIOMES.OCEAN;
        if (h > CONFIG.SEA_LEVEL) {
            if (h < CONFIG.SEA_LEVEL + 0.03) biome = BIOMES.BEACH;
            else if (h > 0.75) biome = BIOMES.TAIGA;
            else biome = m > 0.6 ? BIOMES.FOREST : BIOMES.PLAINS;
        }

        const distToCenter = Math.sqrt(Math.pow(gx-this.centerX, 2) + Math.pow(gy-this.centerY, 2));
        const isSettlement = distToCenter < CONFIG.VILLAGE_RADIUS;

        if (isSettlement && !isRoad) {
            const farmNoise = (this.noises.objects.perlin(gx*0.05, gy*0.05) + 1) / 2;
            if (farmNoise > 0.65) biome = BIOMES.FARMLAND;
            else biome = BIOMES.VILLAGE;
        }

        // 2. Логика Объектов
        let structure = null, deco = null, npc = null, isAnimated = false;
        const objN = (this.noises.objects.perlin(gx*0.4, gy*0.4) + 1) / 2;

        if (biome.id === 'village' && !isRoad) {
            // Здания только по сетке вдоль дорог
            if (gx % 16 === 0 && gy % 16 === 0) {
                structure = (gx + gy) % 48 === 0 ? 'tavern' : 'hut';
            } else if (objN > 0.8) {
                deco = (gx % 2 === 0) ? 'village_well_stone' : 'village_fence_h';
            }
        } else if (biome.id === 'farmland') {
            if (objN > 0.6) deco = 'crop_wheat';
            if (gx % 12 === 0 && gy % 12 === 0) npc = (gx % 24 === 0) ? 'cow' : 'sheep';
        } else if (biome.id === 'forest' && !isRoad && objN > 0.88) {
            deco = (gx % 2 === 0) ? `tree_forest_${(Math.abs(gx)%5)+1}` : `tree_birch_${(Math.abs(gy)%5)+1}`;
        } else if (biome.id === 'plains' && !isRoad && objN > 0.98) {
            deco = 'animated_fire'; isAnimated = true;
        }

        return { biome, isRoad, structure, deco, npc, isAnimated };
    }
}
