
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
        draw('floor_stone', g => g.beginFill(0x616161).drawRect(0, 0, s, s).beginFill(0x424242).drawRect(0, 0, s, 1).drawRect(0, 0, 1, s));

        return tex;
    }

    static getHouseSchema(type) {
        const schemas = {
            'hut': [
                {x:0, y:0, l:'f', t:'floor_planks'}, {x:1, y:0, l:'f', t:'floor_planks'},
                {x:0, y:1, l:'f', t:'floor_planks'}, {x:1, y:1, l:'f', t:'floor_planks'},
                {x:0, y:0, l:'w', t:'wall_wood'}, {x:1, y:0, l:'w', t:'wall_wood'},
                {x:0, y:0, l:'r', t:'roof_tile_red'}, {x:1, y:0, l:'r', t:'roof_tile_red'}, {x:0, y:1, l:'r', t:'roof_tile_red'}, {x:1, y:1, l:'r', t:'roof_tile_red'}
            ],
            'tavern': [
                {x:0, y:0, l:'f', t:'floor_planks'}, {x:1, y:0, l:'f', t:'floor_planks'}, {x:2, y:0, l:'f', t:'floor_planks'},
                {x:0, y:1, l:'f', t:'floor_planks'}, {x:1, y:1, l:'f', t:'floor_planks'}, {x:2, y:1, l:'f', t:'floor_planks'},
                {x:0, y:2, l:'f', t:'floor_planks'}, {x:1, y:2, l:'f', t:'floor_planks'}, {x:2, y:2, l:'f', t:'floor_planks'},
                {x:0, y:0, l:'w', t:'wall_wood'}, {x:1, y:0, l:'w', t:'wall_wood'}, {x:2, y:0, l:'w', t:'wall_wood'},
                {x:0, y:0, l:'r', t:'roof_tile_red'}, {x:1, y:0, l:'r', t:'roof_tile_red'}, {x:2, y:0, l:'r', t:'roof_tile_red'},
                {x:0, y:1, l:'r', t:'roof_tile_red'}, {x:1, y:1, l:'r', t:'roof_tile_red'}, {x:2, y:1, l:'r', t:'roof_tile_red'},
                {x:0, y:2, l:'r', t:'roof_tile_red'}, {x:1, y:2, l:'r', t:'roof_tile_red'}, {x:2, y:2, l:'r', t:'roof_tile_red'},
                {x:1, y:1, l:'d', t:'tavern_table'}
            ],
            'blacksmith': [
                {x:0, y:0, l:'f', t:'floor_stone'}, {x:1, y:0, l:'f', t:'floor_stone'},
                {x:0, y:1, l:'f', t:'floor_stone'}, {x:1, y:1, l:'f', t:'floor_stone'},
                {x:0, y:0, l:'w', t:'wall_stone'}, {x:1, y:0, l:'w', t:'wall_stone'},
                {x:0, y:0, l:'r', t:'roof_tile_red'}, {x:1, y:0, l:'r', t:'roof_tile_red'},
                {x:1, y:1, l:'d', t:'industrial_anvil'}
            ]
        };
        return schemas[type] || schemas.hut;
    }
}
