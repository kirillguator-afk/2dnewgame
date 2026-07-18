
import { Noise } from '../utils/Noise.js';
import { BIOMES, CONFIG } from '../core/Constants.js';

export class TerrainGenerator {
    constructor(seed) {
        this.eNoise = new Noise(seed);
        this.mNoise = new Noise(seed + 100);
        this.dNoise = new Noise(seed + 200);
        this.centerX = 500000;
        this.centerY = 500000;
    }

    getTileData(gx, gy) {
        // 1. Elevation (Высота)
        const eScale = 0.01;
        let e = (this.eNoise.perlin(gx * eScale, gy * eScale) + 1) / 2;
        
        // Создаем "остров" суши вокруг центра (500k, 500k)
        const dx = (gx - this.centerX) / 200;
        const dy = (gy - this.centerY) / 200;
        const dist = Math.sqrt(dx*dx + dy*dy);
        e = e * Math.max(0, 1.2 - dist); 

        // 2. Moisture (Влажность)
        const m = (this.mNoise.perlin(gx * 0.02, gy * 0.02) + 1) / 2;

        let biome = BIOMES.OCEAN;
        if (e > 0.15) biome = BIOMES.BEACH;
        if (e > 0.25) {
            if (m < 0.3) biome = BIOMES.WASTELAND;
            else if (m < 0.7) biome = BIOMES.FOREST;
            else biome = BIOMES.SWAMP;
        }
        if (e > 0.6) biome = BIOMES.MOUNTAINS;
        if (e > 0.8) biome = BIOMES.SNOW;

        // Поселение в самом центре
        const distToCenter = Math.sqrt(Math.pow(gx-this.centerX, 2) + Math.pow(gy-this.centerY, 2));
        if (distToCenter < 40) biome = BIOMES.VILLAGE;

        // 3. Objects
        const dVal = (this.dNoise.perlin(gx * 0.2, gy * 0.2) + 1) / 2;
        let structureType = null;
        let decoType = null;
        let isAnimated = false;

        if (biome.id === 'village') {
            if (gx % 10 === 0 && gy % 10 === 0) structureType = 'hut';
            else if (dVal > 0.8) decoType = 'village_barrel';
        } else if (biome.id === 'forest' && dVal > 0.9) {
            decoType = 'forest_tree_1';
        } else if (biome.id === 'wasteland' && dVal > 0.95) {
            decoType = 'world_campfire';
            isAnimated = true;
        } else if (biome.id === 'mountains' && dVal > 0.92) {
            decoType = 'mountains_rock_1';
        }

        return { biome, structureType, decoType, isAnimated };
    }
}
