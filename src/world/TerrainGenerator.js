
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
            distortion: new Noise(seed + 404), // Шум искажения для дорог
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
        // 1. Искажение координат для "кривых" дорог и биомов
        const distortX = this.noises.distortion.perlin(gx * 0.05, gy * 0.05) * 15;
        const distortY = this.noises.distortion.perlin(gy * 0.05, gx * 0.05) * 15;

        const dx = (gx - this.centerX) / 3000, dy = (gy - this.centerY) / 3000;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        let height = this.getFractalNoise(this.noises.height, gx + distortX, gy + distortY, 5, 0.5, 2.0, 0.004);
        height *= Math.max(0, 1.1 - dist * dist);

        // 2. Хаотичные дороги
        const roadNoiseVal = this.noises.roads.perlin((gx + distortX) * 0.02, (gy + distortY) * 0.02);
        const isRoad = Math.abs(roadNoiseVal) < 0.04 && height > 0.28;

        let biome = BIOMES.OCEAN;
        if (height > 0.28) {
            const heat = this.getFractalNoise(this.noises.heat, gx, gy, 3, 0.5, 2.0, 0.003);
            const moisture = this.getFractalNoise(this.noises.moisture, gx, gy, 3, 0.5, 2.0, 0.006);

            if (height < 0.31) biome = BIOMES.BEACH;
            else if (height > 0.72) biome = height > 0.85 ? BIOMES.PEAKS : BIOMES.MOUNTAINS;
            else {
                if (heat < 0.4) biome = moisture < 0.5 ? BIOMES.TUNDRA : BIOMES.SNOW;
                else if (heat < 0.7) {
                    if (moisture < 0.3) biome = BIOMES.WASTELAND;
                    else if (moisture < 0.7) biome = BIOMES.PLAINS;
                    else biome = BIOMES.FOREST;
                } else {
                    if (moisture < 0.4) biome = BIOMES.DESERT;
                    else biome = BIOMES.JUNGLE;
                }
            }
        }

        const distToCenter = Math.sqrt(Math.pow(gx-this.centerX, 2) + Math.pow(gy-this.centerY, 2));
        if (distToCenter < 60) biome = BIOMES.VILLAGE;

        // 3. Объекты
        const objVal = (this.noises.objects.perlin(gx * 0.5, gy * 0.5) + 1) / 2;
        let structureType = null, decoType = null, isAnimated = false;

        if (biome.id === 'village') {
            const localSeed = Math.abs(gx * 17 + gy * 31) % 100;
            if (gx % 15 === 0 && gy % 15 === 0) {
                structureType = localSeed < 40 ? 'hut' : localSeed < 80 ? 'tavern' : 'blacksmith';
            } else if (objVal > 0.7) {
                decoType = localSeed > 90 ? 'village_lamp_post' : localSeed > 50 ? 'village_barrel_full' : 'village_bench_royal';
            }
        } else if (height > 0.28 && !isRoad) {
            if (objVal > 0.85) {
                if (biome.id === 'forest') decoType = `tree_forest_${(Math.abs(gx)%10)+1}`;
                else if (biome.id === 'mountains') decoType = `rock_detailed_${(Math.abs(gx)%10)+1}`;
                else if (objVal > 0.98) { decoType = 'world_campfire'; isAnimated = true; }
            }
        }

        return { biome, structureType, decoType, isAnimated, isRoad };
    }
}
