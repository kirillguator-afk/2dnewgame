
import { Noise } from '../utils/Noise.js';
import { BIOMES, CONFIG } from '../core/Constants.js';

export class TerrainGenerator {
    constructor(seed) {
        this.biomeNoise = new Noise(seed);
        this.detailNoise = new Noise(seed + 1);
        this.roadNoise = new Noise(seed + 2);
    }

    getTileData(gx, gy) {
        const centerX = 500000;
        const centerY = 500000;
        const distToCenter = Math.sqrt(Math.pow(gx - centerX, 2) + Math.pow(gy - centerY, 2));

        let biome;
        const bScale = 0.003;
        const bVal = (this.biomeNoise.perlin(gx * bScale, gy * bScale) + 1) / 2;

        if (distToCenter < CONFIG.VILLAGE_RADIUS * CONFIG.CHUNK_SIZE) {
            biome = BIOMES.VILLAGE;
        } else {
            if (bVal < 0.25) biome = BIOMES.MOUNTAINS;
            else if (bVal < 0.5) biome = BIOMES.FOREST;
            else if (bVal < 0.75) biome = BIOMES.WASTELAND;
            else biome = BIOMES.SWAMP;
        }

        const rScale = 0.02;
        const rVal = Math.abs(this.roadNoise.perlin(gx * rScale, gy * rScale));
        const isRoad = rVal < 0.04 || biome.id === 'village';

        const dScale = 0.15;
        const dVal = (this.detailNoise.perlin(gx * dScale, gy * dScale) + 1) / 2;
        
        let structureType = null;
        let decoType = null;
        let isAnimated = false;

        // Декор в деревне
        if (biome.id === 'village' && !isRoad) {
            const seed = Math.abs(gx * 7 + gy * 13) % 100;
            if (gx % 12 === 0 && gy % 12 === 0) {
                structureType = seed < 50 ? 'hut' : 'blacksmith';
            } else if (dVal > 0.85) {
                decoType = seed > 50 ? 'village_barrel' : 'village_crate';
            }
        }

        // Анимированный декор в мире
        if (biome.id !== 'village' && !isRoad && dVal > 0.92) {
            const worldSeed = Math.abs(gx * 3 + gy * 17) % 100;
            if (biome.id === 'forest' && worldSeed > 80) {
                decoType = 'forest_magic_shroom';
                isAnimated = true;
            } else if (biome.id === 'swamp' && worldSeed > 70) {
                decoType = 'swamp_bubbles';
                isAnimated = true;
            } else if (biome.id === 'mountains' && worldSeed > 85) {
                decoType = 'mountains_crystal';
                isAnimated = true;
            } else if (worldSeed < 5) {
                decoType = 'world_campfire';
                isAnimated = true;
            }
        }

        return {
            biome,
            isRoad,
            structureType,
            decoType,
            isAnimated,
            objectType: (!isRoad && !structureType && !decoType && dVal > 0.85) ? biome.id : null
        };
    }
}
