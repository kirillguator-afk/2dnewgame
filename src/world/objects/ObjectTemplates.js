
export class ObjectTemplates {
    static generate(app, biomes) {
        const textures = {};
        const g = new PIXI.Graphics();

        const create = (name, drawFn) => {
            g.clear();
            drawFn(g);
            textures[name] = app.renderer.generateTexture(g);
        };

        const addDither = (graphics, x, y, w, h, col, alpha = 0.1) => {
            graphics.beginFill(col, alpha);
            for(let i=0; i<20; i++) graphics.drawRect(x + Math.random()*w, y + Math.random()*h, 1, 1);
            graphics.endFill();
        };

        // --- ТАЙЛЫ ---
        Object.values(biomes).forEach(b => {
            create(`tile_${b.id}`, gr => {
                gr.beginFill(b.color).drawRect(0, 0, 32, 32);
                addDither(gr, 0, 0, 32, 32, 0x000000, 0.1);
                addDither(gr, 0, 0, 32, 32, b.accent, 0.2);
            });
        });

        // --- ПРИРОДА ---
        create('nature_oak_large', gr => { // Масштабный дуб
            gr.beginFill(0x000000, 0.25).drawEllipse(16, 28, 20, 6).endFill();
            gr.beginFill(0x2d1b0d).drawRect(12, 10, 8, 22);
            gr.beginFill(0x1e3a1a).drawCircle(16, 6, 18).drawCircle(6, 12, 12).drawCircle(26, 12, 12);
            addDither(gr, 0, 0, 32, 20, 0x2ecc71, 0.3);
        });

        create('nature_rock_huge', gr => { // Массивный камень
            gr.beginFill(0x2d3436).drawPolygon([2,30, 30,30, 26,10, 6,4, 0,20]);
            gr.beginFill(0x636e72, 0.5).drawPolygon([6,26, 24,26, 20,14, 10,10]);
            addDither(gr, 2, 4, 28, 26, 0xffffff, 0.1);
        });

        create('nature_grass_tall', gr => { // Густая трава
            gr.beginFill(0x2ecc71, 0.6).drawRect(8, 20, 2, 12).drawRect(16, 16, 2, 16).drawRect(24, 22, 2, 10);
        });

        // --- ГОРОДСКИЕ ОБЪЕКТЫ ---
        create('village_barrel_stack', gr => {
            gr.beginFill(0x5d4037).drawRect(4, 16, 12, 16).drawRect(18, 16, 10, 16).drawRect(10, 4, 12, 12);
            gr.beginFill(0x3e2723).drawRect(4, 20, 12, 2).drawRect(18, 20, 10, 2).drawRect(10, 8, 12, 2);
        });

        create('village_lantern', gr => {
            gr.beginFill(0x2d3436).drawRect(15, 8, 2, 24).drawRect(12, 6, 8, 3);
            gr.beginFill(0xf1c40f, 0.4).drawCircle(16, 10, 8);
            gr.beginFill(0xffeb3b).drawRect(14, 8, 4, 4);
        });

        // --- ТЕКСТУРЫ ЗДАНИЙ ---
        create('wall_stone_detail', gr => {
            gr.beginFill(0x7f8c8d).drawRect(0,0,32,32);
            gr.beginFill(0x2d3436, 0.2).drawRect(2,2,12,6).drawRect(18,10,12,6).drawRect(4,22,24,6);
        });

        return textures;
    }
}
