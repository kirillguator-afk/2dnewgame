
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

        // Текстуры материалов (Улучшенные)
        draw('wall_stone_brick', g => {
            g.beginFill(0x4a4e52).drawRect(0, 0, s, s);
            g.beginFill(0x2f3542, 0.4).drawRect(2, 2, 12, 6).drawRect(18, 10, 12, 6).drawRect(4, 20, 24, 8);
            g.lineStyle(1, 0x000000, 0.2).drawRect(0,0,s,s);
        });
        
        draw('wall_wood_dark', g => {
            g.beginFill(0x3e2723).drawRect(0, 0, s, s);
            g.beginFill(0x5d4037).drawRect(4, 0, 4, s).drawRect(24, 0, 4, s); // Вертикальные балки
        });

        draw('roof_slate_gold', g => {
            g.beginFill(0x2f3640).drawRect(0, 0, s, s);
            g.beginFill(0xf1c40f, 0.2).drawPolygon([0,0, 32,0, 16,16]); // Позолота
            g.lineStyle(1, 0x1e272e).moveTo(0,16).lineTo(32,16);
        });

        draw('floor_marble', g => {
            g.beginFill(0xd1d8e0).drawRect(0, 0, s, s);
            g.beginFill(0xa5b1c2, 0.3).drawRect(0, 0, 16, 16).drawRect(16, 16, 16, 16);
        });

        return tex;
    }

    static getHouseSchema(type) {
        const h = {
            'cathedral': [], // 8x8
            'town_hall': [],  // 6x6
            'tavern': []      // 4x4
        };

        // Собор (8x8) - Эпическое здание
        for(let x=0; x<8; x++) {
            for(let y=0; y<8; y++) {
                h.cathedral.push({x, y, l:'f', t:'floor_marble'});
                if(y === 0 || (x === 0 && y < 7) || (x === 7 && y < 7)) h.cathedral.push({x, y, l:'w', t:'wall_stone_brick'});
                if(y < 7) h.cathedral.push({x, y, l:'r', t:'roof_slate_gold'});
            }
        }
        h.cathedral.push({x:3, y:1, l:'d', t:'int_fireplace', anim:true}, {x:4, y:1, l:'d', t:'int_fireplace', anim:true});
        h.cathedral.push({x:1, y:3, l:'d', t:'int_carpet_red'}, {x:2, y:3, l:'d', t:'int_carpet_red'}, {x:5, y:3, l:'d', t:'int_carpet_red'});

        // Ратуша (6x6)
        for(let x=0; x<6; x++) {
            for(let y=0; y<6; y++) {
                h.town_hall.push({x, y, l:'f', t:'floor_royal'});
                if(y === 0) h.town_hall.push({x, y, l:'w', t:'wall_stone_dark'});
                if(y < 5) h.town_hall.push({x, y, l:'r', t:'roof_slate_dark'});
            }
        }
        h.town_hall.push({x:1, y:1, l:'d', t:'int_bookshelf'}, {x:4, y:1, l:'d', t:'int_bookshelf'});

        // Таверна (4x4)
        for(let x=0; x<4; x++) {
            for(let y=0; y<4; y++) {
                h.tavern.push({x, y, l:'f', t:'floor_planks'});
                if(y === 0) h.tavern.push({x, y, l:'w', t:'wall_wood'});
                if(y < 3) h.tavern.push({x, y, l:'r', t:'roof_tile_red'});
            }
        }
        h.tavern.push({x:1, y:1, l:'d', t:'tavern_bar_counter'}, {x:2, y:2, l:'d', t:'tavern_table'});

        return h[type] || h.tavern;
    }
}
