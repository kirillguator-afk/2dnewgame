
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
            homeX: 0, homeY: 0,
            vx: 0, vy: 0
        };

        return sprite;
    }

    static drawNPCFrame(g, type, color, frame) {
        const bounce = frame === 1 ? 2 : 0;
        g.clear();

        // Тень
        g.beginFill(0x000000, 0.2).drawEllipse(16, 29, 9, 3).endFill();

        if (type === 'villager') {
            // Лицо
            g.beginFill(0xe0ac69).drawRect(11, 4 + bounce/2, 10, 10);
            g.beginFill(0x000000).drawRect(13, 8 + bounce/2, 1, 2).drawRect(18, 8 + bounce/2, 1, 2);
            // Простая рубаха и фартук
            g.beginFill(color).drawRect(9, 14, 14, 10);
            g.beginFill(0xffffff, 0.3).drawRect(10, 16, 12, 8); // Фартук
            // Ноги
            g.beginFill(0x3d2b1f).drawRect(10, 24, 4, 6 - bounce).drawRect(18, 24, 4, 4 + bounce);

        } else if (type === 'knight') {
            // Полный доспех
            g.beginFill(0x95a5a6).drawRect(10, 2 + bounce/2, 12, 10); // Шлем
            g.beginFill(0x2c3e50).drawRect(10, 6 + bounce/2, 12, 2); // Прорезь
            g.beginFill(0xc0392b).drawRect(15, 0 + bounce/2, 2, 3); // Плюмаж
            
            g.beginFill(0xbdc3c7).drawRect(7, 12, 18, 14); // Нагрудник
            g.beginFill(0xffffff, 0.2).drawRect(8, 13, 4, 10); // Блик на металле
            
            // Щит за спиной или в руке
            g.beginFill(0x3e2723).drawRect(4, 14, 2, 10); 
            g.beginFill(0xc0392b).drawRect(3, 15, 2, 8);

            g.beginFill(0x7f8c8d).drawRect(8, 26, 6, 6).drawRect(18, 26, 6, 6); // Поножи

        } else if (type === 'merchant') {
            // Богатая одежда и шляпа
            g.beginFill(0xe0ac69).drawRect(11, 4 + bounce/2, 10, 10);
            g.beginFill(0x5d4037).drawRect(7, 4 + bounce/2, 18, 3); // Поля шляпы
            g.beginFill(0x3e2723).drawRect(10, 1 + bounce/2, 12, 4); // Тулья шляпы
            
            g.beginFill(color).drawRect(8, 14, 16, 12); // Кафтан
            g.beginFill(0xf1c40f).drawRect(15, 14, 2, 12); // Золотая застежка
            
            // Большой заплечный тюк
            g.beginFill(0x8d6e63).drawRect(6, 12, 6, 14);
            g.lineStyle(1, 0x5d4037).moveTo(6, 12).lineTo(12, 26);
        }
        g.endFill();
    }
}
