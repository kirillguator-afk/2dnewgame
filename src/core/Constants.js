
export const CONFIG = {
    TILE_SIZE: 32,
    CHUNK_SIZE: 16,
    WORLD_SIZE: 1000000,
    LAYERS: {
        BACKGROUND: 0,
        FLOOR: 1,
        DECOR: 2,
        MACHINES: 3,
        PLAYER: 4,
        VFX: 5,
        UI: 6
    }
};

export const BIOMES = {
    FOREST: { 
        id: 'forest', 
        color: 0x3d550c, // Глубокий зеленый
        accent: 0x81b622, 
        name: 'Great Forest', 
        ambient: 0x1a2e05
    },
    WASTELAND: { 
        id: 'wasteland', 
        color: 0x7a6652, // Землистый
        accent: 0xaf9164, 
        name: 'Old Wasteland', 
        ambient: 0x3d3022
    },
    MOUNTAINS: { 
        id: 'mountains', 
        color: 0x4a4a4a, // Серый камень
        accent: 0x7a7a7a, 
        name: 'Iron Peaks', 
        ambient: 0x1a1a1a
    },
    SWAMP: { 
        id: 'swamp', 
        color: 0x2d3436, // Гнилой/темный
        accent: 0x00b894, 
        name: 'Murky Waters', 
        ambient: 0x0d1111
    }
};

export const ENTITY_TYPES = {
    SHAFT: 'shaft',
    GEAR: 'gear',
    MOTOR: 'engine' // Переименовано из motor в engine для RPG стиля
};

export const RACES = {
    HUMAN: { name: 'Human', description: 'Kingdom citizens.', color: '#dcdde1', stats: { str: 5, dex: 5, int: 5, tec: 5 } },
    DWARVEN: { name: 'Dwarf', description: 'Master engineers.', color: '#e67e22', stats: { str: 7, dex: 3, int: 4, tec: 6 } },
    ELVEN: { name: 'Elf', description: 'Swift observers.', color: '#2ecc71', stats: { str: 3, dex: 8, int: 6, tec: 3 } },
    ORCISH: { name: 'Orc', description: 'Strong survivors.', color: '#c0392b', stats: { str: 8, dex: 5, int: 2, tec: 5 } }
};
