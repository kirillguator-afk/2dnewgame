
import { Noise } from '../utils/Noise.js';
import { BIOMES, CONFIG } from '../core/Constants.js';

export class TerrainGenerator {
    constructor(seed) {
        this.seed = seed;
        this.noises = {
            height: new Noise(seed),
            moisture: new Noise(seed + 101),
            roads: new Noise(seed + 202),
            objects: new Noise(seed + 303),
            chaos: new Noise(seed + 404) // Шум для хаотичности дорог
        };
        this.centerX = CONFIG.KINGDOM_CENTER;
        this.centerY = CONFIG.KINGDOM_CENTER;
    }

    getTileData(gx, gy) {
        const dx = gx - this.centerX;
        const dy = gy - this.centerY;
        const dist = Math.sqrt(dx*dx + dy*dy);

        // 1. Климатические зоны
        let biome = BIOMES.WILDERNESS;
        if (dist < 100) biome = BIOMES.CITADEL;
        else if (dist < 350) biome = BIOMES.VILLAGE;
        else if (dist < 600) biome = BIOMES.FARMLAND;
        else {
            const h = (this.noises.height.perlin(gx*0.005, gy*0.005) + 1)/2;
            biome = h > 0.6 ? BIOMES.FOREST : BIOMES.WILDERNESS;
        }

        // 2. Хаотичные дороги
        const roadChaos = this.noises.chaos.perlin(gx * 0.05, gy * 0.05) * 5;
        const roadVal = Math.abs(this.noises.roads.perlin((gx + roadChaos) * 0.015, (gy + roadChaos) * 0.015));
        let isRoad = roadVal < 0.035 && dist > 30;

        // 3. Зонирование и Тропинки
        let structure = null, deco = null, isAnimated = false, npc = null;
        let isPath = false;

        if (biome.id === 'village') {
            // Плотные кластеры домов
            const clusterX = Math.floor(gx / 20);
            const clusterY = Math.floor(gy / 20);
            const clusterSeed = Math.abs((this.noises.objects.perlin(clusterX, clusterY) * 100) % 100);

            if (clusterSeed > 40) { // Есть деревня в этом квадрате
                if (gx % 12 === 0 && gy % 12 === 0) {
                    structure = (gx + gy) % 24 === 0 ? 'city_house' : 'peasant_hut';
                }
                // Создаем "протоптанность" вокруг домов
                if (gx % 12 < 3 && gy % 12 < 3) isPath = true;
            }

            if (!structure && !isRoad && !isPath) {
                const objVal = (this.noises.objects.perlin(gx*0.4, gy*0.4) + 1)/2;
                if (objVal > 0.85) deco = 'village_barrel_stack';
                else if (objVal > 0.8) deco = 'village_lantern';
            }
        } else if (biome.id === 'forest') {
            const objVal = (this.noises.objects.perlin(gx*0.3, gy*0.3) + 1)/2;
            if (objVal > 0.75) deco = 'nature_oak_large';
            else if (objVal > 0.6) deco = 'nature_grass_tall';
        } else if (biome.id === 'wild') {
            const objVal = (this.noises.objects.perlin(gx*0.2, gy*0.2) + 1)/2;
            if (objVal > 0.95) deco = 'nature_rock_huge';
            if (objVal < 0.02) npc = 'cow';
        }

        if (isRoad) biome = BIOMES.ROAD;
        else if (isPath) biome = BIOMES.DIRT_PATH;

        return { biome, isRoad, structure, deco, npc, isAnimated };
    }
}
