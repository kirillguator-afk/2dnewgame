
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

        draw('wall_stone_moss', g => {
            g.beginFill(0x636e72).drawRect(0, 0, s, s);
            g.beginFill(0x4b772d, 0.3).drawRect(0, 0, s, 4).drawRect(0, 20, 4, 12);
        });
        
        draw('roof_magic_purple', g => {
            g.beginFill(0x4834d4).drawRect(0, 0, s, s);
            g.beginFill(0x686de0).drawPolygon([0,0, 32,0, 16,16]);
            g.beginFill(0xffffff, 0.2).drawCircle(16, 16, 4);
        });

        draw('floor_dirt', g => {
            g.beginFill(0x3d2b1f).drawRect(0, 0, s, s);
            g.beginFill(0x000000, 0.1).drawCircle(16, 16, 8);
        });

        return tex;
    }

    static getHouseSchema(type) {
        const h = {
            'wizard_tower': [], // 4x4, высокая
            'farm_house': [],   // 5x5
        };

        // Магическая Башня (4x4)
        for(let x=0; x<4; x++) {
            for(let y=0; y<4; y++) {
                h.wizard_tower.push({x, y, l:'f', t:'floor_marble'});
                if(y === 0 || x === 0 || x === 3) h.wizard_tower.push({x, y, l:'w', t:'wall_stone_brick'});
                if(y < 3) h.wizard_tower.push({x, y, l:'r', t:'roof_magic_purple'});
            }
        }
        h.wizard_tower.push({x:1, y:1, l:'d', t:'int_bookshelf'});

        // Фермерский дом (5x5)
        for(let x=0; x<5; x++) {
            for(let y=0; y<5; y++) {
                h.farm_house.push({x, y, l:'f', t:'floor_dirt'});
                if(y === 0) h.farm_house.push({x, y, l:'w', t:'wall_wood_dark'});
                if(y < 4) h.farm_house.push({x, y, l:'r', t:'roof_tile_red'});
            }
        }

        return h[type] || [];
    }
}
