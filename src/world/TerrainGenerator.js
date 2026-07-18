
import { Noise } from '../utils/Noise.js';
import { BIOMES, CONFIG } from '../core/Constants.js';

export class TerrainGenerator {
    constructor(seed) {
        this.biomeNoise = new Noise(seed);
        this.detailNoise = new Noise(seed + 1);
        this.roadNoise = new Noise(seed + 2);
    }

    getTileData(gx, gy) {
        const bScale = 0.003;
        const bVal = (this.biomeNoise.perlin(gx * bScale, gy * bScale) + 1) / 2;

        let biome;
        if (bVal < 0.25) biome = BIOMES.MOUNTAINS;
        else if (bVal < 0.5) biome = BIOMES.FOREST;
        else if (bVal < 0.75) biome = BIOMES.WASTELAND;
        else biome = BIOMES.SWAMP;

        const rScale = 0.02;
        const rVal = Math.abs(this.roadNoise.perlin(gx * rScale, gy * rScale));
        const isRoad = rVal < 0.04;

        const dScale = 0.15;
        const dVal = (this.detailNoise.perlin(gx * dScale, gy * dScale) + 1) / 2;
        
        let objectType = null;
        // Шанс спавна объекта в зависимости от биома
        if (!isRoad && dVal > 0.88) {
            objectType = biome.id; 
        }

        return {
            biome,
            isRoad,
            objectType,
            variation: Math.floor(dVal * 10)
        };
    }
}
