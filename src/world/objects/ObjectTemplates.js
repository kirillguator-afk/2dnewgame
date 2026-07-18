
export class ObjectTemplates {
    static generate(app, biomes) {
        const textures = {};
        const g = new PIXI.Graphics();

        const create = (name, drawFn) => {
            g.clear();
            drawFn(g);
            textures[name] = app.renderer.generateTexture(g);
        };

        const addDither = (graphics, x, y, w, h, col) => {
            graphics.beginFill(col, 0.1);
            for(let i=0; i<12; i++) graphics.drawRect(x + Math.random()*w, y + Math.random()*h, 1, 1);
            graphics.endFill();
        };

        // --- ТАЙЛЫ ОСНОВАНИЯ ---
        Object.values(biomes).forEach(b => {
            create(`tile_${b.id}`, gr => {
                gr.beginFill(b.color).drawRect(0, 0, 32, 32);
                gr.beginFill(b.accent, 0.1).drawRect(0,0,32,1).drawRect(0,0,1,32);
                addDither(gr, 0, 0, 32, 32, 0x000000);
            });
        });

        // --- СТЕНЫ И МАТЕРИАЛЫ ---
        create('wall_citadel', gr => gr.beginFill(0xd1d8e0).drawRect(0,0,32,32).beginFill(0xa5b1c2).drawRect(0,28,32,4));
        create('wall_timber', gr => gr.beginFill(0xf5f6fa).drawRect(0,0,32,32).beginFill(0x3e2723).drawRect(0,0,4,32).drawRect(28,0,4,32));
        create('wall_stone_dark', gr => gr.beginFill(0x4b4b4b).drawRect(0,0,32,32).beginFill(0x2d3436).drawRect(0,28,32,4));

        // --- КРЫШИ ---
        create('roof_citadel', gr => gr.beginFill(0x2f3640).drawRect(0,0,32,32).beginFill(0xf1c40f, 0.2).drawPolygon([0,0,32,0,16,16]));
        create('roof_tile_red', gr => gr.beginFill(0xb71c1c).drawRect(0,0,32,32).beginFill(0x7f0000).drawRect(0,14,32,4));
        create('roof_thatch', gr => gr.beginFill(0xd4af37).drawRect(0,0,32,32).beginFill(0x827127, 0.3).drawRect(0,8,32,2));

        // --- ПОЛЫ ---
        create('floor_marble', gr => gr.beginFill(0xffffff).drawRect(0,0,32,32).beginFill(0xd1d8e0,0.5).drawRect(1,1,30,30));
        create('floor_planks', gr => gr.beginFill(0x8d6e63).drawRect(0,0,32,32).beginFill(0x6d4c41).drawRect(0,0,32,2));

        // --- ИНТЕРЬЕР И ДЕКОР ---
        create('int_throne', gr => {
            gr.beginFill(0x5d4037).drawRect(8,16,16,12); // Base
            gr.beginFill(0xc0392b).drawRect(10,4,12,16); // Back
            gr.beginFill(0xf1c40f).drawRect(6,14,4,14).drawRect(22,14,4,14); // Rails
        });

        create('market_stall', gr => {
            gr.beginFill(0x5d4037).drawRect(2,22,28,6);
            gr.beginFill(0xc0392b).drawRect(0,4,32,6);
            gr.lineStyle(2, 0x3e2723).moveTo(4,10).lineTo(4,22).moveTo(28,10).lineTo(28,22);
        });

        create('nature_oak', gr => {
            gr.beginFill(0x2d1b0d).drawRect(12,16,8,16);
            gr.beginFill(0x1e3a1a).drawCircle(16,10,14).drawCircle(8,14,10).drawCircle(24,14,10);
        });

        create('nature_wheat', gr => {
            gr.beginFill(0xd4af37).drawRect(14,8,4,24);
            gr.beginFill(0xf1c40f).drawCircle(16,6,4);
        });

        return textures;
    }
}
