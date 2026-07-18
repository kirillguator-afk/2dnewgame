
export class ObjectTemplates {
    static generate(app) {
        const textures = {};
        const g = new PIXI.Graphics();

        const create = (name, drawFn) => {
            g.clear();
            drawFn(g);
            textures[name] = app.renderer.generateTexture(g);
        };

        const biomesRef = window.BIOMES_REF || {};
        Object.values(biomesRef).forEach(b => {
            create(`tile_${b.id}`, g => {
                g.beginFill(b.color).drawRect(0, 0, 32, 32);
                g.beginFill(b.accent, 0.1).drawRect(0, 0, 32, 1).drawRect(0, 0, 1, 32);
                g.beginFill(0x000000, 0.05);
                for(let i=0; i<3; i++) g.drawRect(Math.random()*24, Math.random()*24, 4, 4);
                g.endFill();
            });
        });

        // Детали интерьера таверны
        create('tavern_table', g => {
            g.beginFill(0x000000, 0.3).drawRect(4, 24, 24, 6).endFill();
            g.beginFill(0x5d4037).drawRect(4, 12, 24, 4).drawRect(6, 16, 4, 12).drawRect(22, 16, 4, 12);
        });

        create('tavern_chair', g => {
            g.beginFill(0x3e2723).drawRect(12, 20, 8, 2).drawRect(12, 22, 2, 8).drawRect(18, 22, 2, 8).drawRect(12, 14, 2, 6);
        });

        // Улучшенные деревья
        create('forest_tree_1', g => {
            g.beginFill(0x2d1b0d).drawRect(13, 18, 6, 14);
            g.beginFill(0x1a472a).drawPolygon([0,22, 16,0, 32,22]);
            g.beginFill(0x2d5a27).drawPolygon([4,14, 16,2, 28,14]);
            g.beginFill(0x000000, 0.1).drawRect(13, 18, 2, 14); // Тень на стволе
        });

        const fire = [];
        for(let i=0; i<4; i++) {
            g.clear();
            g.beginFill(0x3e2723).drawRect(8, 28, 16, 4);
            g.beginFill(0xe67e22).drawPolygon([10,28, 16, 10+i*3, 22,28]);
            g.beginFill(0xf1c40f).drawPolygon([13,28, 16, 18+i*2, 19,28]);
            fire.push(app.renderer.generateTexture(g));
        }
        textures.world_campfire = fire;

        return textures;
    }
}
