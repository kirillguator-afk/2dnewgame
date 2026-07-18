
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
        const legOff = frame === 1 ? 3 : 0;
        g.clear();
        
        switch (raceId) {
            case 'HUMAN':
                g.beginFill(0xe0ac69).drawRect(10, 2, 12, 10); // Head
                g.beginFill(color).drawRect(8, 12, 16, 12); // Body
                g.beginFill(0x333333).drawRect(10, 24, 4, 6 - legOff).drawRect(18, 24, 4, legOff + 4);
                break;
            case 'DWARVEN':
                g.beginFill(0xe0ac69).drawRect(10, 6, 12, 10);
                g.beginFill(0xffffff).drawRect(10, 14, 12, 8); // Beard
                g.beginFill(color).drawRect(6, 16, 20, 10);
                g.beginFill(0x222222).drawRect(8, 26, 6, 4).drawRect(18, 26, 6, 4);
                break;
            case 'ELVEN':
                g.beginFill(0xf3d2c1).drawRect(11, 0, 10, 10);
                g.beginFill(0xf3d2c1).drawPolygon([8,4, 11,2, 11,6]).drawPolygon([24,4, 21,2, 21,6]);
                g.beginFill(color).drawRect(10, 10, 12, 16);
                g.beginFill(0x333333).drawRect(11, 26, 3, 6 - legOff).drawRect(18, 26, 3, legOff + 4);
                break;
            case 'ORCISH':
                g.beginFill(0x4b772d).drawRect(8, 2, 16, 12);
                g.beginFill(color).drawRect(4, 14, 24, 12);
                g.beginFill(0x222222).drawRect(8, 26, 6, 4 + legOff).drawRect(18, 26, 6, 6 - legOff);
                break;
        }
        g.endFill();
    }
}
