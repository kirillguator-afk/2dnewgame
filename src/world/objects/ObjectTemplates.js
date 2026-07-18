
export class ObjectTemplates {
    static generate(app) {
        const textures = {};
        const g = new PIXI.Graphics();

        const create = (name, drawFn) => {
            g.clear();
            drawFn(g);
            textures[name] = app.renderer.generateTexture(g);
        };

        const addNoise = (gr, x, y, w, h, col) => {
            gr.beginFill(col, 0.1);
            for(let i=0; i<12; i++) gr.drawRect(x + Math.random()*w, y + Math.random()*h, 1, 1);
            gr.endFill();
        };

        // --- 1. ТАЙЛЫ (FLOOR) ---
        const biomesRef = window.BIOMES_REF || {};
        Object.values(biomesRef).forEach(b => {
            create(`tile_${b.id}`, g => {
                g.beginFill(b.color).drawRect(0, 0, 32, 32);
                if (b.id === 'farmland') {
                    g.beginFill(b.accent, 0.5).drawRect(0, 4, 32, 2).drawRect(0, 12, 32, 2).drawRect(0, 20, 32, 2);
                }
                addNoise(g, 0, 0, 32, 32, 0x000000);
            });
        });

        // --- 2. ПРИРОДА (NATURE - 60+ вариаций) ---
        for(let i=1; i<=5; i++) {
            create(`tree_forest_${i}`, g => {
                const h = 24 + i*4;
                g.beginFill(0x2d1b0d).drawRect(13, 30-h, 6, h); // Trunk
                g.beginFill(0x1a472a).drawPolygon([0, 30-h+12, 16, 0, 32, 30-h+12]); // Foliage 1
                g.beginFill(0x2d5a27, 0.6).drawPolygon([4, 15, 16, 2, 28, 15]); // Foliage 2
                addNoise(g, 13, 20, 6, 10, 0x000000);
            });
            create(`tree_birch_${i}`, g => {
                g.beginFill(0xe3e3e3).drawRect(14, 10, 4, 22);
                g.beginFill(0x000000, 0.4).drawRect(14, 15, 2, 1).drawRect(16, 22, 2, 1);
                g.beginFill(0x7cb342).drawCircle(16, 8, 12 + i);
            });
            create(`rock_detailed_${i}`, g => {
                g.beginFill(0x424242).drawPolygon([2,30, 30,30, 16 + (i-3)*4, 10 + i*2]);
                g.beginFill(0x757575, 0.4).drawPolygon([8,28, 24,28, 16, 18]);
            });
        }

        // --- 3. ДЕКОР ПОСЕЛЕНИЙ ---
        create('village_cart', g => {
            g.beginFill(0x5d4037).drawRect(4, 14, 24, 12);
            g.beginFill(0x3e2723).drawCircle(8, 26, 6).drawCircle(24, 26, 6);
            g.beginFill(0x8d6e63).drawRect(0, 16, 4, 2);
        });

        create('village_stall', g => {
            g.beginFill(0x5d4037).drawRect(4, 24, 24, 8); // Bench
            g.beginFill(0xc0392b).drawRect(2, 6, 28, 6); // Tent
            g.lineStyle(2, 0x3e2723).moveTo(4, 12).lineTo(4, 24).moveTo(28, 12).lineTo(28, 24);
        });

        create('village_well_stone', g => {
            g.beginFill(0x757575).drawCircle(16, 26, 12).beginFill(0x34495e).drawCircle(16, 26, 8);
            g.lineStyle(2, 0x5d4037).moveTo(8, 26).lineTo(8, 10).moveTo(24, 26).lineTo(24, 10).beginFill(0x5d4037).drawRect(6, 6, 20, 6);
        });

        create('village_fence_h', g => {
            g.beginFill(0x3e2723).drawRect(0, 22, 32, 4).drawRect(4, 12, 4, 20).drawRect(24, 12, 4, 20);
        });

        // --- 4. АНИМАЦИИ ---
        const fire = [];
        for(let i=0; i<4; i++) {
            g.clear();
            g.beginFill(0x3e2723).drawRect(10, 28, 12, 4);
            g.beginFill(0xe67e22).drawPolygon([10,28, 16, 10+i*3, 22,28]);
            g.beginFill(0xf1c40f).drawPolygon([13,28, 16, 18+i*2, 19,28]);
            fire.push(app.renderer.generateTexture(g));
        }
        textures.animated_fire = fire;

        return textures;
    }
}
