
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
            objects: new Noise(seed + 404)
        };

        this.params = {
            h_scale: 0.004, h_octaves: 6,
            m_scale: 0.006,
            t_scale: 0.003,
            r_scale: 0.015, // Масштаб дорог
            sea_level: 0.28, beach_level: 0.31, mountain_level: 0.72
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
        // 1. Высота и Океан
        const dx = (gx - this.centerX) / 3000, dy = (gy - this.centerY) / 3000;
        const dist = Math.sqrt(dx*dx + dy*dy);
        let height = this.getFractalNoise(this.noises.height, gx, gy, 5, 0.5, 2.0, this.params.h_scale);
        height *= Math.max(0, 1.1 - dist * dist);

        // 2. Дороги (Ridge Noise)
        const roadVal = Math.abs(this.noises.roads.perlin(gx * this.params.r_scale, gy * this.params.r_scale));
        const isRoad = roadVal < 0.03 && height > this.params.sea_level;

        // 3. Климат
        let heat = this.getFractalNoise(this.noises.heat, gx, gy, 3, 0.5, 2.0, this.params.t_scale);
        let moisture = this.getFractalNoise(this.noises.moisture, gx, gy, 3, 0.5, 2.0, this.params.m_scale);

        let biome = BIOMES.OCEAN;
        if (height < this.params.sea_level) {
            biome = height < this.params.sea_level * 0.7 ? BIOMES.DEEP_OCEAN : BIOMES.OCEAN;
        } else if (height < this.params.beach_level) {
            biome = BIOMES.BEACH;
        } else if (height > this.params.mountain_level) {
            biome = height > 0.85 ? BIOMES.PEAKS : BIOMES.MOUNTAINS;
        } else {
            if (heat < 0.35) biome = moisture < 0.5 ? BIOMES.TUNDRA : BIOMES.SNOW;
            else if (heat < 0.65) {
                if (moisture < 0.3) biome = BIOMES.WASTELAND;
                else if (moisture < 0.7) biome = BIOMES.PLAINS;
                else biome = BIOMES.FOREST;
            } else {
                if (moisture < 0.3) biome = BIOMES.DESERT;
                else if (moisture < 0.6) biome = BIOMES.SAVANNA;
                else biome = BIOMES.JUNGLE;
            }
        }

        const distToCenter = Math.sqrt(Math.pow(gx-this.centerX, 2) + Math.pow(gy-this.centerY, 2));
        if (distToCenter < 50) biome = BIOMES.VILLAGE;

        // 4. Объекты
        const objVal = (this.noises.objects.perlin(gx * 0.4, gy * 0.4) + 1) / 2;
        let structureType = null, decoType = null, isAnimated = false;

        if (biome.id === 'village') {
            if (gx % 12 === 0 && gy % 12 === 0) structureType = (gx+gy)%2===0 ? 'hut' : 'blacksmith';
            else if (objVal > 0.7) decoType = 'village_barrel';
        } else if (height > this.params.sea_level && !isRoad) {
            if (biome.id === 'forest' && objVal > 0.82) decoType = 'forest_tree_1';
            if (biome.id === 'jungle' && objVal > 0.75) decoType = 'forest_tree_2';
            if (biome.id === 'mountains' && objVal > 0.88) decoType = 'mountains_rock_1';
            if (objVal > 0.98) { decoType = 'world_campfire'; isAnimated = true; }
        }

        return { biome, structureType, decoType, isAnimated, isRoad };
    }
}
