
export class NPCFactory {
    static createNPC(app, type, colorHex) {
        const frames = 2;
        const textures = [];
        const color = PIXI.utils.string2hex(colorHex || '#ffffff');

        for (let f = 0; f < frames; f++) {
            const g = new PIXI.Graphics();
            this.drawNPCFrame(g, type, color, f);
            textures.push(app.renderer.generateTexture(g));
        }

        const sprite = new PIXI.AnimatedSprite(textures);
        sprite.anchor.set(0.5, 0.95);
        sprite.animationSpeed = 0.05 + Math.random() * 0.05;
        sprite.play();
        
        sprite.userData = {
            type,
            state: 'idle',
            timer: Math.random() * 5,
            homeX: 0, homeY: 0,
            vx: 0, vy: 0
        };

        return sprite;
    }

    static drawNPCFrame(g, type, color, frame) {
        const legOff = frame === 1 ? 2 : 0;
        g.clear();

        // Общие тени
        g.beginFill(0x000000, 0.2).drawEllipse(16, 28, 8, 3).endFill();

        if (type === 'villager') {
            g.beginFill(0xe0ac69).drawRect(11, 2, 10, 10); // Head
            g.beginFill(color).drawRect(9, 12, 14, 12); // Tunic
            g.beginFill(0x3d2b1f).drawRect(10, 24, 4, 6 - legOff).drawRect(18, 24, 4, 4 + legOff);
        } else if (type === 'knight') {
            g.beginFill(0x95a5a6).drawRect(10, 2, 12, 10); // Helmet
            g.beginFill(0x2c3e50).drawRect(10, 6, 12, 2); 
            g.beginFill(0xbdc3c7).drawRect(7, 12, 18, 14); // Plate
            g.beginFill(0x7f8c8d).drawRect(8, 26, 6, 6).drawRect(18, 26, 6, 6);
            // Weapon
            g.beginFill(0xffffff).drawRect(26, 8, 2, 12).beginFill(0x3e2723).drawRect(25, 20, 4, 2);
        } else if (type === 'merchant') {
            g.beginFill(0xe0ac69).drawRect(11, 2, 10, 10);
            g.beginFill(0xf1c40f).drawRect(8, 12, 16, 14); // Yellow robe
            g.beginFill(0x5d4037).drawRect(6, 10, 20, 2); // Hat brim
        }
        g.endFill();
    }
}
