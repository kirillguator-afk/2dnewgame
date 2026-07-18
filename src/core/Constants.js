
export const CONFIG = {
    TILE_SIZE: 32,
    CHUNK_SIZE: 16,
    WORLD_SIZE: 1000000,
    VILLAGE_RADIUS: 5,
    LAYERS: {
        FLOOR: 0,
        STRUCTURE_BASE: 1,
        DECOR: 2,
        PLAYER: 3,
        STRUCTURE_ROOF: 4,
        ATMOSPHERE: 5, // Слой для тумана и теней облаков
        VFX: 6,
        UI: 7
    }
};

export const BIOMES = {
    FOREST: { id: 'forest', color: 0x2d5a27, accent: 0x2ecc71, name: 'Great Forest', fogColor: 0x2ecc71 },
    WASTELAND: { id: 'wasteland', color: 0x7f4f24, accent: 0xe67e22, name: 'Old Wasteland', fogColor: 0xaf9164 },
    MOUNTAINS: { id: 'mountains', color: 0x636e72, accent: 0xbdc3c7, name: 'Iron Peaks', fogColor: 0x95a5a6 },
    SWAMP: { id: 'swamp', color: 0x1e272e, accent: 0x16a085, name: 'Murky Waters', fogColor: 0x00b894 },
    VILLAGE: { id: 'village', color: 0x57606f, accent: 0xf1c40f, name: 'Highland Outpost', fogColor: 0xffffff }
};

export const RACES = {
    HUMAN: { name: 'Human', color: '#dcdde1', stats: { str: 5, dex: 5, int: 5, tec: 5 } },
    DWARVEN: { name: 'Dwarf', color: '#e67e22', stats: { str: 7, dex: 3, int: 4, tec: 6 } },
    ELVEN: { name: 'Elf', color: '#2ecc71', stats: { str: 3, dex: 8, int: 6, tec: 3 } },
    ORCISH: { name: 'Orc', color: '#c0392b', stats: { str: 8, dex: 5, int: 2, tec: 5 } }
};
