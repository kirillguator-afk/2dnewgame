
export class ObjectTemplates {
    static generate(app) {
        const textures = {};
        const g = new PIXI.Graphics();

        const create = (name, drawFn) => {
            g.clear();
            drawFn(g);
            textures[name] = app.renderer.generateTexture(g);
        };

        // --- 1. ТАЙЛЫ (СИНХРОНИЗАЦИЯ) ---
        const biomesRef = window.BIOMES_REF || {};
        Object.values(biomesRef).forEach(b => {
            create(`tile_${b.id}`, g => {
                g.beginFill(b.color).drawRect(0, 0, 32, 32);
                g.beginFill(b.accent, 0.1).drawRect(0, 0, 32, 1).drawRect(0, 0, 1, 32);
                g.beginFill(0x000000, 0.05);
                for(let i=0; i<3; i++) g.drawRect(Math.random()*24, Math.random()*24, 4, 4);
            });
        });

        // --- 2. ПРИРОДА (Nature - 40+ вариаций) ---
        // Деревья (разные типы для каждого биома)
        const treeTypes = [
            { id: 'forest', colors: [0x1b5e20, 0x2e7d32], stems: [0x3e2723] },
            { id: 'taiga', colors: [0x263238, 0x37474f], stems: [0x1a1a1a] },
            { id: 'jungle', colors: [0x004d40, 0x00695c], stems: [0x5d4037] }
        ];

        treeTypes.forEach(type => {
            for(let i=1; i<=5; i++) {
                create(`${type.id}_tree_${i}`, g => {
                    g.beginFill(0x000000, 0.2).drawEllipse(16, 30, 10 + i, 4);
                    g.beginFill(type.stems[0]).drawRect(14, 15, 4, 16);
                    g.beginFill(type.colors[i % 2]).drawPolygon([0, 25-i*2, 16, 0, 32, 25-i*2]);
                    g.beginFill(type.colors[(i+1) % 2], 0.4).drawPolygon([4, 15-i, 16, 2, 28, 15-i]);
                });
            }
        });

        // Камни и скалы
        for(let i=1; i<=8; i++) {
            create(`rock_${i}`, g => {
                const color = i < 4 ? 0x424242 : 0x757575;
                g.beginFill(color).drawPolygon([Math.random()*5, 30, 27+Math.random()*5, 30, 16, 5+Math.random()*10]);
                g.beginFill(0x000000, 0.2).drawPolygon([16, 30, 27, 30, 16, 15]);
            });
        }

        // --- 3. ПОСЕЛЕНИЕ (Village - 30+ вариаций) ---
        create('village_barrel', g => {
            g.beginFill(0x5d4037).drawRect(8, 14, 16, 16);
            g.beginFill(0x3e2723).drawRect(8, 18, 16, 2).drawRect(8, 26, 16, 2);
        });

        create('village_crate', g => {
            g.beginFill(0x8d6e63).drawRect(8, 14, 16, 16);
            g.lineStyle(1, 0x5d4037).moveTo(8,14).lineTo(24,30).moveTo(24,14).lineTo(8,30);
        });

        create('village_bench', g => {
            g.beginFill(0x5d4037).drawRect(4, 20, 24, 4).drawRect(6, 24, 2, 6).drawRect(24, 24, 2, 6).drawRect(4, 14, 2, 6).drawRect(26, 14, 2, 6);
        });

        create('village_fence_h', g => {
            g.beginFill(0x3e2723).drawRect(0, 22, 32, 3).drawRect(4, 16, 4, 12).drawRect(24, 16, 4, 12);
        });

        create('village_well', g => {
            g.beginFill(0x757575).drawCircle(16, 26, 12);
            g.beginFill(0x424242).drawCircle(16, 26, 8);
            g.lineStyle(2, 0x3e2723).moveTo(8, 26).lineTo(8, 10).moveTo(24, 26).lineTo(24, 10);
            g.beginFill(0x3e2723).drawRect(6, 8, 20, 4);
        });

        // --- 4. ШАХТЫ И ИНДУСТРИЯ ---
        create('mine_entrance', g => {
            g.beginFill(0x212121).drawRect(0, 0, 64, 64);
            g.beginFill(0x000000).drawRect(12, 20, 40, 44); // Тьма внутри
            g.lineStyle(4, 0x3e2723).moveTo(10, 64).lineTo(10, 20).lineTo(54, 20).lineTo(54, 64); // Балки
        });

        create('industrial_anvil', g => {
            g.beginFill(0x212121).drawRect(8, 24, 16, 8).drawRect(4, 16, 24, 8);
            g.beginFill(0x424242).drawRect(6, 16, 20, 2);
        });

        // --- 5. АНИМАЦИИ ---
        const torch = [];
        for(let i=0; i<4; i++) {
            g.clear();
            g.beginFill(0x3e2723).drawRect(15, 20, 2, 12);
            g.beginFill(0xffa000, 0.3).drawCircle(16, 18, 8 + i);
            g.beginFill(0xff6f00).drawCircle(16, 18, 3);
            torch.push(app.renderer.generateTexture(g));
        }
        textures.animated_torch = torch;

        const fire = [];
        for(let i=0; i<4; i++) {
            g.clear();
            g.beginFill(0x3e2723).drawRect(8, 28, 16, 4);
            g.beginFill(0xff6f00).drawPolygon([10,28, 16, 10+i*3, 22,28]);
            g.beginFill(0xffd600).drawPolygon([13,28, 16, 18+i*2, 19,28]);
            fire.push(app.renderer.generateTexture(g));
        }
        textures.world_campfire = fire;

        return textures;
    }
}
