
export class ObjectTemplates {
    static generate(app) {
        const textures = {};
        const g = new PIXI.Graphics();

        const create = (name, drawFn) => {
            g.clear();
            drawFn(g);
            textures[name] = app.renderer.generateTexture(g);
        };

        const addPixelNoise = (graphics, x, y, w, h, color, density = 0.3) => {
            graphics.beginFill(color, density);
            for(let i=0; i< (w*h*0.1); i++) {
                graphics.drawRect(x + Math.random()*w, y + Math.random()*h, 1, 1);
            }
            graphics.endFill();
        };

        // --- 1. УЛУЧШЕННЫЕ ТАЙЛЫ ---
        const biomesRef = window.BIOMES_REF || {};
        Object.values(biomesRef).forEach(b => {
            create(`tile_${b.id}`, g => {
                g.beginFill(b.color).drawRect(0, 0, 32, 32);
                // Текстурный шум
                addPixelNoise(g, 0, 0, 32, 32, 0x000000, 0.1);
                addPixelNoise(g, 0, 0, 32, 32, b.accent, 0.05);
                // Окантовка для предотвращения щелей
                g.lineStyle(1, b.color, 0.5).drawRect(0,0,32,32);
            });
        });

        // --- 2. ПРИРОДА (Более 100 вариаций через процедурную отрисовку) ---
        for(let i=1; i<=10; i++) {
            // Разные виды деревьев
            create(`tree_forest_${i}`, g => {
                const h = 20 + Math.random()*15;
                g.beginFill(0x000000, 0.2).drawEllipse(16, 30, 12, 4); // Тень
                g.beginFill(0x2d1b0d).drawRect(14, 30-h, 4, h); // Ствол
                g.beginFill(0x1a472a).drawPolygon([0, 30-h+5, 16, 0, 32, 30-h+5]); // Крона
                addPixelNoise(g, 4, 0, 24, 20, 0x2ecc71, 0.2);
            });
            
            create(`rock_detailed_${i}`, g => {
                const s = 10 + Math.random()*20;
                g.beginFill(0x2d3436).drawPolygon([0,30, 32,30, 16 + (Math.random()-0.5)*20, 30-s]);
                addPixelNoise(g, 0, 20, 32, 10, 0xffffff, 0.1);
            });
        }

        // --- 3. ПОСЕЛЕНИЕ (Живой декор) ---
        create('village_barrel_full', g => {
            g.beginFill(0x5d4037).drawRect(8, 14, 16, 16);
            g.beginFill(0x3e2723).drawRect(8, 18, 16, 2).drawRect(8, 26, 16, 2);
            g.beginFill(0x00d2ff).drawCircle(16, 14, 6); // Вода в бочке
        });

        create('village_bench_royal', g => {
            g.beginFill(0x8d6e63).drawRect(4, 20, 24, 4).drawRect(4, 12, 2, 12).drawRect(26, 12, 2, 12);
            g.beginFill(0xc0392b).drawRect(6, 18, 20, 2); // Красная обивка
        });

        create('village_lamp_post', g => {
            g.beginFill(0x212121).drawRect(15, 8, 2, 24).drawRect(12, 6, 8, 3);
            g.beginFill(0xf1c40f, 0.4).drawCircle(16, 10, 8); // Свет
            g.beginFill(0xffeb3b).drawRect(14, 8, 4, 4);
        });

        // --- 4. ТАВЕРНА (Интерьер) ---
        create('tavern_bar_counter', g => {
            g.beginFill(0x3e2723).drawRect(0, 8, 32, 24).beginFill(0x5d4037).drawRect(0, 8, 32, 4);
            addPixelNoise(g, 0, 12, 32, 20, 0x000000, 0.2);
        });

        create('tavern_mug', g => {
            g.beginFill(0xf1c40f).drawRect(14, 24, 6, 6).beginFill(0xffffff).drawRect(14, 22, 6, 2); // Пена
        });

        // --- 5. АНИМАЦИИ ---
        const flags = [];
        for(let i=0; i<4; i++) {
            g.clear();
            g.beginFill(0x2d3436).drawRect(15, 0, 2, 32);
            g.beginFill(0xc0392b).drawPolygon([17, 2, 30, 8 + Math.sin(i)*2, 17, 14]);
            flags.push(app.renderer.generateTexture(g));
        }
        textures.animated_flag = flags;

        return textures;
    }
}
