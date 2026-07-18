
export class NPCFactory {
    static createNPC(app, type, colorHex) {
        const frames = 2;
        const textures = [];
        const color = PIXI.utils.string2hex(colorHex || '#ffffff');

        for (let f = 0; f < frames; f++) {
            const g = new PIXI.Graphics();
            this.drawModel(g, type, color, f);
            textures.push(app.renderer.generateTexture(g));
        }

        const sprite = new PIXI.AnimatedSprite(textures);
        sprite.anchor.set(0.5, 0.95);
        sprite.animationSpeed = 0.05;
        sprite.play();
        
        sprite.userData = {
            type,
            state: 'idle',
            timer: Math.random() * 5,
            vx: 0, vy: 0
        };

        return sprite;
    }

    static drawModel(g, type, color, frame) {
        const b = frame === 1 ? 2 : 0;
        g.clear();
        
        // Тень
        g.beginFill(0x000000, 0.2).drawEllipse(16, 28, 8, 3).endFill();

        if (type === 'cow') {
            g.beginFill(0xffffff).drawRect(6, 14+b, 20, 12);
            g.beginFill(0x000000).drawRect(8, 16+b, 6, 6).drawRect(18, 18+b, 4, 4);
            g.beginFill(0xffffff).drawRect(24, 12+b, 8, 8); // Голова
        } else if (type === 'knight') {
            g.beginFill(0x95a5a6).drawRect(10, 2+b, 12, 10); // Шлем
            g.beginFill(0xbdc3c7).drawRect(7, 12, 18, 14); // Панцирь
            g.beginFill(0xc0392b).drawRect(15, 0+b, 2, 4); // Плюмаж
            g.beginFill(0xecf0f1).drawRect(26, 10, 2, 12); // Меч
        } else {
            // Обычный житель
            g.beginFill(0xe0ac69).drawRect(11, 4+b, 10, 10);
            g.beginFill(0x000000).drawRect(13, 8+b, 2, 2).drawRect(17, 8+b, 2, 2);
            g.beginFill(color).drawRect(9, 14, 14, 10);
            g.beginFill(0x333333).drawRect(10, 24, 4, 6-b).drawRect(18, 24, 4, 4+b);
        }
        g.endFill();
    }
}
