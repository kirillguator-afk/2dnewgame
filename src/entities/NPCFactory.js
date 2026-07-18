
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
        
        g.beginFill(0x000000, 0.2).drawEllipse(16, 28, 8, 3).endFill();

        if (type === 'deer') {
            g.beginFill(0x8d6e63).drawRect(10, 14+b, 12, 10); // Тело
            g.beginFill(0x5d4037).drawRect(20, 6+b, 4, 10); // Шея
            g.beginFill(0x8d6e63).drawRect(20, 4+b, 6, 6); // Голова
            g.lineStyle(1, 0x3d2b1f).moveTo(22,4+b).lineTo(20,0+b).moveTo(24,4+b).lineTo(26,0+b); // Рога
            g.beginFill(0x1a1a1a).drawRect(10, 24, 2, 4).drawRect(18, 24, 2, 4); // Ноги
        } else if (type === 'bird') {
            g.beginFill(0x2f3542).drawCircle(16, 16+b, 3);
            g.beginFill(0x747d8c).drawPolygon([16,16+b, 10,14+b, 16,18+b]).drawPolygon([16,16+b, 22,14+b, 16,18+b]); // Крылья
        } else {
            // Стандартный человекоподобный
            g.beginFill(0xe0ac69).drawRect(11, 4+b, 10, 10);
            g.beginFill(color).drawRect(9, 14, 14, 10);
            g.beginFill(0x333333).drawRect(10, 24, 4, 6-b).drawRect(18, 24, 4, 4+b);
        }
        g.endFill();
    }
}
