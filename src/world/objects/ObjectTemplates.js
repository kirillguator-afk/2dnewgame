
export class ObjectTemplates {
    static generate(app) {
        const textures = {};
        const g = new PIXI.Graphics();

        const create = (name, drawFn) => {
            g.clear();
            drawFn(g);
            textures[name] = app.renderer.generateTexture(g);
        };

        const applyDetail = (gr, x, y, w, h) => {
            gr.beginFill(0x000000, 0.1);
            for(let i=0; i<10; i++) gr.drawRect(x + Math.random()*w, y + Math.random()*h, 1, 1);
            gr.endFill();
        };

        // --- ДЕТАЛИ КОРОЛЕВСТВА ---
        create('citadel_banner', g => {
            g.beginFill(0x2c3e50).drawRect(15, 0, 2, 32); // Флагшток
            g.beginFill(0xc0392b).drawPolygon([17, 2, 32, 8, 17, 14]); // Флаг
            g.beginFill(0xf1c40f).drawCircle(17, 2, 2); // Наконечник
        });

        create('market_cart', g => {
            g.beginFill(0x5d4037).drawRect(4, 16, 24, 10);
            g.beginFill(0x3e2723).drawCircle(8, 26, 6).drawCircle(24, 26, 6);
            g.beginFill(0x27ae60).drawRect(6, 12, 10, 4); // Яблоки в телеге
        });

        create('castle_torch', g => {
            g.beginFill(0x34495e).drawRect(14, 16, 4, 8);
            g.beginFill(0xe67e22).drawCircle(16, 12, 6);
        });

        create('garden_statue', g => {
            g.beginFill(0xbdc3c7).drawRect(8, 24, 16, 8);
            g.beginFill(0xecf0f1).drawPolygon([10,24, 22,24, 16,4]);
        });

        // --- ТАЙЛЫ (СИНХРОНИЗАЦИЯ) ---
        const biomesRef = window.BIOMES_REF || {};
        Object.values(biomesRef).forEach(b => {
            create(`tile_${b.id}`, g => {
                g.beginFill(b.color).drawRect(0, 0, 32, 32);
                g.beginFill(b.accent, 0.1).drawRect(0,0,32,1).drawRect(0,0,1,32);
                applyDetail(g, 0, 0, 32, 32);
            });
        });

        return textures;
    }
}
