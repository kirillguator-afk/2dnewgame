
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

        // Стены
        draw('wall_timber', g => { // Фахверк
            g.beginFill(0xf5f6fa).drawRect(0, 0, s, s); // Беленая стена
            g.beginFill(0x3e2723).drawRect(0, 0, 4, s).drawRect(28, 0, 4, s); // Балки
            g.beginFill(0x3e2723).drawRect(0, 14, s, 4); // Перекладина
        });
        
        draw('wall_castle', g => { // Замковый камень
            g.beginFill(0x7f8c8d).drawRect(0, 0, s, s);
            g.beginFill(0x2d3436, 0.3).drawRect(2, 2, 12, 8).drawRect(18, 16, 12, 8);
            g.lineStyle(1, 0x000000, 0.1).drawRect(0,0,s,s);
        });

        // Крыши
        draw('roof_thatch', g => { // Солома
            g.beginFill(0xd4af37).drawRect(0, 0, s, s);
            g.lineStyle(1, 0x827127).moveTo(0,4).lineTo(32,4).moveTo(0,16).lineTo(32,16).moveTo(0,28).lineTo(32,28);
        });

        draw('roof_slate_dark', g => { // Шифер/Камень
            g.beginFill(0x2d3436).drawRect(0, 0, s, s);
            g.beginFill(0x1a1a1a).drawRect(0, 0, s, 4);
        });

        // Полы
        draw('floor_castle_stone', g => {
            g.beginFill(0x636e72).drawRect(0, 0, s, s);
            g.lineStyle(1, 0x2d3436, 0.2).drawRect(0, 0, 16, 16).drawRect(16, 16, 16, 16);
        });

        return tex;
    }

    static getHouseSchema(type) {
        const schemas = {
            'peasant_hut': [],   // 3x3
            'blacksmith': [],    // 4x3
            'watchtower': [],    // 2x2, высокая
            'royal_keep': []     // 8x8
        };

        // Сторожевая башня (Камень)
        for(let x=0; x<2; x++) {
            for(let y=0; y<2; y++) {
                schemas.watchtower.push({x, y, l:'f', t:'floor_castle_stone'});
                if(y === 0) schemas.watchtower.push({x, y, l:'w', t:'wall_castle'});
                schemas.watchtower.push({x, y, l:'r', t:'roof_slate_dark'});
            }
        }
        schemas.watchtower.push({x:0, y:1, l:'d', t:'int_weapon_rack'});

        // Крестьянская изба (Фахверк)
        for(let x=0; x<3; x++) {
            for(let y=0; y<3; y++) {
                schemas.peasant_hut.push({x, y, l:'f', t:'floor_planks'});
                if(y === 0) schemas.peasant_hut.push({x, y, l:'w', t:'wall_timber'});
                if(y < 2) schemas.peasant_hut.push({x, y, l:'r', t:'roof_thatch'});
            }
        }
        schemas.peasant_hut.push({x:0, y:1, l:'d', t:'int_bed'}, {x:2, y:1, l:'d', t:'int_fireplace', anim:true});

        // Кузница
        for(let x=0; x<4; x++) {
            for(let y=0; y<3; y++) {
                schemas.blacksmith.push({x, y, l:'f', t:'floor_castle_stone'});
                if(y === 0) schemas.blacksmith.push({x, y, l:'w', t:'wall_stone'});
                if(y < 2) schemas.blacksmith.push({x, y, l:'r', t:'roof_slate_dark'});
            }
        }
        schemas.blacksmith.push({x:1, y:1, l:'d', t:'int_furnace'}, {x:2, y:1, l:'d', t:'industrial_anvil'});

        // Донжон (Королевские покои)
        for(let x=0; x<8; x++) {
            for(let y=0; y<8; y++) {
                schemas.royal_keep.push({x, y, l:'f', t:'floor_castle_stone'});
                if(y === 0 || x === 0 || x === 7) schemas.royal_keep.push({x, y, l:'w', t:'wall_castle'});
                if(y < 7) schemas.royal_keep.push({x, y, l:'r', t:'roof_slate_dark'});
            }
        }
        schemas.royal_keep.push({x:3, y:1, l:'d', t:'int_throne'}, {x:4, y:1, l:'d', t:'animated_magic_fire', anim:true});
        schemas.royal_keep.push({x:1, y:4, l:'d', t:'int_carpet_red'}, {x:2, y:4, l:'d', t:'int_carpet_red'}, {x:5, y:4, l:'d', t:'int_carpet_red'});

        return schemas[type] || schemas.peasant_hut;
    }
}
