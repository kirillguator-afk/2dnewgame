
export class ObjectTemplates {
    static generate(app) {
        const textures = {};
        const g = new PIXI.Graphics();

        const create = (name, drawFn) => {
            g.clear();
            drawFn(g);
            textures[name] = app.renderer.generateTexture(g);
        };

        // Дерево с тенями и "освещением"
        create('forest_tree_1', g => {
            // Тень под деревом
            g.beginFill(0x000000, 0.3).drawEllipse(16, 28, 12, 4).endFill();
            // Ствол
            g.beginFill(0x2d1b0d).drawRect(12, 18, 8, 14);
            // Крона (слои с градиентом)
            g.beginFill(0x1a2e1a).drawPolygon([0,22, 16,0, 32,22]);
            g.beginFill(0x2d5a27).drawPolygon([4,14, 16,2, 28,14]);
            g.beginFill(0x3e7b37, 0.5).drawCircle(16, 8, 4); // Блик
        });

        create('forest_tree_2', g => {
            g.beginFill(0x000000, 0.3).drawEllipse(16, 28, 10, 4).endFill();
            g.beginFill(0x3d2b1f).drawRect(13, 20, 6, 12);
            g.beginFill(0x0d1a0d).drawCircle(16, 12, 14);
            g.beginFill(0x1a2e1a).drawCircle(12, 8, 8);
        });

        // Камень с фаской
        create('mountains_rock_1', g => {
            g.beginFill(0x000000, 0.2).drawEllipse(16, 28, 14, 4).endFill();
            g.beginFill(0x2d3436).drawPolygon([2,28, 30,28, 26,10, 8,6, 0,14]);
            g.beginFill(0x636e72).drawPolygon([6,26, 26,26, 24,14, 10,10]);
        });

        // Светящийся кристалл
        create('mountains_crystal', g => {
            g.beginFill(0x00d2ff, 0.2).drawCircle(16, 16, 18).endFill();
            g.beginFill(0x00d2ff).drawPolygon([16,2, 26,16, 16,30, 6,16]);
            g.beginFill(0xffffff, 0.7).drawRect(14, 10, 4, 4);
        });

        // Руины (стены)
        create('wasteland_ruin', g => {
            g.beginFill(0x2d3436).drawRect(4, 4, 24, 28);
            g.beginFill(0x1a1a1a).drawRect(10, 16, 12, 16); // Проем
            g.beginFill(0x636e72).drawRect(4, 4, 24, 4); // Окантовка
        });

        // Цветы
        create('forest_flower', g => {
            g.beginFill(0x2ecc71).drawRect(15, 24, 2, 8);
            g.beginFill(0xc0392b).drawCircle(16, 20, 4);
            g.beginFill(0xf1c40f).drawCircle(16, 20, 1.5);
        });

        return textures;
    }
}
