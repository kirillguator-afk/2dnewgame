
import { Noise } from '../utils/Noise.js';
import { BIOMES, CONFIG } from '../core/Constants.js';

export class TerrainGenerator {
    constructor(seed) {
        this.biomeNoise = new Noise(seed);
        this.detailNoise = new Noise(seed + 1);
        this.roadNoise = new Noise(seed + 2);
    }

    getTileData(gx, gy) {
        // Окрашиваем биомы крупными пятнами
        const bScale = 0.005;
        const bVal = (this.biomeNoise.perlin(gx * bScale, gy * bScale) + 1) / 2;

        let biome;
        if (bVal < 0.25) biome = BIOMES.BASALT_PEAKS;
        else if (bVal < 0.5) biome = BIOMES.NEON_RUINS;
        else if (bVal < 0.75) biome = BIOMES.MAGNETIC_DESERT;
        else biome = BIOMES.TOXIC_SWAMP;

        // Генерация дорог (Ridge noise)
        const rScale = 0.02;
        const rVal = Math.abs(this.roadNoise.perlin(gx * rScale, gy * rScale));
        const isRoad = rVal < 0.05;

        // Детализация (ресурсы/мусор)
        const dScale = 0.1;
        const dVal = (this.detailNoise.perlin(gx * dScale, gy * dScale) + 1) / 2;
        
        let resource = null;
        if (!isRoad && dVal > 0.85) {
            if (biome.id === 'ruins') resource = 'COPPER_SCRAP';
            if (biome.id === 'swamp') resource = 'TOXIC_SLUDGE';
            if (biome.id === 'desert') resource = 'SILICON_SAND';
            if (biome.id === 'peaks') resource = 'IRON_ORE';
        }

        return {
            biome,
            isRoad,
            resource,
            variation: Math.floor(dVal * 10)
        };
    }
}
