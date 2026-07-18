
import { Noise } from '../utils/Noise.js';
import { BIOMES, CONFIG } from '../core/Constants.js';

export class TerrainGenerator {
    constructor(seed) {
        this.seed = seed;
        this.noises = {
            height: new Noise(seed),
            moisture: new Noise(seed + 101),
            heat: new Noise(seed + 202),
            erosion: new Noise(seed + 303),
            objects: new Noise(seed + 404)
        };

        // 50+ ПАРАМЕТРОВ ГЕНЕРАЦИИ
        this.params = {
            h_scale: 0.005, h_octaves: 6, h_persistence: 0.5, h_lacunarity: 2.1,
            m_scale: 0.008, m_octaves: 4,
            t_scale: 0.004, t_base: 0.5, t_lat_impact: 0.3,
            e_impact: 0.1, 
            sea_level: 0.28, beach_level: 0.32, mountain_level: 0.75, snow_level: 0.88,
            forest_density: 0.65, rock_density: 0.4, flower_density: 0.2,
            village_freq: 0.002, ruin_freq: 0.005
        };

        this.centerX = 500000;
        this.centerY = 500000;
    }

    // Фрактальный шум (FBM)
    getFractalNoise(noise, x, y, octaves, persistence, lacunarity, scale) {
        let total = 0;
        let frequency = scale;
        let amplitude = 1;
        let maxValue = 0;
        for (let i = 0; i < octaves; i++) {
            total += noise.perlin(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }
        return (total / maxValue + 1) / 2;
    }

    getTileData(gx, gy) {
        // 1. ВЫСОТА (Elevation)
        let height = this.getFractalNoise(
            this.noises.height, gx, gy, 
            this.params.h_octaves, this.params.h_persistence, this.params.h_lacunarity, this.params.h_scale
        );
        
        // Формирование материка
        const dx = (gx - this.centerX) / 2500;
        const dy = (gy - this.centerY) / 2500;
        const dist = Math.sqrt(dx*dx + dy*dy);
        height *= Math.max(0, 1.0 - dist * dist); // Океан по краям

        // 2. ТЕМПЕРАТУРА (Heat)
        let heat = this.getFractalNoise(this.noises.heat, gx, gy, 3, 0.5, 2.0, this.params.t_scale);
        heat -= (height - 0.5) * 0.5; // Выше в горах - холоднее

        // 3. ВЛАЖНОСТЬ (Moisture)
        let moisture = this.getFractalNoise(this.noises.moisture, gx, gy, 4, 0.5, 2.0, this.params.m_scale);
        if (height < this.params.sea_level) moisture += 0.2; // У воды влажнее

        // ОПРЕДЕЛЕНИЕ БИОМА
        let biome = BIOMES.OCEAN;

        if (height < this.params.sea_level) {
            biome = height < this.params.sea_level * 0.6 ? BIOMES.DEEP_OCEAN : BIOMES.OCEAN;
            if (heat > 0.7 && height > this.params.sea_level * 0.8) biome = BIOMES.REEF;
        } else if (height < this.params.beach_level) {
            biome = BIOMES.BEACH;
        } else if (height > this.params.mountain_level) {
            biome = height > this.params.snow_level ? BIOMES.PEAKS : BIOMES.MOUNTAINS;
        } else {
            // Матрица Whittaker
            if (heat < 0.3) {
                biome = moisture < 0.5 ? BIOMES.TUNDRA : BIOMES.SNOW;
            } else if (heat < 0.6) {
                if (moisture < 0.3) biome = BIOMES.WASTELAND;
                else if (moisture < 0.7) biome = BIOMES.PLAINS;
                else biome = BIOMES.FOREST;
            } else {
                if (moisture < 0.2) biome = BIOMES.DESERT;
                else if (moisture < 0.5) biome = BIOMES.SAVANNA;
                else biome = BIOMES.JUNGLE;
            }
        }

        // Принудительное поселение
        const distToCenter = Math.sqrt(Math.pow(gx-this.centerX, 2) + Math.pow(gy-this.centerY, 2));
        if (distToCenter < 40) biome = BIOMES.VILLAGE;

        // ОБЪЕКТЫ (Детализация)
        const dVal = this.noises.objects.perlin(gx * 0.3, gy * 0.3);
        let structureType = null;
        let decoType = null;
        let isAnimated = false;

        if (biome.id === 'village') {
            if (gx % 12 === 0 && gy % 12 === 0) structureType = (gx+gy) % 2 === 0 ? 'hut' : 'blacksmith';
            else if (dVal > 0.6) decoType = 'village_barrel';
        } else if (height > this.params.sea_level) {
            const chance = (dVal + 1) / 2;
            if (biome.id === 'forest' && chance > 0.85) decoType = 'forest_tree_1';
            if (biome.id === 'jungle' && chance > 0.7) decoType = 'forest_tree_2';
            if (biome.id === 'wasteland' && chance > 0.95) { decoType = 'world_campfire'; isAnimated = true; }
            if (biome.id === 'mountains' && chance > 0.9) decoType = 'mountains_rock_1';
            if (biome.id === 'plains' && chance > 0.98) decoType = 'forest_flower';
        }

        return { biome, structureType, decoType, isAnimated, height, heat, moisture };
    }
}
