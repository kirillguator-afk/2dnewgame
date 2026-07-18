
export class ObjectTemplates {
    static generate(app, biomes) {
        const textures = {};
        const g = new PIXI.Graphics();

        const create = (name, drawFn) => {
            g.clear();
            drawFn(g);
            textures[name] = app.renderer.generateTexture(g);
        };

        // --- ТАЙЛЫ ---
        Object.values(biomes || {}).forEach(b => {
            create(`tile_${b.id}`, gr => {
                gr.beginFill(b.color).drawRect(0, 0, 32, 32);
                gr.beginFill(0x000000, 0.05).drawRect(Math.random()*20, Math.random()*20, 2, 2);
            });
        });

        // --- МЕБЕЛЬ И ИНТЕРЬЕР (ДЛЯ ВСЕХ ТИПОВ) ---
        create('int_bed_simple', gr => { gr.beginFill(0x5d4037).drawRect(4,10,24,20).beginFill(0xdcdde1).drawRect(6,12,20,16); });
        create('int_bed_noble', gr => { gr.beginFill(0x3e2723).drawRect(2,4,28,26).beginFill(0xc0392b).drawRect(4,6,24,22).beginFill(0xf1c40f).drawRect(4,6,24,4); });
        create('int_table_long', gr => { gr.beginFill(0x3e2723).drawRect(2,10,28,12); });
        create('int_chair', gr => { gr.beginFill(0x5d4037).drawRect(12,20,8,8).drawRect(12,14,8,2); });
        create('int_bar_counter', gr => { gr.beginFill(0x3e2723).drawRect(0,8,32,16).beginFill(0x5d4037).drawRect(0,8,32,4); });
        create('int_shelf_bottles', gr => { gr.beginFill(0x3e2723).drawRect(4,4,24,24).beginFill(0x2ecc71).drawRect(6,8,4,4).beginFill(0xc0392b).drawRect(12,16,4,4); });
        create('int_rug_royal', gr => { gr.beginFill(0x2c3e50).drawRect(2,2,28,28).lineStyle(2,0xf1c40f).drawRect(6,6,20,20); });
        create('int_fireplace_stone', gr => { gr.beginFill(0x4b4b4b).drawRect(4,8,24,24).beginFill(0x1a1a1a).drawRect(10,20,12,12); });
        
        // --- ПРИРОДА ---
        create('nature_tree_1', gr => { gr.beginFill(0x2d1b0d).drawRect(14,16,4,16).beginFill(0x1a472a).drawCircle(16,12,14); });
        create('nature_tree_2', gr => { gr.beginFill(0x3d2b1f).drawRect(14,18,4,14).beginFill(0x27ae60).drawPolygon([0,22,16,0,32,22]); });

        return textures;
    }
}
