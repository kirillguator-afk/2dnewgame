
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
            fort: new Noise(seed + 404)
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
        // 1. География
        const h = this.getFractalNoise(this.noises.height, gx, gy, 6);
        const m = this.getFractalNoise(this.noises.moisture, gx, gy, 3);
        const dist = Math.sqrt(Math.pow((gx-this.centerX)/2500, 2) + Math.pow((gy-this.centerY)/2500, 2));
        let elevation = h * Math.max(0, 1.1 - dist);

        // 2. Дороги
        const roadVal = Math.abs(this.noises.roads.perlin(gx*0.015, gy*0.015));
        const isRoad = roadVal < 0.032 && elevation > 0.28;

        // 3. Биомы
        let biome = BIOMES.OCEAN;
        if (elevation > 0.28) {
            if (elevation < 0.31) biome = BIOMES.BEACH;
            else if (elevation > 0.75) biome = BIOMES.TAIGA;
            else biome = m > 0.5 ? BIOMES.FOREST : BIOMES.PLAINS;
        }

        const distTiles = Math.sqrt(Math.pow(gx-this.centerX, 2) + Math.pow(gy-this.centerY, 2));
        if (distTiles < 150) biome = BIOMES.VILLAGE;

        // 4. Глобальный маппинг структур (ПОСЕЛЕНИЯ И ФОРТЫ)
        let structure = null, deco = null, npc = null, isAnimated = false;
        const objN = (this.noises.objects.perlin(gx*0.4, gy*0.4) + 1) / 2;

        if (biome.id === 'village') {
            // Центр - Цитадель
            if (gx === this.centerX && gy === this.centerY) structure = 'royal_keep';
            // Сторожевые башни по периметру
            else if (Math.abs(distTiles - 100) < 2 && gx % 40 === 0) structure = 'watchtower';
            // Жилые кварталы вдоль дорог
            else if (isRoad && gx % 16 === 0 && gy % 16 === 0 && distTiles > 30) {
                const typeRand = Math.abs(gx * gy) % 100;
                structure = typeRand < 70 ? 'peasant_hut' : 'blacksmith';
            }
            // Фортификация (Частокол)
            else if (Math.abs(distTiles - 110) < 1 && !isRoad) deco = 'fort_palisade';
        } else {
            // Дикая природа
            if (objN > 0.9 && !isRoad) {
                if (biome.id === 'forest') deco = 'nature_oak';
                else if (biome.id === 'plains' && objN > 0.98) npc = 'deer';
            }
        }

        return { biome, isRoad, structure, deco, npc, isAnimated };
    }
}
