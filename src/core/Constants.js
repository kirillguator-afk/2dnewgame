
export const CONFIG = {
    TILE_SIZE: 32,
    CHUNK_SIZE: 16,
    WORLD_SIZE: 1000000,
    VILLAGE_RADIUS: 150,
    SEA_LEVEL: 0.28,
    LAYERS: {
        FLOOR: 0,           // Земля, песок, вода
        SHADOWS: 1,         // Тени под всеми объектами
        WORLD_OBJECTS: 2,   // Игрок, NPC, Деревья, Мебель (Y-Sorted)
        STRUCTURE_ROOF: 3,  // Крыши домов (Alpha-faded)
        UI_OVERLAY: 4       // HUD
    }
};

export const BIOMES = {
    OCEAN: { id: 'ocean', color: 0x1a3a5a, accent: 0x0a1931, name: 'Океан' },
    BEACH: { id: 'beach', color: 0xd4af37, accent: 0xc49a27, name: 'Пляж' },
    FOREST: { id: 'forest', color: 0x2d4a2d, accent: 0x1e3a1a, name: 'Вековой Лес' },
    PLAINS: { id: 'plains', color: 0x588157, accent: 0x3a5a40, name: 'Равнины' },
    TAIGA: { id: 'taiga', color: 0x3d4147, accent: 0x2c3e50, name: 'Тайга' },
    FARMLAND: { id: 'farmland', color: 0x5d4037, accent: 0x3e2723, name: 'Пашни' },
    VILLAGE: { id: 'village', color: 0x4a4e52, accent: 0x2f3542, name: 'Поселение' },
    ROAD: { id: 'road', color: 0x3d3126, accent: 0x2d1b0d, name: 'Тракт' }
};

export const RACES = {
    HUMAN: { name: 'Человек', color: '#ffffff', stats: { str: 5, dex: 5, int: 5, tec: 5 } },
    DWARVEN: { name: 'Дворф', color: '#ffa726', stats: { str: 8, dex: 2, int: 4, tec: 6 } },
    ELVEN: { name: 'Эльф', color: '#66bb6a', stats: { str: 3, dex: 8, int: 7, tec: 2 } },
    ORCISH: { name: 'Орк', color: '#ef5350', stats: { str: 9, dex: 4, int: 2, tec: 5 } }
};
