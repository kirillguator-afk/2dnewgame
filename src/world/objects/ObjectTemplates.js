
export class ObjectTemplates {
    static generate(app) {
        const textures = {};
        const g = new PIXI.Graphics();

        const create = (name, drawFn) => {
            g.clear();
            drawFn(g);
            textures[name] = app.renderer.generateTexture(g);
        };

        // Генерация всех тайлов пола
        const biomesRef = window.BIOMES_REF || {};
        Object.values(biomesRef).forEach(b => {
            create(`tile_${b.id}`, g => {
                g.beginFill(b.color).drawRect(0, 0, 32, 32);
                g.beginFill(b.accent, 0.1).drawRect(0, 0, 32, 1).drawRect(0, 0, 1, 32);
                // Детализация текстуры
                g.beginFill(0x000000, 0.05);
                for(let i=0; i<3; i++) g.drawRect(Math.random()*24, Math.random()*24, 4, 4);
                g.endFill();
            });
        });

        // Тропинка (Специфическая текстура)
        create('tile_road', g => {
            g.beginFill(0x3e2723).drawRect(0, 0, 32, 32);
            g.beginFill(0x4e342e).drawRect(4, 4, 24, 24);
            g.beginFill(0x5d4037, 0.3).drawCircle(16, 16, 8);
        });

        // Дерево 1
        create('forest_tree_1', g => {
            g.beginFill(0x2d1b0d).drawRect(13, 18, 6, 14);
            g.beginFill(0x1b5e20).drawPolygon([0,22, 16,0, 32,22]);
            g.beginFill(0x2e7d32).drawPolygon([4,14, 16,2, 28,14]);
        });

        // Дерево 2 (Джунгли)
        create('forest_tree_2', g => {
            g.beginFill(0x5d4037).drawRect(14, 10, 4, 22);
            g.beginFill(0x004d40).drawCircle(16, 8, 14);
        });

        // Скала
        create('mountains_rock_1', g => {
            g.beginFill(0x424242).drawPolygon([2,30, 30,30, 26,10, 6,6]);
            g.beginFill(0x757575).drawPolygon([8,26, 24,26, 16,12]);
        });

        // Анимация костра
        const fire = [];
        for(let i=0; i<4; i++) {
            g.clear();
            g.beginFill(0x3e2723).drawRect(8, 28, 16, 4);
            g.beginFill(0xff6f00).drawPolygon([10,32, 16, 12+i*3, 22,32]);
            g.beginFill(0xffd600).drawPolygon([13,32, 16, 18+i*2, 19,32]);
            fire.push(app.renderer.generateTexture(g));
        }
        textures.world_campfire = fire;

        return textures;
    }
}
