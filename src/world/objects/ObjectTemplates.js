
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
            gr.beginFill(col, 0.2);
            for(let i=0; i<10; i++) gr.drawRect(x + Math.random()*w, y + Math.random()*h, 1, 1);
            gr.endFill();
        };

        // --- 1. ТАЙЛЫ ---
        const biomesRef = window.BIOMES_REF || {};
        Object.values(biomesRef).forEach(b => {
            create(`tile_${b.id}`, g => {
                g.beginFill(b.color).drawRect(0, 0, 32, 32);
                addNoise(g, 0, 0, 32, 32, 0x000000);
                g.lineStyle(1, b.color, 0.3).drawRect(0,0,32,32);
            });
        });

        // --- 2. ИНТЕРЬЕР И ДЕКОР ---
        create('int_fireplace', g => {
            g.beginFill(0x424242).drawRect(4, 12, 24, 20); // Каменная основа
            g.beginFill(0x1a1a1a).drawRect(10, 20, 12, 12); // Топка
        });

        create('int_alchemy_table', g => {
            g.beginFill(0x5d4037).drawRect(4, 16, 24, 4).drawRect(6, 20, 2, 12).drawRect(24, 20, 2, 12);
            g.beginFill(0x9b59b6).drawCircle(10, 14, 3); // Колба 1
            g.beginFill(0x2ecc71).drawCircle(18, 12, 2); // Колба 2
        });

        create('int_bookshelf', g => {
            g.beginFill(0x3e2723).drawRect(2, 4, 28, 28);
            for(let i=0; i<3; i++) {
                g.beginFill(0x8d6e63).drawRect(4, 8 + i*8, 24, 2); // Полки
                g.beginFill(0xc0392b).drawRect(6 + i*4, 5 + i*8, 3, 5); // Книги
                g.beginFill(0x2980b9).drawRect(14 + i*2, 5 + i*8, 2, 5);
            }
        });

        create('int_carpet_red', g => {
            g.beginFill(0xc0392b).drawRect(2, 2, 28, 28);
            g.lineStyle(2, 0xe67e22, 0.5).drawRect(6, 6, 20, 20);
        });

        // --- 3. ПРИРОДА ---
        for(let i=1; i<=5; i++) {
            create(`forest_tree_v${i}`, g => {
                const h = 20 + i*3;
                g.beginFill(0x000000, 0.2).drawEllipse(16, 30, 10, 4);
                g.beginFill(0x2d1b0d).drawRect(14, 30-h, 4, h);
                g.beginFill(0x1a472a).drawPolygon([0, 30-h+8, 16, 0, 32, 30-h+8]);
                addNoise(g, 8, 5, 16, 15, 0x2ecc71);
            });
        }

        // --- 4. АНИМАЦИИ ---
        const fire = [];
        for(let i=0; i<4; i++) {
            g.clear();
            g.beginFill(0x3e2723).drawRect(10, 26, 12, 4);
            g.beginFill(0xe67e22).drawPolygon([10,26, 16, 12+i*3, 22,26]);
            g.beginFill(0xf1c40f).drawPolygon([13,26, 16, 18+i*2, 19,26]);
            fire.push(app.renderer.generateTexture(g));
        }
        textures.animated_fire = fire;

        return textures;
    }
}
