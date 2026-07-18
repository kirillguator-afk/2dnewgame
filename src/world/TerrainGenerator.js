
import { Noise } from '../utils/Noise.js';
import { BIOMES, CONFIG } from '../core/Constants.js';

export class TerrainGenerator {
    constructor(seed) {
        this.elevationNoise = new Noise(seed);
        this.moistureNoise = new Noise(seed + 123);
        this.detailNoise = new Noise(seed + 456);
        this.centerX = 500000;
        this.centerY = 500000;
        this.worldRadius = 2000; // Радиус материка
    }

    getTileData(gx, gy) {
        // 1. Создаем форму материка (океан по краям)
        const dx = (gx - this.centerX) / this.worldRadius;
        const dy = (gy - this.centerY) / this.worldRadius;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const eScale = 0.002;
        let e = (this.elevationNoise.perlin(gx * eScale, gy * eScale) + 1) / 2;
        // Края материка уходят вниз (в океан)
        e = e * (1 - dist * dist * 0.8);

        const mScale = 0.0015;
        const m = (this.moistureNoise.perlin(gx * mScale, gy * mScale) + 1) / 2;

        let biome;
        if (e < 0.15) biome = BIOMES.OCEAN;
        else if (e < 0.22) biome = BIOMES.BEACH;
        else if (e > 0.75) biome = e > 0.85 ? BIOMES.SNOW : BIOMES.MOUNTAINS;
        else {
            // Матрица биомов по влажности
            if (m < 0.3) biome = BIOMES.WASTELAND;
            else if (m < 0.6) biome = BIOMES.FOREST;
            else biome = BIOMES.SWAMP;
        }

        // Принудительная деревня в центре
        const distToCenterTiles = Math.sqrt(Math.pow(gx - this.centerX, 2) + Math.pow(gy - this.centerY, 2));
        if (distToCenterTiles < 50) biome = BIOMES.VILLAGE;

        const dVal = (this.detailNoise.perlin(gx * 0.1, gy * 0.1) + 1) / 2;
        let decoType = null;
        let isAnimated = false;
        let structureType = null;

        // Генерация объектов
        if (biome.id !== 'ocean') {
            const seed = Math.abs(gx * 13 + gy * 7) % 100;
            
            if (biome.id === 'village') {
                if (gx % 12 === 0 && gy % 12 === 0) structureType = (seed < 50) ? 'hut' : 'blacksmith';
                else if (dVal > 0.8) decoType = (seed > 50) ? 'village_barrel' : 'village_crate';
            } else if (dVal > 0.94) {
                if (biome.id === 'forest') { decoType = seed > 50 ? 'forest_magic_shroom' : 'forest_tree_1'; isAnimated = seed > 50; }
                else if (biome.id === 'swamp') { decoType = 'swamp_bubbles'; isAnimated = true; }
                else if (biome.id === 'mountains') { decoType = 'mountains_crystal'; isAnimated = true; }
                else if (biome.id === 'wasteland') { decoType = seed > 80 ? 'world_campfire' : 'mountains_rock_1'; isAnimated = seed > 80; }
            }
        }

        return {
            biome,
            elevation: e,
            moisture: m,
            structureType,
            decoType,
            isAnimated,
            objectType: (!structureType && !decoType && dVal > 0.85 && biome.id === 'forest') ? 'forest_tree_1' : null
        };
    }
}
