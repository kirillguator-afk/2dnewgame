
export class ObjectTemplates {
    static generate(app) {
        const textures = {};
        const g = new PIXI.Graphics();

        const create = (name, drawFn) => {
            g.clear();
            drawFn(g);
            textures[name] = app.renderer.generateTexture(g);
        };

        const addGrain = (graphics, x, y, w, h, col) => {
            graphics.beginFill(col, 0.15);
            for(let i=0; i<15; i++) graphics.drawRect(x + Math.random()*w, y + Math.random()*h, 1, 1);
            graphics.endFill();
        };

        // --- ТАЙЛЫ ---
        const biomes = window.BIOMES_REF || {};
        Object.values(biomes).forEach(b => {
            create(`tile_${b.id}`, g => {
                g.beginFill(b.color).drawRect(0, 0, 32, 32);
                if (b.id === 'farmland') {
                    g.beginFill(b.accent, 0.4).drawRect(0, 4, 32, 2).drawRect(0, 12, 32, 2).drawRect(0, 20, 32, 2);
                }
                addGrain(g, 0, 0, 32, 32, 0x000000);
            });
        });

        // --- ПРИРОДА ---
        create('crop_wheat', g => {
            g.beginFill(0xd4af37).drawRect(8, 8, 2, 24).drawRect(16, 4, 2, 28).drawRect(24, 12, 2, 20);
            g.beginFill(0xf1c40f).drawCircle(9, 10, 2).drawCircle(17, 6, 2).drawCircle(25, 14, 2);
        });

        create('nature_tree_pro', g => {
            g.beginFill(0x000000, 0.3).drawEllipse(16, 28, 12, 4);
            g.beginFill(0x3e2723).drawRect(13, 16, 6, 16);
            g.beginFill(0x1a472a).drawPolygon([0,22, 16,0, 32,22]);
            g.beginFill(0x2ecc71, 0.2).drawCircle(16, 10, 6);
        });

        create('nature_bush', g => {
            g.beginFill(0x2d5a27).drawCircle(12, 24, 8).drawCircle(20, 24, 8).drawCircle(16, 18, 8);
            addGrain(g, 8, 16, 16, 16, 0x000000);
        });

        // --- ДЕКОР ---
        create('village_fence', g => {
            g.beginFill(0x5d4037).drawRect(0, 22, 32, 4).drawRect(4, 12, 4, 20).drawRect(24, 12, 4, 20);
        });

        create('village_haystack', g => {
            g.beginFill(0xf1c40f).drawPolygon([4,32, 28,32, 16,8]);
            g.beginFill(0xd4af37).drawRect(8, 28, 16, 2);
        });

        return textures;
    }
}
