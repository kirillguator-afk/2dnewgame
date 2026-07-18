
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
        sprite.animationSpeed = 0.04;
        sprite.play();
        
        sprite.userData = {
            type,
            state: 'idle',
            timer: Math.random() * 10,
            vx: 0, vy: 0
        };

        return sprite;
    }

    static drawModel(g, type, color, frame) {
        const b = frame === 1 ? 2 : 0;
        g.clear();
        
        // Тень
        g.beginFill(0x000000, 0.2).drawEllipse(16, 28, 10, 4).endFill();

        if (type === 'villager') {
            g.beginFill(0xe0ac69).drawRect(11, 4+b, 10, 10); // Лицо
            g.beginFill(0x000000).drawRect(13, 8+b, 2, 2).drawRect(17, 8+b, 2, 2); // Глаза
            g.beginFill(color).drawRect(9, 14, 14, 10); // Туника
            g.beginFill(0x3d2b1f).drawRect(10, 24, 4, 6-b*2).drawRect(18, 24, 4, 4+b*2); // Ноги
        } else if (type === 'cow') {
            g.beginFill(0xffffff).drawRect(6, 12+b, 20, 14); // Тело
            g.beginFill(0x000000).drawRect(8, 14+b, 6, 6).drawRect(18, 18+b, 4, 4); // Пятна
            g.beginFill(0xffffff).drawRect(22, 10+b, 8, 8); // Голова
            g.beginFill(0x000000).drawRect(26, 12+b, 2, 2).drawRect(28, 12+b, 2, 2); // Глаза
            g.beginFill(0x333333).drawRect(8, 26, 4, 4).drawRect(18, 26, 4, 4); // Ноги
        } else if (type === 'sheep') {
            g.beginFill(0xe3e3e3).drawCircle(16, 18+b, 10).drawCircle(12, 16+b, 8).drawCircle(20, 16+b, 8); // Шерсть
            g.beginFill(0x1a1a1a).drawRect(22, 14+b, 6, 6); // Мордочка
            g.beginFill(0x1a1a1a).drawRect(10, 26, 3, 4).drawRect(18, 26, 3, 4); // Ноги
        } else if (type === 'knight') {
            g.beginFill(0x7f8c8d).drawRect(10, 2+b, 12, 10); // Шлем
            g.beginFill(0x2c3e50).drawRect(10, 6+b, 12, 2); // Прорезь
            g.beginFill(0xbdc3c7).drawRect(7, 12, 18, 14); // Доспех
            g.beginFill(0xc0392b).drawRect(15, 0+b, 2, 4); // Плюмаж
            g.beginFill(0xecf0f1).drawRect(26, 10, 2, 12); // Меч
        }
        g.endFill();
    }
}
