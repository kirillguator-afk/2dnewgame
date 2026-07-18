
export const CONFIG = {
    TILE_SIZE: 32,
    CHUNK_SIZE: 16,
    WORLD_SIZE: 1000000,
    VILLAGE_RADIUS: 5,
    // Порядок слоев в PIXI stage
    LAYERS: {
        FLOOR: 0,           // Земля
        SHADOWS: 1,         // Тени
        WORLD_OBJECTS: 2,   // Игрок, Деревья, Здания (Y-Sorted)
        ROOFS: 3,           // Крыши (прозрачные)
        UI_OVERLAY: 4       // HUD
    }
};

export const BIOMES = {
    OCEAN: { id: 'ocean', color: 0x0a3d62, accent: 0x3c6382, name: 'Океан' },
    BEACH: { id: 'beach', color: 0xf6b93b, accent: 0xfa983a, name: 'Побережье' },
    FOREST: { id: 'forest', color: 0x38ada9, accent: 0x079992, name: 'Лес' },
    WASTELAND: { id: 'wasteland', color: 0x825a2c, accent: 0x5d4037, name: 'Пустошь' },
    MOUNTAINS: { id: 'mountains', color: 0x60a3bc, accent: 0x3c6382, name: 'Горы' },
    SNOW: { id: 'snow', color: 0xf1f2f6, accent: 0xd1d8e0, name: 'Снега' },
    SWAMP: { id: 'swamp', color: 0x1e370a, accent: 0x3d5a27, name: 'Болото' },
    VILLAGE: { id: 'village', color: 0x4b4b4b, accent: 0x2f3542, name: 'Поселение' }
};

export const RACES = {
    HUMAN: { name: 'Человек', color: '#ffffff', stats: { str: 5, dex: 5, int: 5, tec: 5 } },
    DWARVEN: { name: 'Дворф', color: '#e67e22', stats: { str: 8, dex: 2, int: 4, tec: 6 } },
    ELVEN: { name: 'Эльф', color: '#2ecc71', stats: { str: 3, dex: 8, int: 6, tec: 3 } },
    ORCISH: { name: 'Орк', color: '#c0392b', stats: { str: 9, dex: 4, int: 2, tec: 5 } }
};
