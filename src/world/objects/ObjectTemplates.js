
export class ObjectTemplates {
    static generate(app, biomes) {
        const textures = {};
        const g = new PIXI.Graphics();

        const create = (name, drawFn) => {
            g.clear();
            drawFn(g);
            textures[name] = app.renderer.generateTexture(g);
        };

        const addDither = (graphics, x, y, w, h, col) => {
            graphics.beginFill(col, 0.1);
            for(let i=0; i<15; i++) graphics.drawRect(x + Math.random()*w, y + Math.random()*h, 1, 1);
            graphics.endFill();
        };

        // --- ТАЙЛЫ ---
        Object.values(biomes).forEach(b => {
            create(`tile_${b.id}`, gr => {
                gr.beginFill(b.color).drawRect(0, 0, 32, 32);
                gr.beginFill(b.accent, 0.1).drawRect(0,0,32,1).drawRect(0,0,1,32);
                addDither(gr, 0, 0, 32, 32, 0x000000);
            });
        });

        // --- АРХИТЕКТУРНЫЕ МОДУЛИ ---
        create('w_wood', gr => gr.beginFill(0x5d4037).drawRect(0,0,32,32).beginFill(0x3e2723).drawRect(0,28,32,4));
        create('w_stone', gr => gr.beginFill(0x7f8c8d).drawRect(0,0,32,32).beginFill(0x2d3436,0.3).drawRect(2,2,12,8));
        create('w_noble', gr => gr.beginFill(0xd1d8e0).drawRect(0,0,32,32).beginFill(0xf1c40f,0.2).drawRect(0,0,32,2));
        create('w_white', gr => gr.beginFill(0xf5f6fa).drawRect(0,0,32,32).beginFill(0x3e2723).drawRect(0,0,4,32).drawRect(28,0,4,32));
        
        create('r_red', gr => gr.beginFill(0xb71c1c).drawRect(0,0,32,32).beginFill(0x7f0000).drawRect(0,14,32,4));
        create('r_black', gr => gr.beginFill(0x2f3640).drawRect(0,0,32,32));
        create('r_thatch', gr => gr.beginFill(0xd4af37).drawRect(0,0,32,32));

        create('f_wood', gr => gr.beginFill(0x8d6e63).drawRect(0,0,32,32).beginFill(0x6d4c41, 0.5).drawRect(0,0,32,2));
        create('f_stone', gr => gr.beginFill(0x636e72).drawRect(0,0,32,32).beginFill(0x2d3436, 0.2).drawRect(0,0,16,16));
        create('f_marble', gr => gr.beginFill(0xffffff).drawRect(0,0,32,32).beginFill(0xd1d8e0, 0.3).drawRect(1,1,30,30));

        // --- ИНТЕРЬЕР ---
        create('int_throne', gr => {
            gr.beginFill(0x5d4037).drawRect(8,16,16,12);
            gr.beginFill(0xc0392b).drawRect(10,4,12,16);
            gr.beginFill(0xf1c40f).drawRect(6,14,4,14).drawRect(22,14,4,14);
        });
        create('int_bed', gr => { gr.beginFill(0x5d4037).drawRect(4,10,24,20).beginFill(0xdcdde1).drawRect(6,12,20,16); });
        create('int_bar', gr => { gr.beginFill(0x3e2723).drawRect(0,8,32,16).beginFill(0x5d4037).drawRect(0,8,32,4); });
        create('int_table', gr => { gr.beginFill(0x3e2723).drawRect(4,12,24,12); });
        create('int_shelf', gr => { gr.beginFill(0x3e2723).drawRect(2,4,28,28).beginFill(0x8d6e63).drawRect(4,12,24,2); });

        // --- ПРИРОДА ---
        create('nature_oak', gr => {
            gr.beginFill(0x2d1b0d).drawRect(12,16,8,16);
            gr.beginFill(0x1e3a1a).drawCircle(16,10,14);
        });
        create('nature_wheat', gr => {
            gr.beginFill(0xd4af37).drawRect(14,8,4,24).beginFill(0xf1c40f).drawCircle(16,6,4);
        });

        // --- АНИМАЦИИ ---
        const magFire = [];
        for(let i=0; i<4; i++) {
            g.clear();
            g.beginFill(0x2c3e50).drawCircle(16, 28, 7);
            g.beginFill(0x3498db).drawPolygon([10,24, 16, 4+i*3, 22,24]);
            magFire.push(app.renderer.generateTexture(g));
        }
        textures.animated_magic_fire = magFire;

        return textures;
    }
}
