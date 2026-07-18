
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
        draw('wall_citadel', g => g.beginFill(0xd1d8e0).drawRect(0, 0, s, s).beginFill(0xa5b1c2).drawRect(0, s-4, s, 4));
        draw('wall_timber', g => g.beginFill(0xf5f6fa).drawRect(0, 0, s, s).beginFill(0x3e2723).drawRect(0, 0, 4, s).drawRect(28, 0, 4, s));
        draw('wall_stone_dark', g => g.beginFill(0x4b4b4b).drawRect(0, 0, s, s).beginFill(0x2d3436).drawRect(0, s-4, s, 4));
        
        // Крыши
        draw('roof_citadel', g => g.beginFill(0x2f3640).drawRect(0, 0, s, s).beginFill(0x1e272e).drawPolygon([0,0, s,0, s/2,s/2]));
        draw('roof_tile_red', g => g.beginFill(0xb71c1c).drawRect(0, 0, s, s).beginFill(0x7f0000).drawRect(0, 14, s, 4));
        draw('roof_thatch', g => g.beginFill(0xd4af37).drawRect(0, 0, s, s));

        // Полы
        draw('floor_citadel_marble', g => g.beginFill(0xffffff).drawRect(0, 0, s, s).beginFill(0xd1d8e0, 0.3).drawRect(1, 1, 30, 30));
        draw('floor_planks', g => g.beginFill(0x8d6e63).drawRect(0, 0, s, s).beginFill(0x6d4c41).drawRect(0, 0, s, 2));

        return tex;
    }

    static getHouseSchema(type) {
        const h = {
            'castle_keep': [],    // 6x6
            'city_house': [],     // 3x3
            'peasant_hut': []     // 2x2
        };

        // Замок (6x6)
        for(let x=0; x<6; x++) {
            for(let y=0; y<6; y++) {
                h.castle_keep.push({x, y, l:'f', t:'floor_citadel_marble'});
                if(y === 0) h.castle_keep.push({x, y, l:'w', t:'wall_citadel'});
                if(y < 5) h.castle_keep.push({x, y, l:'r', t:'roof_citadel'});
            }
        }
        h.castle_keep.push({x:3, y:1, l:'d', t:'int_throne'}, {x:1, y:1, l:'d', t:'animated_magic_fire', anim:true});

        // Городской дом (3x3)
        for(let x=0; x<3; x++) {
            for(let y=0; y<3; y++) {
                h.city_house.push({x, y, l:'f', t:'floor_planks'});
                if(y === 0) h.city_house.push({x, y, l:'w', t:'wall_timber'});
                if(y < 2) h.city_house.push({x, y, l:'r', t:'roof_tile_red'});
            }
        }
        h.city_house.push({x:1, y:1, l:'d', t:'int_bookshelf'});

        // Хижина (2x2)
        for(let x=0; x<2; x++) {
            for(let y=0; y<2; y++) {
                h.peasant_hut.push({x, y, l:'f', t:'floor_planks'});
                if(y === 0) h.peasant_hut.push({x, y, l:'w', t:'wall_stone_dark'});
                if(y < 1) h.peasant_hut.push({x, y, l:'r', t:'roof_thatch'});
            }
        }
        h.peasant_hut.push({x:0, y:1, l:'d', t:'tavern_table'});

        return h[type] || h.peasant_hut;
    }
}
