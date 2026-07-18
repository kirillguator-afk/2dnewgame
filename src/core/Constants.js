
export const CONFIG = {
    TILE_SIZE: 32,
    CHUNK_SIZE: 16,
    WORLD_SIZE: 1000000,
    SEA_LEVEL: 0.25,
    LAYERS: {
        FLOOR: 0,
        SHADOWS: 1,
        WORLD_OBJECTS: 2, 
        ROOFS: 3,
        UI_OVERLAY: 4
    }
};

export const BIOMES = {
    OCEAN: { id: 'ocean', color: 0x0a3d62, accent: 0x0c4b73, name: 'Океан' },
    BEACH: { id: 'beach', color: 0xeccc68, accent: 0xff7f50, name: 'Пляж' },
    FOREST: { id: 'forest', color: 0x2f361c, accent: 0x1e270e, name: 'Лес' },
    PLAINS: { id: 'plains', color: 0x556b2f, accent: 0x6b8e23, name: 'Равнины' },
    FARMLAND: { id: 'farmland', color: 0x8b4513, accent: 0x5d4037, name: 'Фермерские угодья' },
    VILLAGE: { id: 'village', color: 0x4a4e52, accent: 0x2f3542, name: 'Поселение' },
    ROAD: { id: 'road', color: 0x3d3126, accent: 0x2d1b0d, name: 'Тракт' }
};

export const RACES = {
    HUMAN: { name: 'Человек', color: '#ffffff', stats: { str: 5, dex: 5, int: 5, tec: 5 } },
    DWARVEN: { name: 'Дворф', color: '#ffa726', stats: { str: 8, dex: 2, int: 4, tec: 6 } },
    ELVEN: { name: 'Эльф', color: '#66bb6a', stats: { str: 3, dex: 8, int: 7, tec: 2 } },
    ORCISH: { name: 'Орк', color: '#ef5350', stats: { str: 9, dex: 4, int: 2, tec: 5 } }
};
