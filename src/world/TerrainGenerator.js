
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
        if (biome.id === 'village' && !isRoad) {
            const seed = (gx * 7 + gy * 13) % 100;
            if (gx % 12 === 0 && gy % 12 === 0) {
                if (seed < 20) structureType = 'hut';
                else if (seed < 40) structureType = 'blacksmith';
                else if (seed < 60) structureType = 'tavern';
                else if (seed < 80) structureType = 'library';
                else structureType = 'storehouse';
            }
        }

        return {
            biome,
            isRoad,
            structureType,
            objectType: (!isRoad && dVal > 0.88) ? biome.id : null
        };
    }
}
