
export class ObjectTemplates {
    static generate(app) {
        const textures = {};
        const g = new PIXI.Graphics();

        const create = (name, drawFn) => {
            g.clear();
            drawFn(g);
            textures[name] = app.renderer.generateTexture(g);
        };

        // --- ТАЙЛЫ ЗЕМЛИ (Контрастные) ---
        Object.entries(window.BIOMES_REF || {}).forEach(([key, biome]) => {
            create(`tile_${biome.id}`, g => {
                g.beginFill(biome.color).drawRect(0, 0, 32, 32);
                g.beginFill(biome.accent, 0.3).drawRect(0, 0, 32, 1).drawRect(0, 0, 1, 32); // Сетка
                g.endFill();
            });
        });

        // --- ОБЪЕКТЫ (С обводкой для видимости) ---
        create('forest_tree_1', g => {
            g.lineStyle(1, 0x000000, 0.5);
            g.beginFill(0x2d1b0d).drawRect(12, 16, 8, 14); // Ствол
            g.beginFill(0x1a472a).drawPolygon([0,20, 16,0, 32,20]); // Крона
            g.beginFill(0x2ecc71, 0.4).drawCircle(16, 8, 6);
        });

        create('mountains_rock_1', g => {
            g.lineStyle(1, 0x000000, 0.5);
            g.beginFill(0x4b4b4b).drawPolygon([4,30, 28,30, 24,10, 8,14]);
            g.beginFill(0x95a5a6).drawPolygon([8,28, 24,28, 20,16]);
        });

        create('village_barrel', g => {
            g.lineStyle(1, 0x000000, 0.4);
            g.beginFill(0x5d4037).drawRect(8, 14, 16, 16);
            g.beginFill(0x3e2723).drawRect(8, 18, 16, 2).drawRect(8, 26, 16, 2);
        });

        // Анимация костра
        const fire = [];
        for(let i=0; i<3; i++) {
            g.clear();
            g.beginFill(0xe67e22).drawPolygon([10,32, 16, 10+i*4, 22,32]);
            g.beginFill(0xf1c40f).drawPolygon([12,32, 16, 16+i*2, 20,32]);
            fire.push(app.renderer.generateTexture(g));
        }
        textures.world_campfire = fire;

        return textures;
    }
}
