
import { CONFIG } from '../core/Constants.js';

export class BuildingSystem {
    constructor(world) {
        this.world = world;
        this.ghostSprite = null;
    }

    setup() {
        const g = new PIXI.Graphics();
        g.lineStyle(2, 0xffff00, 0.4);
        g.drawRect(0, 0, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        this.ghostSprite = new PIXI.Sprite(this.world.app.renderer.generateTexture(g));
        // ФИКС: Безопасное добавление в UI слой
        if (this.world.layers.UI_OVERLAY) {
            this.world.layers.UI_OVERLAY.addChild(this.ghostSprite);
        }
    }

    handleInput(input, cameraPos) {
        if (!this.ghostSprite) return;
        const mouse = input.mouse;
        const worldX = mouse.x + cameraPos.x - window.innerWidth / 2;
        const worldY = mouse.y + cameraPos.y - window.innerHeight / 2;
        const gridX = Math.floor(worldX / CONFIG.TILE_SIZE);
        const gridY = Math.floor(worldY / CONFIG.TILE_SIZE);
        this.ghostSprite.x = (gridX * CONFIG.TILE_SIZE) - cameraPos.x + window.innerWidth / 2;
        this.ghostSprite.y = (gridY * CONFIG.TILE_SIZE) - cameraPos.y + window.innerHeight / 2;
    }
}
