
export class ObjectTemplates {
    static generate(app) {
        const textures = {};
        const g = new PIXI.Graphics();

        const create = (name, drawFn) => {
            g.clear();
            drawFn(g);
            textures[name] = app.renderer.generateTexture(g);
        };

        // --- ДЕТАЛИЗИРОВАННЫЕ ТАЙЛЫ (FLOOR) ---
        const createTile = (name, color, accent) => {
            g.clear();
            g.beginFill(color).drawRect(0, 0, 32, 32);
            // Добавляем микро-текстуру
            g.beginFill(accent, 0.2);
            for(let i=0; i<3; i++) {
                g.drawRect(Math.random()*28, Math.random()*28, 4, 4);
            }
            g.endFill();
            textures[`tile_${name}`] = app.renderer.generateTexture(g);
        };

        createTile('forest', 0x27ae60, 0x2ecc71);
        createTile('wasteland', 0xe67e22, 0xd35400);
        createTile('mountains', 0x95a5a6, 0x7f8c8d);
        createTile('swamp', 0x1e272e, 0x05c46b);
        createTile('ocean', 0x1e3799, 0x4834d4);
        createTile('beach', 0xf6e58d, 0xf9ca24);
        createTile('snow', 0xffffff, 0xdff9fb);
        createTile('village', 0x4b4b4b, 0x636e72);

        // --- ОБЪЕКТЫ ---
        create('forest_tree_1', g => {
            g.beginFill(0x000000, 0.3).drawEllipse(16, 28, 12, 4).endFill();
            g.beginFill(0x2d1b0d).drawRect(12, 14, 8, 16);
            g.beginFill(0x1a2e1a).drawPolygon([0,20, 16,0, 32,20]);
            g.beginFill(0x2ecc71, 0.3).drawCircle(16, 8, 6);
        });

        create('mountains_rock_1', g => {
            g.beginFill(0x2d3436).drawPolygon([4,32, 28,32, 24,10, 8,14]);
            g.beginFill(0x7f8c8d).drawPolygon([8,28, 24,28, 16,14]);
        });

        // Анимации (массивы)
        const fire = [];
        for(let i=0; i<3; i++) {
            g.clear();
            g.beginFill(0xe67e22).drawPolygon([10,32, 16, 12+i*4, 22,32]);
            g.beginFill(0xf1c40f).drawPolygon([12,32, 16, 18+i*2, 20,32]);
            fire.push(app.renderer.generateTexture(g));
        }
        textures.world_campfire = fire;

        const crystal = [];
        for(let i=0; i<6; i++) {
            g.clear();
            const y = Math.sin(i * 0.5) * 5;
            g.beginFill(0x9b59b6).drawPolygon([16, 4+y, 26, 16+y, 16, 28+y, 6, 16+y]);
            g.beginFill(0xffffff, 0.4).drawRect(14, 10+y, 4, 4);
            crystal.push(app.renderer.generateTexture(g));
        }
        textures.mountains_crystal = crystal;

        create('village_barrel', g => { g.beginFill(0x5d4037).drawRect(8, 14, 16, 16); g.beginFill(0x3e2723).drawRect(8, 18, 16, 2); });
        create('village_crate', g => { g.beginFill(0x8d6e63).drawRect(8, 14, 16, 16); g.lineStyle(1, 0x5d4037).moveTo(8,14).lineTo(24,30); });

        return textures;
    }
}
