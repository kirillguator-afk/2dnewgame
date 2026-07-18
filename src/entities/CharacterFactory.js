
import { RACES } from '../core/Constants.js';

/**
 * Генерирует пиксельные текстуры персонажей на основе расы.
 */
export class CharacterFactory {
    static createRaceTexture(app, raceId, primaryColor) {
        const g = new PIXI.Graphics();
        const color = PIXI.utils.string2hex(primaryColor);
        
        switch (raceId) {
            case 'HUMAN':
                this.drawHuman(g, color);
                break;
            case 'DWARVEN':
                this.drawDwarf(g, color);
                break;
            case 'ELVEN':
                this.drawElf(g, color);
                break;
            case 'ORCISH':
                this.drawOrc(g, color);
                break;
        }

        return app.renderer.generateTexture(g);
    }

    static drawHuman(g, color) {
        g.beginFill(0xe0ac69); // Кожа
        g.drawRect(8, 2, 16, 8); // Голова
        g.beginFill(color); // Туника
        g.drawRect(6, 10, 20, 16); // Тело
        g.beginFill(0x333333); // Сапоги
        g.drawRect(8, 26, 6, 4);
        g.drawRect(18, 26, 6, 4);
    }

    static drawDwarf(g, color) {
        g.beginFill(0xe0ac69);
        g.drawRect(8, 8, 16, 8); // Голова ниже
        g.beginFill(0xffffff); // Борода
        g.drawRect(8, 14, 16, 6);
        g.beginFill(color);
        g.drawRect(4, 16, 24, 12); // Широкое тело
        g.beginFill(0x333333);
        g.drawRect(6, 28, 8, 4);
        g.drawRect(18, 28, 8, 4);
    }

    static drawElf(g, color) {
        g.beginFill(0xf3d2c1);
        g.drawRect(10, 0, 12, 10); // Узкая голова
        g.beginFill(0xf3d2c1); // Уши
        g.drawRect(8, 4, 2, 4);
        g.drawRect(22, 4, 2, 4);
        g.beginFill(color);
        g.drawRect(10, 10, 12, 20); // Тонкое тело
        g.beginFill(0x2d3436);
        g.drawRect(10, 30, 4, 2);
        g.drawRect(18, 30, 4, 2);
    }

    static drawOrc(g, color) {
        g.beginFill(0x4b772d); // Зеленая кожа
        g.drawRect(6, 4, 20, 10); // Большая голова
        g.beginFill(color);
        g.drawRect(2, 14, 28, 14); // Массивное тело
        g.beginFill(0x222222);
        g.drawRect(6, 28, 10, 4);
        g.drawRect(16, 28, 10, 4);
    }
}
