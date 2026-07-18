
export class CharacterFactory {
    static createRaceTexture(app, raceId, primaryColor) {
        const textures = [];
        const frames = 2;
        const color = PIXI.utils.string2hex(primaryColor);

        for (let f = 0; f < frames; f++) {
            const g = new PIXI.Graphics();
            this.drawCharacterFrame(g, raceId, color, f);
            textures.push(app.renderer.generateTexture(g));
        }

        const sg = new PIXI.Graphics();
        sg.beginFill(0x000000, 0.3).drawEllipse(16, 16, 10, 4).endFill();
        const shadowTex = app.renderer.generateTexture(sg);

        return { frames: textures, shadow: shadowTex };
    }

    static drawCharacterFrame(g, raceId, color, frame) {
        const bounce = frame === 1 ? 2 : 0;
        g.clear();
        
        switch (raceId) {
            case 'HUMAN':
                // Лицо и голова
                g.beginFill(0xe0ac69).drawRect(10, 2 + bounce/2, 12, 10); 
                g.beginFill(0x000000).drawRect(12, 6 + bounce/2, 2, 2).drawRect(18, 6 + bounce/2, 2, 2); // Глаза
                g.beginFill(0x5d4037).drawRect(10, 2 + bounce/2, 12, 3); // Волосы
                // Одежда
                g.beginFill(color).drawRect(8, 12, 16, 12); 
                g.beginFill(0x3e2723).drawRect(8, 18, 16, 2); // Пояс
                // Ноги
                g.beginFill(0x333333).drawRect(10, 24, 5, 6 - bounce).drawRect(17, 24, 5, 4 + bounce);
                break;

            case 'DWARVEN':
                // Голова и борода
                g.beginFill(0xe0ac69).drawRect(10, 6 + bounce/2, 12, 8);
                g.beginFill(0xffffff).drawRect(8, 12 + bounce/2, 16, 10); // Пышная борода
                g.beginFill(0xf1c40f).drawRect(14, 16 + bounce/2, 4, 2); // Зажим для бороды
                g.beginFill(0x000000).drawRect(12, 10 + bounce/2, 2, 2).drawRect(18, 10 + bounce/2, 2, 2);
                // Тело (широкое)
                g.beginFill(color).drawRect(6, 18, 20, 8);
                // Ноги (короткие)
                g.beginFill(0x222222).drawRect(8, 26, 6, 4).drawRect(18, 26, 6, 4);
                break;

            case 'ELVEN':
                // Тонкое лицо и уши
                g.beginFill(0xf3d2c1).drawRect(11, 0 + bounce/2, 10, 10);
                g.beginFill(0xf3d2c1).drawPolygon([7, 4+bounce/2, 11, 2+bounce/2, 11, 6+bounce/2]); // Ухо L
                g.beginFill(0xf3d2c1).drawPolygon([25, 4+bounce/2, 21, 2+bounce/2, 21, 6+bounce/2]); // Ухо R
                g.beginFill(0x2d3436).drawRect(13, 5 + bounce/2, 2, 2).drawRect(17, 5 + bounce/2, 2, 2); // Глаза
                // Изящная одежда
                g.beginFill(color).drawRect(10, 10, 12, 16);
                g.beginFill(0xf1c40f, 0.5).drawRect(10, 10, 2, 16).drawRect(20, 10, 2, 16); // Вышивка
                // Ноги
                g.beginFill(0x333333).drawRect(11, 26, 3, 6 - bounce).drawRect(18, 26, 3, 4 + bounce);
                break;

            case 'ORCISH':
                // Массивная голова и челюсть
                g.beginFill(0x4b772d).drawRect(8, 2 + bounce/2, 16, 12);
                g.beginFill(0x2d4a2d).drawRect(8, 10 + bounce/2, 16, 4); // Нижняя челюсть
                g.beginFill(0xffffff).drawRect(10, 10 + bounce/2, 2, 2).drawRect(20, 10 + bounce/2, 2, 2); // Клыки
                g.beginFill(0xff0000).drawRect(11, 6 + bounce/2, 2, 2).drawRect(19, 6 + bounce/2, 2, 2); // Красные глаза
                // Мощное тело
                g.beginFill(color).drawRect(4, 14, 24, 12);
                g.beginFill(0x3e2723).drawRect(4, 14, 24, 4); // Наплечники из кожи
                // Ноги
                g.beginFill(0x222222).drawRect(8, 26, 7, 5).drawRect(17, 26, 7, 5);
                break;
        }
        g.endFill();
    }
}
