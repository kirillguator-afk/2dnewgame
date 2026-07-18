
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
        sprite.animationSpeed = 0.06;
        sprite.play();
        
        sprite.userData = {
            type,
            state: 'idle',
            timer: Math.random() * 5,
            vx: 0, vy: 0
        };

        return sprite;
    }

    static drawNPCFrame(g, type, color, frame) {
        const bounce = frame === 1 ? 2 : 0;
        g.clear();

        // Тень (Мягкая)
        g.beginFill(0x000000, 0.25).drawEllipse(16, 30, 10, 4).endFill();

        if (type === 'villager') {
            // Лицо с глазами
            g.beginFill(0xe0ac69).drawRect(11, 4+bounce/2, 10, 10);
            g.beginFill(0x000000).drawRect(13, 8+bounce/2, 1, 2).drawRect(18, 8+bounce/2, 1, 2);
            // Одежда с шумом
            g.beginFill(color).drawRect(9, 14, 14, 10);
            g.beginFill(0x3d2b1f).drawRect(10, 24, 4, 6-bounce).drawRect(18, 24, 4, 4+bounce);
        } else if (type === 'knight') {
            // Броня с бликами
            g.beginFill(0x7f8c8d).drawRect(10, 2+bounce/2, 12, 10); // Шлем
            g.beginFill(0xbdc3c7).drawRect(7, 12, 18, 14); // Кираса
            g.beginFill(0xffffff, 0.3).drawRect(8, 13, 2, 10); // Блик
            g.beginFill(0xc0392b).drawRect(15, 0, 2, 4); // Плюмаж
            // Меч
            g.beginFill(0xecf0f1).drawRect(26, 8, 2, 12);
        }
        g.endFill();
    }
}
