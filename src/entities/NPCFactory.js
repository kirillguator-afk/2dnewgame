
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
        
        // Метаданные для логики
        sprite.userData = {
            type,
            state: 'idle',
            timer: Math.random() * 100,
            homeX: 0,
            homeY: 0,
            vx: 0,
            vy: 0
        };

        return sprite;
    }

    static drawNPCFrame(g, type, color, frame) {
        const legOff = frame === 1 ? 2 : 0;
        g.clear();

        if (type === 'villager') {
            g.beginFill(0xe0ac69).drawRect(11, 2, 10, 10); // Голова
            g.beginFill(color).drawRect(9, 12, 14, 12); // Рубаха
            g.beginFill(0x3d2b1f).drawRect(10, 24, 4, 6 - legOff).drawRect(18, 24, 4, 4 + legOff); // Ноги
        } else if (type === 'knight') {
            g.beginFill(0x95a5a6).drawRect(10, 2, 12, 10); // Шлем
            g.beginFill(0x2c3e50).drawRect(10, 6, 12, 2); // Прорезь
            g.beginFill(0xbdc3c7).drawRect(7, 12, 18, 14); // Нагрудник
            g.beginFill(0x7f8c8d).drawRect(8, 26, 6, 6).drawRect(18, 26, 6, 6); // Поножи
            // Меч
            g.beginFill(0xffffff).drawRect(25, 10, 2, 10);
            g.beginFill(0x3e2723).drawRect(24, 20, 4, 2);
        }
        g.endFill();
    }
}
