
export const CONFIG = {
    TILE_SIZE: 32,
    CHUNK_SIZE: 16,
    WORLD_SIZE: 1000000,
    SEA_LEVEL: 0.25,
    LAYERS: {
        FLOOR: 0,
        SHADOWS: 1,
        WORLD_OBJECTS: 2, // Игрок + Объекты (Y-Sorted)
        ROOFS: 3,
        UI_OVERLAY: 4
    }
};

export const BIOMES = {
    DEEP_OCEAN: { id: 'deep_ocean', color: 0x0a1931, accent: 0x001233, name: 'Бездна' },
    OCEAN: { id: 'ocean', color: 0x185adb, accent: 0x0a1931, name: 'Океан' },
    REEF: { id: 'reef', color: 0x00d2ff, accent: 0x3a7bd5, name: 'Рифы' },
    BEACH: { id: 'beach', color: 0xffcc80, accent: 0xff9800, name: 'Пляж' },
    DESERT: { id: 'desert', color: 0xedc9af, accent: 0xd2b48c, name: 'Пустыня' },
    SAVANNA: { id: 'savanna', color: 0xc4a484, accent: 0x8b4513, name: 'Саванна' },
    WASTELAND: { id: 'wasteland', color: 0x6d4c41, accent: 0x3e2723, name: 'Пустошь' },
    PLAINS: { id: 'plains', color: 0x7cb342, accent: 0x558b2f, name: 'Равнины' },
    FOREST: { id: 'forest', color: 0x2e7d32, accent: 0x1b5e20, name: 'Лес' },
    JUNGLE: { id: 'jungle', color: 0x004d40, accent: 0x00241a, name: 'Джунгли' },
    TAIGA: { id: 'taiga', color: 0x455a64, accent: 0x263238, name: 'Тайга' },
    TUNDRA: { id: 'tundra', color: 0x90a4ae, accent: 0x546e7a, name: 'Тундра' },
    SNOW: { id: 'snow', color: 0xe3f2fd, accent: 0xbbdefb, name: 'Ледники' },
    MOUNTAINS: { id: 'mountains', color: 0x424242, accent: 0x212121, name: 'Горы' },
    PEAKS: { id: 'peaks', color: 0xffffff, accent: 0xb0bec5, name: 'Пики' },
    VILLAGE: { id: 'village', color: 0x5d4037, accent: 0xffeb3b, name: 'Поселение' },
    ROAD: { id: 'road', color: 0x3e2723, accent: 0x5d4037, name: 'Тропа' }
};

export const RACES = {
    HUMAN: { name: 'Человек', color: '#ffffff', stats: { str: 5, dex: 5, int: 5, tec: 5 } },
    DWARVEN: { name: 'Дворф', color: '#ffa726', stats: { str: 8, dex: 2, int: 4, tec: 6 } },
    ELVEN: { name: 'Эльф', color: '#66bb6a', stats: { str: 3, dex: 8, int: 7, tec: 2 } },
    ORCISH: { name: 'Орк', color: '#ef5350', stats: { str: 9, dex: 4, int: 2, tec: 5 } }
};
