
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
            objects: new Noise(seed + 404),
            village: new Noise(seed + 505)
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
        const dx = (gx - this.centerX) / 3000, dy = (gy - this.centerY) / 3000;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        let height = this.getFractalNoise(this.noises.height, gx, gy, 5, 0.5, 2.0, 0.004);
        height *= Math.max(0, 1.1 - dist * dist);

        const roadVal = Math.abs(this.noises.roads.perlin(gx * 0.015, gy * 0.015));
        const isRoad = roadVal < 0.03 && height > 0.28;

        let heat = this.getFractalNoise(this.noises.heat, gx, gy, 3, 0.5, 2.0, 0.003);
        let moisture = this.getFractalNoise(this.noises.moisture, gx, gy, 3, 0.5, 2.0, 0.006);

        let biome = BIOMES.OCEAN;
        if (height < 0.28) {
            biome = height < 0.2 ? BIOMES.DEEP_OCEAN : BIOMES.OCEAN;
        } else if (height < 0.31) {
            biome = BIOMES.BEACH;
        } else if (height > 0.72) {
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

        const objVal = (this.noises.objects.perlin(gx * 0.4, gy * 0.4) + 1) / 2;
        let structureType = null, decoType = null, isAnimated = false;

        if (biome.id === 'village') {
            if (gx % 15 === 0 && gy % 15 === 0) {
                const s = Math.abs(gx+gy) % 100;
                if (s < 40) structureType = 'hut';
                else if (s < 70) structureType = 'blacksmith';
                else structureType = 'tavern';
            } else if (objVal > 0.6) {
                const s = Math.abs(gx*gy) % 3;
                decoType = s === 0 ? 'village_barrel' : s === 1 ? 'village_crate' : 'village_bench';
            }
        } else if (height > 0.28 && !isRoad) {
            if (objVal > 0.8) {
                if (biome.id === 'forest') decoType = `forest_tree_${(Math.abs(gx)%5)+1}`;
                else if (biome.id === 'jungle') decoType = `jungle_tree_${(Math.abs(gx)%5)+1}`;
                else if (biome.id === 'mountains') decoType = `rock_${(Math.abs(gx)%8)+1}`;
                else if (objVal > 0.98) { decoType = 'world_campfire'; isAnimated = true; }
            }
        }

        return { biome, structureType, decoType, isAnimated, isRoad };
    }
}
