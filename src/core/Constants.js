
export const CONFIG = {
    TILE_SIZE: 32,
    CHUNK_SIZE: 16,
    WORLD_SIZE: 1000000,
    KINGDOM_CENTER: 500000,
    LAYERS: {
        FLOOR: 0,
        STRUCTURE_BASE: 1,
        DECOR: 2,
        PLAYER: 3,
        STRUCTURE_ROOF: 4,
        VFX: 5,
        UI_OVERLAY: 6
    }
};

export const BIOMES = {
    CITADEL: { id: 'citadel', color: 0xecf0f1, accent: 0xf1c40f, name: 'Цитадель' },
    HIGH_CITY: { id: 'high_city', color: 0x95a5a6, accent: 0x7f8c8d, name: 'Верхний Город' },
    SUBURBS: { id: 'suburbs', color: 0x7f8c8d, accent: 0x2c3e50, name: 'Предместья' },
    FARMLAND: { id: 'farmland', color: 0x8b4513, accent: 0x5d4037, name: 'Угодья' },
    WILDERNESS: { id: 'wild', color: 0x27ae60, accent: 0x1e3a1a, name: 'Дикие Земли' },
    ROAD: { id: 'road', color: 0x34495e, accent: 0x2c3e50, name: 'Королевский Тракт' }
};

export const RACES = {
    HUMAN: { name: 'Человек', color: '#ffffff', stats: { str: 5, dex: 5, int: 5, tec: 5 } },
    DWARVEN: { name: 'Дворф', color: '#ffa726', stats: { str: 8, dex: 2, int: 4, tec: 6 } },
    ELVEN: { name: 'Эльф', color: '#66bb6a', stats: { str: 3, dex: 8, int: 7, tec: 2 } },
    ORCISH: { name: 'Орк', color: '#ef5350', stats: { str: 9, dex: 4, int: 2, tec: 5 } }
};
