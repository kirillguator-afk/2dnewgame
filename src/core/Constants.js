
export const CONFIG = {
    TILE_SIZE: 32,
    CHUNK_SIZE: 16,
    WORLD_SIZE: 1000000,
    VILLAGE_RADIUS: 5,
    LAYERS: {
        FLOOR: 0,
        SHADOWS: 1,
        WORLD_OBJECTS: 2, 
        ROOFS: 3,
        VFX: 4,
        UI_OVERLAY: 5
    }
};

export const BIOMES = {
    OCEAN: { id: 'ocean', color: 0x1e3799, accent: 0x4834d4, name: 'Великий Океан' },
    BEACH: { id: 'beach', color: 0xf6e58d, accent: 0xf9ca24, name: 'Золотые Пески' },
    FOREST: { id: 'forest', color: 0x27ae60, accent: 0x2ecc71, name: 'Изумрудная Чаща' },
    WASTELAND: { id: 'wasteland', color: 0xe67e22, accent: 0xd35400, name: 'Ржавая Пустошь' },
    MOUNTAINS: { id: 'mountains', color: 0x95a5a6, accent: 0x7f8c8d, name: 'Стальные Пики' },
    SNOW: { id: 'snow', color: 0xffffff, accent: 0xdff9fb, name: 'Ледяное Безмолвие' },
    SWAMP: { id: 'swamp', color: 0x1e272e, accent: 0x05c46b, name: 'Гиблое Болото' },
    VILLAGE: { id: 'village', color: 0x4b4b4b, accent: 0xffdd59, name: 'Древнее Поселение' }
};

export const RACES = {
    HUMAN: { name: 'Человек', color: '#dcdde1', stats: { str: 5, dex: 5, int: 5, tec: 5 } },
    DWARVEN: { name: 'Дворф', color: '#e67e22', stats: { str: 7, dex: 3, int: 4, tec: 6 } },
    ELVEN: { name: 'Эльф', color: '#2ecc71', stats: { str: 3, dex: 8, int: 6, tec: 3 } },
    ORCISH: { name: 'Орк', color: '#c0392b', stats: { str: 8, dex: 5, int: 2, tec: 5 } }
};
