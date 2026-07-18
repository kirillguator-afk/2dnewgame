
import { CONFIG, ENTITY_TYPES } from '../core/Constants.js';

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
        // Добавляем призрака в UI слой или поверх мира, но привязанным к камере
        this.world.app.stage.addChildAt(this.ghostSprite, CONFIG.LAYERS.UI - 1);
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

        if (input.isMouseJustPressed(0)) {
            this.placeBlock(gridX, gridY);
        }
    }

    placeBlock(gx, gy) {
        const id = `ent_${gx}_${gy}`;
        if (this.world.entities.has(id)) return;

        // В RPG версии ставим механизмы только на свободные места
        const type = gx % 7 === 0 ? ENTITY_TYPES.MOTOR : ENTITY_TYPES.GEAR;
        const container = new PIXI.Container();
        container.position.set(gx * CONFIG.TILE_SIZE, gy * CONFIG.TILE_SIZE);

        const sprite = new PIXI.Sprite(
            type === ENTITY_TYPES.MOTOR ? this.world.textures.engine : this.world.textures.gear
        );
        sprite.anchor.set(0.5);
        sprite.position.set(CONFIG.TILE_SIZE / 2, CONFIG.TILE_SIZE / 2);
        
        container.addChild(sprite);
        this.world.worldContainer.addChild(container);

        const entityData = { id, gx, gy, type, sprite, container };
        this.world.entities.set(id, entityData);
        this.world.kineticSystem.addEntity(id, type, gx, gy);
    }
}
