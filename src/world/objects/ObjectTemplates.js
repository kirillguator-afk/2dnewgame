
export class ObjectTemplates {
    static generate(app, biomes) {
        const textures = {};
        const g = new PIXI.Graphics();

        const create = (name, drawFn) => {
            g.clear();
            drawFn(g);
            textures[name] = app.renderer.generateTexture(g);
        };

        // --- ТАЙЛЫ ОСНОВАНИЯ ---
        Object.values(biomes || {}).forEach(b => {
            create(`tile_${b.id}`, gr => {
                gr.beginFill(b.color).drawRect(0, 0, 32, 32);
                gr.beginFill(0x000000, 0.05).drawRect(2, 2, 4, 4);
            });
        });

        // --- АРХИТЕКТУРНЫЕ ЭЛЕМЕНТЫ (СТЕНЫ, КРЫШИ, ПОЛЫ) ---
        // Стены
        create('w_wood', gr => gr.beginFill(0x5d4037).drawRect(0,0,32,32).beginFill(0x3e2723).drawRect(0,28,32,4));
        create('w_stone', gr => gr.beginFill(0x7f8c8d).drawRect(0,0,32,32).beginFill(0x2d3436,0.3).drawRect(4,4,10,10));
        create('w_noble', gr => gr.beginFill(0xd1d8e0).drawRect(0,0,32,32).beginFill(0xf1c40f,0.2).drawRect(0,0,32,2));
        create('w_white', gr => gr.beginFill(0xf5f6fa).drawRect(0,0,32,32).beginFill(0x3e2723).drawRect(0,0,4,32).drawRect(28,0,4,32));

        // Крыши
        create('r_thatch', gr => gr.beginFill(0xd4af37).drawRect(0,0,32,32).beginFill(0x827127,0.3).drawRect(0,8,32,2));
        create('r_red', gr => gr.beginFill(0xb71c1c).drawRect(0,0,32,32).beginFill(0x7f0000).drawRect(0,14,32,4));
        create('r_black', gr => gr.beginFill(0x2f3640).drawRect(0,0,32,32).beginFill(0x1e272e).drawRect(0,0,32,4));

        // Полы
        create('f_wood', gr => gr.beginFill(0x8d6e63).drawRect(0,0,32,32).beginFill(0x6d4c41).drawRect(0,0,32,2));
        create('f_stone', gr => gr.beginFill(0x636e72).drawRect(0,0,32,32).beginFill(0x2d3436,0.2).drawRect(0,0,16,16));
        create('f_marble', gr => gr.beginFill(0xffffff).drawRect(0,0,32,32).beginFill(0xd1d8e0,0.3).drawRect(1,1,30,30));

        // --- ИНТЕРЬЕР ---
        create('int_bed', gr => { gr.beginFill(0x5d4037).drawRect(4,10,24,20).beginFill(0xdcdde1).drawRect(6,12,20,16); });
        create('int_table', gr => { gr.beginFill(0x3e2723).drawRect(4,12,24,12).beginFill(0x5d4037).drawRect(6,14,20,8); });
        create('int_chest', gr => { gr.beginFill(0x5d4037).drawRect(8,18,16,12).beginFill(0xf1c40f).drawRect(15,22,2,4); });
        create('int_shelf', gr => { gr.beginFill(0x3e2723).drawRect(2,4,28,28).beginFill(0x8d6e63).drawRect(4,12,24,2).drawRect(4,22,24,2); });
        create('int_bar', gr => { gr.beginFill(0x3e2723).drawRect(0,8,32,16).beginFill(0x5d4037).drawRect(0,8,32,4); });
        create('int_rug', gr => { gr.beginFill(0xc0392b).drawRect(2,2,28,28).lineStyle(1,0xf1c40f).drawRect(6,6,20,20); });
        create('int_barrel', gr => { gr.beginFill(0x5d4037).drawRect(10,14,12,16).beginFill(0x3e2723).drawRect(10,18,12,2).drawRect(10,26,12,2); });

        // --- ПРИРОДА ---
        create('nature_tree_oak', gr => { gr.beginFill(0x2d1b0d).drawRect(12,16,8,16).beginFill(0x1e3a1a).drawCircle(16,10,14); });
        create('nature_wheat', gr => { gr.beginFill(0xd4af37).drawRect(14,8,4,24).beginFill(0xf1c40f).drawCircle(16,6,4); });

        return textures;
    }
}
