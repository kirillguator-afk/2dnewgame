
export class ObjectTemplates {
    static generate(app) {
        const textures = {};
        const g = new PIXI.Graphics();

        const create = (name, drawFn) => {
            g.clear();
            drawFn(g);
            textures[name] = app.renderer.generateTexture(g);
        };

        // --- ПРИРОДА (Статика) ---
        create('forest_tree_1', g => {
            g.beginFill(0x000000, 0.2).drawEllipse(16, 28, 12, 4).endFill();
            g.beginFill(0x2d1b0d).drawRect(12, 16, 8, 14);
            g.beginFill(0x1a2e1a).drawPolygon([0,20, 16,0, 32,20]);
            g.beginFill(0x2d5a27).drawPolygon([4,12, 16,0, 28,12]);
        });

        create('mountains_rock_1', g => {
            g.beginFill(0x2d3436).drawPolygon([4,30, 28,30, 24,10, 8,14]);
            g.beginFill(0x636e72).drawPolygon([8,28, 24,28, 20,16, 12,18]);
        });

        // --- АНИМИРОВАННЫЕ ОБЪЕКТЫ (Массивы кадров) ---
        
        // Магический гриб (Пульсация)
        const mushroomFrames = [];
        for(let i=0; i<3; i++) {
            g.clear();
            const glow = 0.2 + (i * 0.15);
            g.beginFill(0x00f2ff, glow).drawCircle(16, 20, 10 + i*2).endFill();
            g.beginFill(0xdcdde1).drawRect(14, 24, 4, 6);
            g.beginFill(0x00d2ff).drawEllipse(16, 20, 10, 6);
            mushroomFrames.push(app.renderer.generateTexture(g));
        }
        textures.forest_magic_shroom = mushroomFrames;

        // Пузыри в болоте
        const swampBubbleFrames = [];
        for(let i=0; i<4; i++) {
            g.clear();
            g.beginFill(0x16a085, 0.6);
            if (i < 3) g.drawCircle(16, 28 - (i*4), 2 + i);
            else g.drawCircle(16, 10, 1).drawCircle(12, 12, 1).drawCircle(20, 8, 1);
            swampBubbleFrames.push(app.renderer.generateTexture(g));
        }
        textures.swamp_bubbles = swampBubbleFrames;

        // Костер (Анимация пламени)
        const fireFrames = [];
        for(let i=0; i<4; i++) {
            g.clear();
            g.beginFill(0x3d2b1f).drawRect(8, 28, 16, 4);
            g.beginFill(0xe67e22).drawPolygon([10,28, 16, 10 + (i%2)*4, 22,28]);
            g.beginFill(0xf1c40f).drawPolygon([12,28, 16, 18 + (i%2)*2, 20,28]);
            fireFrames.push(app.renderer.generateTexture(g));
        }
        textures.world_campfire = fireFrames;

        // Парящий кристалл
        const crystalFrames = [];
        for(let i=0; i<6; i++) {
            g.clear();
            const yOff = Math.sin(i * (Math.PI/3)) * 4;
            g.beginFill(0x000000, 0.1).drawCircle(16, 30, 8).endFill();
            g.beginFill(0x9b59b6).drawPolygon([16, 4+yOff, 24, 16+yOff, 16, 28+yOff, 8, 16+yOff]);
            g.beginFill(0xd386f5, 0.5).drawRect(14, 10+yOff, 4, 4);
            crystalFrames.push(app.renderer.generateTexture(g));
        }
        textures.mountains_crystal = crystalFrames;

        // --- ОБЫЧНЫЙ ДЕКОР ---
        create('village_barrel', g => {
            g.beginFill(0x5d4037).drawRect(8, 14, 16, 16);
            g.beginFill(0x3e2723).drawRect(8, 18, 16, 2).drawRect(8, 26, 16, 2);
        });

        create('village_crate', g => {
            g.beginFill(0x8d6e63).drawRect(8, 14, 16, 16);
            g.lineStyle(1, 0x5d4037).moveTo(8,14).lineTo(24,30).moveTo(24,14).lineTo(8,30);
        });

        create('village_fence_h', g => {
            g.beginFill(0x3e2723).drawRect(0, 20, 32, 4).drawRect(4, 16, 4, 12).drawRect(24, 16, 4, 12);
        });

        return textures;
    }
}
