
import { RACES } from '../core/Constants.js';

export class CharacterFactory {
    static createRaceTexture(app, raceId, primaryColor) {
        const textures = [];
        const frames = 2; // Анимация из 2 кадров (левая/правая нога)

        for (let f = 0; f < frames; f++) {
            const g = new PIXI.Graphics();
            const color = PIXI.utils.string2hex(primaryColor);
            this.drawCharacterFrame(g, raceId, color, f);
            textures.push(app.renderer.generateTexture(g));
        }

        return textures;
    }

    static drawCharacterFrame(g, raceId, color, frame) {
        const offset = frame * 2;
        
        // Shadow
        g.beginFill(0x000000, 0.2).drawEllipse(16, 28, 10, 4);

        switch (raceId) {
            case 'HUMAN':
                g.beginFill(0xe0ac69).drawRect(10, 2, 12, 10); // Head
                g.beginFill(color).drawRect(8, 12, 16, 14); // Body
                g.beginFill(0x333333).drawRect(10, 26, 4, 4 - offset).drawRect(18, 26, 4, offset); // Legs
                break;
            case 'DWARVEN':
                g.beginFill(0xe0ac69).drawRect(10, 6, 12, 10);
                g.beginFill(0xffffff).drawRect(10, 14, 12, 6); // Beard
                g.beginFill(color).drawRect(6, 16, 20, 10);
                g.beginFill(0x222222).drawRect(8, 26, 6, 4).drawRect(18, 26, 6, 4);
                break;
            case 'ELVEN':
                g.beginFill(0xf3d2c1).drawRect(11, 0, 10, 10); // Lean head
                g.beginFill(0xf3d2c1).drawPolygon([9,4, 11,2, 11,6]).drawPolygon([23,4, 21,2, 21,6]); // Ears
                g.beginFill(color).drawRect(10, 10, 12, 18);
                g.beginFill(0x333333).drawRect(11, 28, 3, 4).drawRect(18, 28, 3, 4);
                break;
            case 'ORCISH':
                g.beginFill(0x4b772d).drawRect(8, 2, 16, 12); // Huge head
                g.beginFill(color).drawRect(4, 14, 24, 14); // Wide body
                g.beginFill(0x222222).drawRect(8, 28, 6, 4).drawRect(18, 28, 6, 4);
                break;
        }
    }
}
