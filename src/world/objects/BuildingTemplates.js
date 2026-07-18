
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

        draw('wall_stone_dark', g => {
            g.beginFill(0x424242).drawRect(0, 0, s, s);
            g.beginFill(0x212121).drawRect(0, s-4, s, 4).drawRect(0,0,2,32);
        });
        
        draw('roof_slate_dark', g => {
            g.beginFill(0x263238).drawRect(0, 0, s, s);
            g.beginFill(0x37474f).drawRect(0, 0, s, 4);
            g.lineStyle(1, 0x1a1a1a).moveTo(0,16).lineTo(32,16);
        });

        draw('floor_royal', g => {
            g.beginFill(0x5d4037).drawRect(0, 0, s, s);
            g.beginFill(0xffeb3b, 0.1).drawRect(0, 0, s, 1).drawRect(0, 0, 1, s);
        });

        return tex;
    }

    static getHouseSchema(type) {
        const schemas = {
            'alchemist_shop': [
                // Floor 4x4
                {x:0,y:0,l:'f',t:'floor_royal'}, {x:1,y:0,l:'f',t:'floor_royal'}, {x:2,y:0,l:'f',t:'floor_royal'}, {x:3,y:0,l:'f',t:'floor_royal'},
                {x:0,y:1,l:'f',t:'floor_royal'}, {x:1,y:1,l:'f',t:'floor_royal'}, {x:2,y:1,l:'f',t:'floor_royal'}, {x:3,y:1,l:'f',t:'floor_royal'},
                {x:0,y:2,l:'f',t:'floor_royal'}, {x:1,y:2,l:'f',t:'floor_royal'}, {x:2,y:2,l:'f',t:'floor_royal'}, {x:3,y:2,l:'f',t:'floor_royal'},
                {x:0,y:3,l:'f',t:'floor_royal'}, {x:1,y:3,l:'f',t:'floor_royal'}, {x:2,y:3,l:'f',t:'floor_royal'}, {x:3,y:3,l:'f',t:'floor_royal'},
                // Walls
                {x:0,y:0,l:'w',t:'wall_stone_dark'}, {x:1,y:0,l:'w',t:'wall_stone_dark'}, {x:2,y:0,l:'w',t:'wall_stone_dark'}, {x:3,y:0,l:'w',t:'wall_stone_dark'},
                // Interior
                {x:0,y:1,l:'d',t:'int_bookshelf'}, {x:3,y:1,l:'d',t:'int_alchemy_table'},
                {x:1,y:1,l:'d',t:'int_carpet_red'}, {x:2,y:1,l:'d',t:'int_carpet_red'},
                // Roof
                {x:0,y:0,l:'r',t:'roof_slate_dark'}, {x:1,y:0,l:'r',t:'roof_slate_dark'}, {x:2,y:0,l:'r',t:'roof_slate_dark'}, {x:3,y:0,l:'r',t:'roof_slate_dark'},
                {x:0,y:1,l:'r',t:'roof_slate_dark'}, {x:1,y:1,l:'r',t:'roof_slate_dark'}, {x:2,y:1,l:'r',t:'roof_slate_dark'}, {x:3,y:1,l:'r',t:'roof_slate_dark'},
                {x:0,y:2,l:'r',t:'roof_slate_dark'}, {x:1,y:2,l:'r',t:'roof_slate_dark'}, {x:2,y:2,l:'r',t:'roof_slate_dark'}, {x:3,y:2,l:'r',t:'roof_slate_dark'}
            ],
            'town_hall': [
                // Massive 6x6 Structure
                {x:0,y:0,l:'f',t:'floor_royal'}, {x:5,y:5,l:'f',t:'floor_royal'}, // ... (упрощенно для примера, заполняем через цикл в коде ниже)
                {x:0,y:0,l:'w',t:'wall_stone_dark'}, {x:5,y:0,l:'w',t:'wall_stone_dark'},
                {x:2,y:0,l:'d',t:'int_fireplace', anim: true},
                {x:1,y:0,l:'r',t:'roof_slate_dark'}, {x:2,y:0,l:'r',t:'roof_slate_dark'}, {x:3,y:0,l:'r',t:'roof_slate_dark'}, {x:4,y:0,l:'r',t:'roof_slate_dark'}
            ]
        };
        
        // Автоматическое заполнение пола для больших зданий
        if(type === 'town_hall' && schemas[type].length < 10) {
            for(let ix=0; ix<6; ix++) {
                for(let iy=0; iy<6; iy++) {
                    schemas[type].push({x:ix, y:iy, l:'f', t:'floor_royal'});
                    if(iy === 0) schemas[type].push({x:ix, y:iy, l:'w', t:'wall_stone_dark'});
                    if(iy < 5) schemas[type].push({x:ix, y:iy, l:'r', t:'roof_slate_dark'});
                }
            }
        }

        return schemas[type] || schemas.alchemist_shop;
    }
}
