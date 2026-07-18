
export class ObjectTemplates {
    static generate(app) {
        const textures = {};
        const g = new PIXI.Graphics();

        const create = (name, drawFn) => {
            g.clear();
            drawFn(g);
            textures[name] = app.renderer.generateTexture(g);
        };

        const dither = (graphics, x, y, w, h, col) => {
            graphics.beginFill(col, 0.1);
            for(let i=0; i<15; i++) graphics.drawRect(x + Math.random()*w, y + Math.random()*h, 1, 1);
            graphics.endFill();
        };

        // --- ДЕТАЛИ ИНТЕРЬЕРА ---
        create('int_furnace', g => {
            g.beginFill(0x424242).drawRect(2, 8, 28, 24); // Камень
            g.beginFill(0x1a1a1a).drawRect(8, 16, 16, 16); // Зев горна
            dither(g, 2, 8, 28, 24, 0x000000);
        });

        create('int_bed', g => {
            g.beginFill(0x5d4037).drawRect(4, 10, 24, 20); // Каркас
            g.beginFill(0xdcdde1).drawRect(6, 12, 20, 16); // Простынь
            g.beginFill(0x7f8c8d).drawRect(6, 12, 20, 4); // Подушка
        });

        create('int_weapon_rack', g => {
            g.beginFill(0x3e2723).drawRect(4, 26, 24, 4).drawRect(6, 8, 2, 20).drawRect(24, 8, 2, 20);
            g.beginFill(0x95a5a6).drawRect(10, 10, 2, 16).drawRect(18, 10, 2, 16); // Мечи
        });

        create('int_throne', g => {
            g.beginFill(0x5d4037).drawRect(8, 20, 16, 12); // Сиденье
            g.beginFill(0x5d4037).drawRect(8, 4, 16, 16); // Спинка
            g.beginFill(0xc0392b).drawRect(10, 6, 12, 14); // Обивка
            g.beginFill(0xf1c40f).drawRect(6, 18, 4, 14).drawRect(22, 18, 4, 14); // Подлокотники
        });

        // --- ФОРТИФИКАЦИИ ---
        create('fort_palisade', g => {
            g.beginFill(0x3e2723).drawRect(12, 0, 8, 32);
            g.beginFill(0x2d1b0d).drawPolygon([12,4, 16,0, 20,4]); // Заострение
            dither(g, 12, 0, 8, 32, 0x000000);
        });

        // --- ДЕРЕВЬЯ (Улучшенные) ---
        create('nature_oak', g => {
            g.beginFill(0x2d1b0d).drawRect(12, 16, 8, 16);
            g.beginFill(0x1e3a1a).drawCircle(16, 10, 14).drawCircle(8, 14, 10).drawCircle(24, 14, 10);
            g.beginFill(0x2d5a27, 0.4).drawCircle(16, 8, 8);
        });

        // --- АНИМАЦИИ ---
        const magicFire = [];
        for(let i=0; i<4; i++) {
            g.clear();
            g.beginFill(0x2c3e50).drawCircle(16, 28, 8); // Чаша
            g.beginFill(0x3498db).drawPolygon([10,24, 16, 4+i*4, 22,24]); // Синее пламя
            g.beginFill(0xffffff, 0.4).drawCircle(16, 18, 4+i);
            magicFire.push(app.renderer.generateTexture(g));
        }
        textures.animated_magic_fire = magicFire;

        return textures;
    }
}
