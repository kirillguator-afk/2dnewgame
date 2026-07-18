
export class ObjectTemplates {
    static generate(app) {
        const textures = {};
        const g = new PIXI.Graphics();

        const create = (name, drawFn) => {
            g.clear();
            drawFn(g);
            textures[name] = app.renderer.generateTexture(g);
        };

        const addGrit = (gr, x, y, w, h) => {
            gr.beginFill(0x000000, 0.1);
            for(let i=0; i<12; i++) gr.drawRect(x + Math.random()*w, y + Math.random()*h, 1, 1);
            gr.endFill();
        };

        // --- ТАЙЛЫ ---
        Object.values(window.BIOMES_REF || {}).forEach(b => {
            create(`tile_${b.id}`, g => {
                g.beginFill(b.color).drawRect(0, 0, 32, 32);
                g.beginFill(b.accent, 0.1).drawRect(0,0,32,1).drawRect(0,0,1,32);
                addGrit(g, 0, 0, 32, 32);
            });
        });

        // --- ИНТЕРЬЕР (МЕБЕЛЬ) ---
        create('int_throne', g => {
            g.beginFill(0x5d4037).drawRect(8, 16, 16, 12);
            g.beginFill(0xc0392b).drawRect(10, 4, 12, 16);
            g.beginFill(0xf1c40f).drawRect(6, 14, 4, 14).drawRect(22, 14, 4, 14);
        });

        create('int_bookshelf', g => {
            g.beginFill(0x3e2723).drawRect(2, 4, 28, 28);
            g.beginFill(0x8d6e63).drawRect(4, 10, 24, 2).drawRect(4, 20, 24, 2);
            g.beginFill(0x2980b9).drawRect(6, 6, 3, 4);
        });

        create('market_stall', g => {
            g.beginFill(0x5d4037).drawRect(2, 22, 28, 6);
            g.beginFill(0xc0392b).drawRect(0, 4, 32, 6);
            g.lineStyle(2, 0x3e2723).moveTo(4,10).lineTo(4,22).moveTo(28,10).lineTo(28,22);
        });

        // --- ПРИРОДА ---
        create('nature_oak', g => {
            g.beginFill(0x2d1b0d).drawRect(12, 16, 8, 16);
            g.beginFill(0x1e3a1a).drawCircle(16, 10, 14).drawCircle(8, 14, 10).drawCircle(24, 14, 10);
        });

        create('nature_wheat', g => {
            g.beginFill(0xd4af37).drawRect(14, 8, 4, 24);
            g.beginFill(0xf1c40f).drawCircle(16, 6, 4);
        });

        return textures;
    }
}
