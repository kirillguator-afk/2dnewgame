
export class ObjectTemplates {
    static generate(app) {
        const textures = {};
        const g = new PIXI.Graphics();

        const create = (name, drawFn) => {
            g.clear();
            drawFn(g);
            textures[name] = app.renderer.generateTexture(g);
        };

        const addMoss = (graphics, x, y, w, h) => {
            graphics.beginFill(0x4b772d, 0.4);
            for(let i=0; i<5; i++) graphics.drawRect(x + Math.random()*w, y + Math.random()*h, 2, 2);
            graphics.endFill();
        };

        // --- ТАЙЛЫ (Улучшенные) ---
        const biomes = window.BIOMES_REF || {};
        Object.values(biomes).forEach(b => {
            create(`tile_${b.id}`, g => {
                g.beginFill(b.color).drawRect(0, 0, 32, 32);
                g.beginFill(0x000000, 0.05);
                for(let i=0; i<4; i++) g.drawRect(Math.random()*28, Math.random()*28, 2, 2);
                g.endFill();
                if(b.id === 'farmland') {
                    g.beginFill(0x3e2723, 0.4).drawRect(0, 8, 32, 2).drawRect(0, 24, 32, 2);
                }
            });
        });

        // --- ФЛОРА (Береза, Сосна, Дуб) ---
        create('tree_oak', g => {
            g.beginFill(0x000000, 0.2).drawEllipse(16, 30, 14, 4);
            g.beginFill(0x3d2b1f).drawRect(12, 14, 8, 16);
            g.beginFill(0x2d5a27).drawCircle(16, 10, 14).drawCircle(8, 14, 10).drawCircle(24, 14, 10);
            addMoss(g, 12, 20, 8, 10);
        });

        create('tree_birch', g => {
            g.beginFill(0x000000, 0.15).drawEllipse(16, 30, 8, 3);
            g.beginFill(0xe3e3e3).drawRect(14, 8, 4, 22); // Белый ствол
            g.beginFill(0x000000, 0.3).drawRect(14, 12, 2, 1).drawRect(16, 20, 2, 1);
            g.beginFill(0x7cb342).drawEllipse(16, 6, 12, 10);
        });

        create('tree_pine', g => {
            g.beginFill(0x000000, 0.2).drawEllipse(16, 30, 12, 4);
            g.beginFill(0x2d1b0d).drawRect(14, 18, 4, 12);
            g.beginFill(0x1a3a1a).drawPolygon([0,24, 16,4, 32,24]);
            g.beginFill(0x2d4a2d).drawPolygon([4,16, 16,0, 28,16]);
        });

        // --- ДЕКОР ПОСЕЛЕНИЙ ---
        create('village_cart', g => {
            g.beginFill(0x5d4037).drawRect(4, 16, 24, 10); // Кузов
            g.beginFill(0x3e2723).drawCircle(8, 26, 6).drawCircle(24, 26, 6); // Колеса
            g.beginFill(0x8d6e63).drawRect(0, 18, 4, 2); // Ручки
        });

        create('market_stall', g => {
            g.beginFill(0x5d4037).drawRect(2, 24, 28, 8); // Прилавок
            g.beginFill(0xc0392b).drawRect(0, 4, 32, 6); // Тент
            g.lineStyle(2, 0x3e2723).moveTo(4, 10).lineTo(4, 24).moveTo(28, 10).lineTo(28, 24);
        });

        // --- ПРИРОДНЫЕ СЮРПРИЗЫ ---
        create('ancient_statue', g => {
            g.beginFill(0x7f8c8d).drawRect(8, 24, 16, 8); // Пьедестал
            g.beginFill(0x95a5a6).drawPolygon([10,24, 22,24, 16,4]); // Бюст
            addMoss(g, 8, 4, 16, 28);
        });

        return textures;
    }
}
