
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

        draw('wall_wood', g => {
            g.beginFill(0x5d4037).drawRect(0, 0, s, s);
            g.beginFill(0x3e2723).drawRect(0, s-4, s, 4);
            g.beginFill(0x000000, 0.1).drawRect(s-2, 0, 2, s);
        });
        
        draw('roof_main', g => {
            g.beginFill(0x7f0000).drawRect(0, 0, s, s);
            g.beginFill(0xb71c1c).drawRect(0, 0, s, 4).drawRect(0, 14, s, 2);
        });

        draw('floor_tavern', g => {
            g.beginFill(0x4e342e).drawRect(0, 0, s, s);
            g.beginFill(0x3e2723, 0.3).drawRect(0, 0, s, 1).drawRect(0, 0, 1, s);
        });

        return tex;
    }

    static getHouseSchema(type) {
        const schemas = {
            'hut': [
                {x:0, y:0, l:'f', t:'floor_tavern'}, {x:1, y:0, l:'f', t:'floor_tavern'},
                {x:0, y:0, l:'w', t:'wall_wood'}, {x:1, y:0, l:'w', t:'wall_wood'},
                {x:0, y:0, l:'r', t:'roof_main'}, {x:1, y:0, l:'r', t:'roof_main'}
            ],
            'tavern': [
                {x:0, y:0, l:'f', t:'floor_tavern'}, {x:1, y:0, l:'f', t:'floor_tavern'}, {x:2, y:0, l:'f', t:'floor_tavern'},
                {x:0, y:1, l:'f', t:'floor_tavern'}, {x:1, y:1, l:'f', t:'floor_tavern'}, {x:2, y:1, l:'f', t:'floor_tavern'},
                {x:0, y:0, l:'w', t:'wall_wood'}, {x:1, y:0, l:'w', t:'wall_wood'}, {x:2, y:0, l:'w', t:'wall_wood'},
                {x:0, y:0, l:'r', t:'roof_main'}, {x:1, y:0, l:'r', t:'roof_main'}, {x:2, y:0, l:'r', t:'roof_main'},
                {x:0, y:1, l:'d', t:'tavern_bar_counter'}, {x:2, y:1, l:'d', t:'tavern_mug'}
            ]
        };
        return schemas[type] || schemas.hut;
    }
}
