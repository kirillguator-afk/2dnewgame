
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
