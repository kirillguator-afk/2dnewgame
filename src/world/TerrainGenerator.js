
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
            distort: new Noise(seed + 404)
        };
        this.centerX = CONFIG.KINGDOM_CENTER;
        this.centerY = CONFIG.KINGDOM_CENTER;
    }

    getTileData(gx, gy) {
        const dx = gx - this.centerX;
        const dy = gy - this.centerY;
        const dist = Math.sqrt(dx*dx + dy*dy);

        // 1. Искажение для естественности
        const dX = this.noises.distort.perlin(gx*0.05, gy*0.05) * 8;
        const dY = this.noises.distort.perlin(gy*0.05, gx*0.05) * 8;

        // 2. Биомы
        let biome = BIOMES.WILDERNESS;
        if (dist < 100) biome = BIOMES.CITADEL;
        else if (dist < 300) biome = BIOMES.HIGH_CITY;
        else if (dist < 600) biome = BIOMES.SUBURBS;
        else if (dist < 1000) biome = BIOMES.FARMLAND;

        const roadVal = Math.abs(this.noises.roads.perlin((gx+dX)*0.015, (gy+dY)*0.015));
        const isRoad = roadVal < 0.035 && dist > 25;
        if (isRoad) biome = BIOMES.ROAD;

        // 3. Структурная логика
        let structure = null, deco = null, npc = null, isPath = false;
        const h = Math.abs(gx * 31 + gy * 7) % 100;

        if (!isRoad) {
            if (biome.id === 'citadel' && gx % 30 === 0 && gy % 30 === 0) structure = `n_${h%5}`;
            else if (biome.id === 'high_city' && gx % 20 === 0 && gy % 20 === 0) structure = (h>60)?`t_${h%10}`:`n_${h%5}`;
            else if (biome.id === 'suburbs' && gx % 16 === 0 && gy % 16 === 0) structure = (h>80)?`t_${h%10}`:`v_${h%10}`;
            else if (biome.id === 'farmland' && gx % 24 === 0 && gy % 24 === 0) structure = `v_${h%10}`;

            // Тропинки вокруг домов
            if (structure) { /* Зарезервировано */ }
            else {
                const objVal = (this.noises.objects.perlin(gx*0.4, gy*0.4) + 1)/2;
                if (biome.id === 'wild' && objVal > 0.9) deco = 'nature_oak';
                if (biome.id === 'farmland' && objVal > 0.7) deco = 'nature_wheat';
                if (objVal < 0.02 && dist > 300) npc = h > 50 ? 'cow' : 'sheep';
            }
        }

        return { biome, isRoad, structure, deco, npc };
    }
}
