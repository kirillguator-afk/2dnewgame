
export const CONFIG = {
    TILE_SIZE: 32,
    CHUNK_SIZE: 16,
    WORLD_SIZE: 1000000,
    MAX_RPM: 2048,
    BASE_FRICTION: 0.01,
    LAYERS: {
        BACKGROUND: 0,
        FLOOR: 1,
        DECOR: 2,
        MACHINES: 3,
        LIGHTING: 4, // Слой для света
        PLAYER: 5,
        VFX: 6,      // Слой частиц
        UI: 7
    }
};

export const BIOMES = {
    NEON_RUINS: { 
        id: 'ruins', 
        color: 0x1a1a1c, 
        accent: 0x00f2ff, 
        name: 'Neon Ruins', 
        ambient: 0x050505,
        vfx: 'sparks'
    },
    TOXIC_SWAMP: { 
        id: 'swamp', 
        color: 0x0d1a0d, 
        accent: 0x33ff33, 
        name: 'Toxic Swamp', 
        ambient: 0x0a140a,
        vfx: 'bubbles'
    },
    MAGNETIC_DESERT: { 
        id: 'desert', 
        color: 0x1a0d1a, 
        accent: 0xff00ff, 
        name: 'Magnetic Desert', 
        ambient: 0x140514,
        vfx: 'dust'
    },
    BASALT_PEAKS: { 
        id: 'peaks', 
        color: 0x0a0a0a, 
        accent: 0x777777, 
        name: 'Basalt Peaks', 
        ambient: 0x000000,
        vfx: 'smoke'
    }
};

export const ENTITY_TYPES = {
    SHAFT: 'shaft',
    GEAR: 'gear',
    MOTOR: 'motor'
};

export const RACES = {
    HUMAN: { name: 'Human', description: 'Balanced and versatile.', color: '#ffffff', stats: { str: 5, dex: 5, int: 5, tec: 5 } },
    ANDROID: { name: 'Android', description: 'High technical skills, low strength.', color: '#00f2ff', stats: { str: 3, dex: 4, int: 6, tec: 7 } },
    CYBORG: { name: 'Cyborg', description: 'Enhanced strength and agility.', color: '#ff00ff', stats: { str: 7, dex: 6, int: 4, tec: 3 } },
    RECLAIMER: { name: 'Reclaimer', description: 'Tough survivors of the waste.', color: '#ffaa00', stats: { str: 6, dex: 7, int: 3, tec: 4 } }
};
