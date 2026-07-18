
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

        // Материалы Цитадели
        draw('wall_citadel', g => {
            g.beginFill(0xd1d8e0).drawRect(0, 0, s, s);
            g.beginFill(0xa5b1c2).drawRect(0, s-6, s, 6);
            g.beginFill(0xf1c40f, 0.3).drawRect(4, 4, 24, 2); // Золотая кайма
        });

        draw('roof_citadel', g => {
            g.beginFill(0x2f3640).drawRect(0, 0, s, s);
            g.beginFill(0x1e272e).drawPolygon([0,0, s,0, s/2,s/2]);
        });

        // Материалы Города
        draw('wall_stone_dark', g => {
            g.beginFill(0x4b4b4b).drawRect(0, 0, s, s);
            g.beginFill(0x2d3436).drawRect(2, 2, 28, 4);
        });

        draw('floor_citadel_marble', g => {
            g.beginFill(0xffffff).drawRect(0, 0, s, s);
            g.beginFill(0xd1d8e0, 0.5).drawRect(1, 1, 30, 30);
        });

        return tex;
    }

    static getHouseSchema(type) {
        const h = {
            'castle_keep': [],    // 10x10
            'noble_house': [],    // 6x6
            'city_shop': [],      // 4x4
            'fort_wall': []       // Модуль стены
        };

        // ЦИТАДЕЛЬ (10x10)
        for(let x=0; x<10; x++) {
            for(let y=0; y<10; y++) {
                h.castle_keep.push({x, y, l:'f', t:'floor_citadel_marble'});
                if(y === 0 || x === 0 || x === 9) h.castle_keep.push({x, y, l:'w', t:'wall_citadel'});
                if(y < 9) h.castle_keep.push({x, y, l:'r', t:'roof_citadel'});
            }
        }
        h.castle_keep.push({x:5, y:1, l:'d', t:'int_throne'});
        h.castle_keep.push({x:2, y:2, l:'d', t:'castle_torch'}, {x:7, y:2, l:'d', t:'castle_torch'});

        // МОДУЛЬ СТЕНЫ (4x1)
        for(let x=0; x<4; x++) {
            h.fort_wall.push({x, y:0, l:'w', t:'wall_stone_dark'});
            h.fort_wall.push({x, y:0, l:'r', t:'wall_stone_dark'}); // Плоская крыша-зубец
        }

        // КУПЕЧЕСКИЙ ДОМ (4x4)
        for(let x=0; x<4; x++) {
            for(let y=0; y<4; y++) {
                h.city_shop.push({x, y, l:'f', t:'floor_planks'});
                if(y === 0) h.city_shop.push({x, y, l:'w', t:'wall_timber'});
                if(y < 3) h.city_shop.push({x, y, l:'r', t:'roof_tile_red'});
            }
        }
        h.city_shop.push({x:1, y:1, l:'d', t:'market_stall'});

        return h[type] || h.city_shop;
    }
}
