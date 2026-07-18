
export class ObjectTemplates {
    static generate(app) {
        const textures = {};
        const g = new PIXI.Graphics();

        const create = (name, drawFn) => {
            g.clear();
            drawFn(g);
            textures[name] = app.renderer.generateTexture(g);
        };

        // Генерация всех тайлов пола на основе BIOMES
        const biomesRef = window.BIOMES_REF || {};
        Object.values(biomesRef).forEach(b => {
            create(`tile_${b.id}`, g => {
                g.beginFill(b.color).drawRect(0, 0, 32, 32);
                g.beginFill(b.accent, 0.15).drawRect(0, 0, 32, 1).drawRect(0, 0, 1, 32);
                // Микро-текстура камня или травы
                g.beginFill(0x000000, 0.05);
                for(let i=0; i<2; i++) g.drawRect(Math.random()*24, Math.random()*24, 4, 4);
                g.endFill();
            });
        });

        // Дерево 1 (Хвойное)
        create('forest_tree_1', g => {
            g.beginFill(0x000000, 0.2).drawEllipse(16, 30, 10, 4);
            g.beginFill(0x3e2723).drawRect(14, 20, 4, 12);
            g.beginFill(0x1b5e20).drawPolygon([0,24, 16,0, 32,24]);
            g.beginFill(0x2e7d32).drawPolygon([4,16, 16,2, 28,16]);
        });

        // Дерево 2 (Тропическое)
        create('forest_tree_2', g => {
            g.beginFill(0x000000, 0.2).drawEllipse(16, 30, 8, 3);
            g.beginFill(0x5d4037).drawRect(14, 10, 4, 22);
            g.beginFill(0x004d40).drawCircle(16, 8, 14);
            g.beginFill(0x00796b, 0.5).drawCircle(10, 6, 8);
        });

        create('mountains_rock_1', g => {
            g.beginFill(0x424242).drawPolygon([2,30, 30,30, 26,10, 6,6]);
            g.beginFill(0x757575).drawPolygon([8,26, 24,26, 16,12]);
        });

        create('forest_flower', g => {
            g.beginFill(0x8bc34a).drawRect(15, 20, 2, 12);
            g.beginFill(0xe91e63).drawCircle(16, 18, 4);
        });

        create('village_barrel', g => {
            g.beginFill(0x3e2723).drawRect(8, 14, 16, 16);
            g.beginFill(0x5d4037).drawRect(8, 18, 16, 2).drawRect(8, 26, 16, 2);
        });

        // Анимация огня
        const fire = [];
        for(let i=0; i<4; i++) {
            g.clear();
            g.beginFill(0xff6f00).drawPolygon([10,32, 16, 12+i*3, 22,32]);
            g.beginFill(0xffd600).drawPolygon([13,32, 16, 18+i*2, 19,32]);
            fire.push(app.renderer.generateTexture(g));
        }
        textures.world_campfire = fire;

        return textures;
    }
}
