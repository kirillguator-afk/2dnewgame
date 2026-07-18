
export const CONFIG = {
    TILE_SIZE: 32,
    CHUNK_SIZE: 16,
    WORLD_SIZE: 1000000,
    VILLAGE_RADIUS: 150,
    LAYERS: {
        FLOOR: 0,           // Трава, песок, тропы
        FLOOR_DECO: 1,      // Мелкие камушки, травинки
        SHADOWS: 2,         // Тени от всех объектов
        WORLD_OBJECTS: 3,   // Игрок, NPC, Деревья, Стены (Y-Sorted)
        STRUCTURE_ROOF: 4,  // Крыши
        UI_OVERLAY: 5       // Интерфейс
    }
};

export const BIOMES = {
    DEEP_OCEAN: { id: 'deep_ocean', color: 0x0a1931, accent: 0x1e3799, name: 'Бездна' },
    OCEAN: { id: 'ocean', color: 0x1e3799, accent: 0x4834d4, name: 'Океан' },
    BEACH: { id: 'beach', color: 0xf7d794, accent: 0xf3a683, name: 'Пески' },
    FOREST: { id: 'forest', color: 0x1e3a1a, accent: 0x27ae60, name: 'Вековой Лес' },
    TAIGA: { id: 'taiga', color: 0x2d3436, accent: 0x636e72, name: 'Тайга' },
    PLAINS: { id: 'plains', color: 0x588157, accent: 0x3a5a40, name: 'Равнины' },
    FARMLAND: { id: 'farmland', color: 0x3d2b1f, accent: 0x5d4037, name: 'Пашни' },
    VILLAGE: { id: 'village', color: 0x4a4e52, accent: 0x2f3542, name: 'Город' },
    ROAD: { id: 'road', color: 0x3d3126, accent: 0x574b3a, name: 'Тракт' }
};

export const RACES = {
    HUMAN: { name: 'Человек', color: '#ffffff', stats: { str: 5, dex: 5, int: 5, tec: 5 } },
    DWARVEN: { name: 'Дворф', color: '#ffa726', stats: { str: 8, dex: 2, int: 4, tec: 6 } },
    ELVEN: { name: 'Эльф', color: '#66bb6a', stats: { str: 3, dex: 8, int: 7, tec: 2 } },
    ORCISH: { name: 'Орк', color: '#ef5350', stats: { str: 9, dex: 4, int: 2, tec: 5 } }
};
