
export const CONFIG = {
    TILE_SIZE: 32,
    CHUNK_SIZE: 16,
    WORLD_SIZE: 1000000,
    KINGDOM_CENTER: 500000,
    LAYERS: {
        FLOOR: 0,           // Земля, трава
        PATHWAYS: 1,        // Тропинки, дороги
        SHADOWS: 2,         // Тени
        WORLD_OBJECTS: 3,   // Игрок, NPC, Деревья, Здания (Y-Sorted)
        STRUCTURE_ROOF: 4,  // Крыши
        UI_OVERLAY: 5       // HUD
    }
};

export const BIOMES = {
    CITADEL: { id: 'citadel', color: 0xd1d8e0, accent: 0xa5b1c2, name: 'Цитадель' },
    VILLAGE: { id: 'village', color: 0x588157, accent: 0x3a5a40, name: 'Поселение' },
    FARMLAND: { id: 'farmland', color: 0x8b4513, accent: 0x5d4037, name: 'Пашни' },
    FOREST: { id: 'forest', color: 0x1b2e1a, accent: 0x0d1a0d, name: 'Дремучий Лес' },
    WILDERNESS: { id: 'wild', color: 0x344e41, accent: 0x3d5a80, name: 'Дикие Земли' },
    ROAD: { id: 'road', color: 0x3d3126, accent: 0x2d1b0d, name: 'Тракт' },
    DIRT_PATH: { id: 'path', color: 0x5d4037, accent: 0x3e2723, name: 'Тропа' }
};

export const RACES = {
    HUMAN: { id: 'HUMAN', name: 'Человек', color: '#ffffff', stats: { str: 5, dex: 5, int: 5, tec: 5 } },
    DWARVEN: { id: 'DWARVEN', name: 'Дворф', color: '#ffa726', stats: { str: 8, dex: 2, int: 4, tec: 6 } },
    ELVEN: { id: 'ELVEN', name: 'Эльф', color: '#66bb6a', stats: { str: 3, dex: 8, int: 7, tec: 2 } },
    ORCISH: { id: 'ORCISH', name: 'Орк', color: '#ef5350', stats: { str: 9, dex: 4, int: 2, tec: 5 } }
};
