
export const CONFIG = {
    TILE_SIZE: 32,
    CHUNK_SIZE: 16,
    WORLD_SIZE: 1000000,
    MAX_RPM: 2048,
    BASE_FRICTION: 0.01,
    LAYERS: {
        BACKGROUND: 0,
        FLOOR: 1,
        MACHINES: 2,
        PLAYER: 3,
        UI: 4
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
