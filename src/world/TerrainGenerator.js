
import { Noise } from '../utils/Noise.js';
import { BIOMES, CONFIG } from '../core/Constants.js';

export class TerrainGenerator {
    constructor(seed) {
        this.seed = seed;
        this.noises = {
            height: new Noise(seed),
            moisture: new Noise(seed + 101),
            heat: new Noise(seed + 202),
            roads: new Noise(seed + 303),
            distortion: new Noise(seed + 404),
            objects: new Noise(seed + 505)
        };
        this.centerX = 500000;
        this.centerY = 500000;
    }

    getFractalNoise(noise, x, y, octaves, persistence, lacunarity, scale) {
        let total = 0, frequency = scale, amplitude = 1, maxValue = 0;
        for (let i = 0; i < octaves; i++) {
            total += noise.perlin(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }
        return (total / maxValue + 1) / 2;
    }

    getTileData(gx, gy) {
        const distortX = this.noises.distortion.perlin(gx * 0.05, gy * 0.05) * 10;
        const distortY = this.noises.distortion.perlin(gy * 0.05, gx * 0.05) * 10;

        const dx = (gx - this.centerX) / 3000, dy = (gy - this.centerY) / 3000;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        let height = this.getFractalNoise(this.noises.height, gx + distortX, gy + distortY, 5, 0.5, 2.0, 0.004);
        height *= Math.max(0, 1.1 - dist * dist);

        const roadNoiseVal = this.noises.roads.perlin((gx + distortX) * 0.02, (gy + distortY) * 0.02);
        const isRoad = Math.abs(roadNoiseVal) < 0.035 && height > 0.28;

        let biome = BIOMES.OCEAN;
        if (height > 0.28) {
            const heat = this.getFractalNoise(this.noises.heat, gx, gy, 3, 0.5, 2.0, 0.003);
            const moisture = this.getFractalNoise(this.noises.moisture, gx, gy, 3, 0.5, 2.0, 0.006);
            if (height < 0.31) biome = BIOMES.BEACH;
            else if (height > 0.72) biome = BIOMES.MOUNTAINS;
            else {
                if (heat < 0.45) biome = BIOMES.SNOW;
                else if (moisture > 0.6) biome = BIOMES.FOREST;
                else biome = BIOMES.WASTELAND;
            }
        }

        const distToCenter = Math.sqrt(Math.pow(gx-this.centerX, 2) + Math.pow(gy-this.centerY, 2));
        if (distToCenter < 80) biome = BIOMES.VILLAGE;

        // --- ЛОГИКА РАЗМЕЩЕНИЯ ОБЪЕКТОВ (БЕЗ НАЛОЖЕНИЙ) ---
        let structureType = null, decoType = null, isAnimated = false;
        const objVal = (this.noises.objects.perlin(gx * 0.5, gy * 0.5) + 1) / 2;

        if (biome.id === 'village') {
            // Увеличиваем шаг для массивных зданий
            if (gx % 24 === 0 && gy % 24 === 0) {
                const s = Math.abs(gx + gy) % 100;
                structureType = s < 40 ? 'town_hall' : s < 70 ? 'alchemist_shop' : 'tavern';
            } else if (objVal > 0.7 && !isRoad && gx % 4 !== 0) {
                // Декор только там, где нет фундаментов (gx % 4 !== 0 - упрощенная проверка)
                decoType = 'village_barrel_full';
            }
        } else if (height > 0.28 && !isRoad) {
            // Вне дорог и зданий
            if (objVal > 0.88) {
                if (biome.id === 'forest') decoType = `forest_tree_v${(Math.abs(gx)%5)+1}`;
                else if (biome.id === 'wasteland' && objVal > 0.98) { decoType = 'animated_fire'; isAnimated = true; }
            }
        }

        return { biome, structureType, decoType, isAnimated, isRoad };
    }
}
