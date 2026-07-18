
export const CONFIG = {
    TILE_SIZE: 32,
    CHUNK_SIZE: 16,
    WORLD_SIZE: 1000000,
    VILLAGE_RADIUS: 5,
    // Порядок слоев (Z-Index в PIXI stage)
    LAYERS: {
        FLOOR: 0,
        SHADOWS: 1,
        WORLD_OBJECTS: 2, // Здесь игрок и деревья (Y-Sorted)
        ROOFS: 3,
        ATMOSPHERE: 4,
        UI_OVERLAY: 5
    }
};

export const BIOMES = {
    FOREST: { id: 'forest', color: 0x243a1f, accent: 0x3d5a27, name: 'Мглистый Лес' },
    WASTELAND: { id: 'wasteland', color: 0x4a3d30, accent: 0x5d4037, name: 'Пустошь' },
    MOUNTAINS: { id: 'mountains', color: 0x3d3d3d, accent: 0x2c3e50, name: 'Горы' },
    SWAMP: { id: 'swamp', color: 0x1a1f1a, accent: 0x16a085, name: 'Топь' },
    VILLAGE: { id: 'village', color: 0x2f3542, accent: 0xf1c40f, name: 'Поселение' }
};

export const RACES = {
    HUMAN: { name: 'Человек', color: '#dcdde1', stats: { str: 5, dex: 5, int: 5, tec: 5 } },
    DWARVEN: { name: 'Дворф', color: '#e67e22', stats: { str: 7, dex: 3, int: 4, tec: 6 } },
    ELVEN: { name: 'Эльф', color: '#2ecc71', stats: { str: 3, dex: 8, int: 6, tec: 3 } },
    ORCISH: { name: 'Орк', color: '#c0392b', stats: { str: 8, dex: 5, int: 2, tec: 5 } }
};
