
export class BuildingTemplates {
    static getTemplates(app) {
        const tex = {};
        const g = new PIXI.Graphics();
        const s = 32;

        const draw = (name, fn) => {
            g.clear();
            fn(g);
            tex[name] = app.renderer.generateTexture(g);
        };

        draw('wall_wood', g => g.beginFill(0x5d4037).drawRect(0, 0, s, s).beginFill(0x3e2723).drawRect(0, s-4, s, 4));
        draw('wall_stone', g => g.beginFill(0x757575).drawRect(0, 0, s, s).beginFill(0x424242).drawRect(2, 2, 28, 2));
        draw('roof_tile_red', g => g.beginFill(0xb71c1c).drawRect(0, 0, s, s).beginFill(0x7f0000).drawRect(0, 14, s, 4));
        draw('floor_planks', g => g.beginFill(0x8d6e63).drawRect(0, 0, s, s).beginFill(0x6d4c41).drawRect(0, 0, s, 2));

        return tex;
    }

    static getHouseSchema(type) {
        const h = {
            'hut': [ // 2x2
                {x:0, y:0, l:'f', t:'floor_planks'}, {x:1, y:0, l:'f', t:'floor_planks'},
                {x:0, y:1, l:'f', t:'floor_planks'}, {x:1, y:1, l:'f', t:'floor_planks'},
                {x:0, y:0, l:'w', t:'wall_wood'}, {x:1, y:0, l:'w', t:'wall_wood'},
                {x:0, y:0, l:'r', t:'roof_tile_red'}, {x:1, y:0, l:'r', t:'roof_tile_red'}, {x:0, y:1, l:'r', t:'roof_tile_red'}, {x:1, y:1, l:'r', t:'roof_tile_red'}
            ],
            'tavern': [ // 4x4
                {x:0, y:0, l:'f', t:'floor_planks'}, {x:3, y:3, l:'f', t:'floor_planks'}, // ... fill loop in manager
                {x:0, y:0, l:'w', t:'wall_stone'}, {x:3, y:0, l:'w', t:'wall_stone'},
                {x:1, y:1, l:'d', t:'village_stall'} // Counter
            ]
        };
        // Auto-fill tavern floors
        if (type === 'tavern' && h.tavern.length < 10) {
            for(let ix=0; ix<4; ix++) {
                for(let iy=0; iy<4; iy++) {
                    h.tavern.push({x:ix, y:iy, l:'f', t:'floor_planks'});
                    if(iy === 0) h.tavern.push({x:ix, y:iy, l:'w', t:'wall_stone'});
                    if(iy < 3) h.tavern.push({x:ix, y:iy, l:'r', t:'roof_tile_red'});
                }
            }
        }
        return h[type] || h.hut;
    }
}
