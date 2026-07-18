
import { Noise } from '../utils/Noise.js';
import { BIOMES } from '../core/Constants.js';

export class TerrainGenerator {
    constructor(seed) {
        this.seed = seed;
        this.noises = {
            height: new Noise(seed),
            moisture: new Noise(seed + 1),
            roads: new Noise(seed + 2),
            distort: new Noise(seed + 3),
            objects: new Noise(seed + 4)
        };
        this.centerX = 500000;
        this.centerY = 500000;
    }

    getTileData(gx, gy) {
        const dX = this.noises.distort.perlin(gx * 0.05, gy * 0.05) * 6;
        const dY = this.noises.distort.perlin(gy * 0.05, gx * 0.05) * 6;

        // 1. География
        const dist = Math.sqrt(Math.pow((gx-this.centerX)/2000, 2) + Math.pow((gy-this.centerY)/2000, 2));
        let h = (this.noises.height.perlin((gx+dX)*0.005, (gy+dY)*0.005) + 1) / 2;
        h *= Math.max(0, 1.2 - dist);

        // 2. Дороги
        const rVal = Math.abs(this.noises.roads.perlin((gx+dX)*0.02, (gy+dY)*0.02));
        const isRoad = rVal < 0.035 && h > 0.28;

        // 3. Биомы
        let biome = BIOMES.OCEAN;
        if (h > 0.28) {
            const m = (this.noises.moisture.perlin(gx*0.01, gy*0.01) + 1) / 2;
            if (h < 0.31) biome = BIOMES.BEACH;
            else if (h > 0.75) biome = BIOMES.MOUNTAINS;
            else {
                biome = m > 0.5 ? BIOMES.FOREST : BIOMES.PLAINS;
            }
        }

        // Поселение
        const distToCenter = Math.sqrt(Math.pow(gx-this.centerX, 2) + Math.pow(gy-this.centerY, 2));
        if (distToCenter < 150) {
            if (!isRoad) {
                // Зонирование внутри поселения
                const farmNoise = (this.noises.objects.perlin(gx*0.05, gy*0.05) + 1) / 2;
                if (farmNoise > 0.7) biome = BIOMES.FARMLAND;
                else biome = BIOMES.VILLAGE;
            } else {
                biome = BIOMES.ROAD;
            }
        }

        // 4. Логика размещения (Мастер-Тайлы)
        let structure = null, deco = null, npc = null;
        const objNoise = (this.noises.objects.perlin(gx*0.4, gy*0.4) + 1) / 2;

        if (biome.id === 'village' && !isRoad) {
            // Здания только вдоль дорог
            const roadNear = this.checkRoadProximity(gx, gy);
            if (roadNear && gx % 16 === 0 && gy % 16 === 0) {
                structure = (gx + gy) % 32 === 0 ? 'town_hall' : 'hut';
            } else if (objNoise > 0.8) {
                deco = 'village_haystack';
            }
        } else if (biome.id === 'farmland') {
            if (objNoise > 0.6) deco = 'crop_wheat';
            if (gx % 10 === 0 && gy % 10 === 0) npc = (gx % 20 === 0) ? 'cow' : 'sheep';
        } else if (biome.id === 'forest' && !isRoad) {
            if (objNoise > 0.85) deco = 'nature_tree_pro';
        } else if (biome.id === 'plains' && !isRoad) {
            if (objNoise > 0.95) deco = 'nature_bush';
            if (objNoise < 0.05) npc = 'sheep';
        }

        return { biome, isRoad, structure, deco, npc };
    }

    checkRoadProximity(gx, gy) {
        for(let x=-2; x<=2; x++) {
            for(let y=-2; y<=2; y++) {
                const r = Math.abs(this.noises.roads.perlin((gx+x)*0.02, (gy+y)*0.02));
                if (r < 0.035) return true;
            }
        }
        return false;
    }
}
