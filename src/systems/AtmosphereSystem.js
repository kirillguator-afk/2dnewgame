
/**
 * Управляет глобальными эффектами: туманом, облаками и освещением.
 */
export class AtmosphereSystem {
    constructor(app, container) {
        this.app = app;
        this.container = container;
        this.time = 0;

        // Создаем слой тумана через TilingSprite
        this.fog = this.createFogSprite();
        this.container.addChild(this.fog);

        // Создаем слой облачных теней
        this.clouds = this.createCloudShadows();
        this.container.addChild(this.clouds);
    }

    createFogSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);

        const tex = PIXI.Texture.from(canvas);
        const fog = new PIXI.TilingSprite(tex, window.innerWidth + 500, window.innerHeight + 500);
        fog.alpha = 0.4;
        fog.blendMode = PIXI.BLEND_MODES.SCREEN;
        return fog;
    }

    createCloudShadows() {
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        for(let i=0; i<5; i++) {
            ctx.beginPath();
            ctx.arc(Math.random()*512, Math.random()*512, 100 + Math.random()*100, 0, Math.PI*2);
            ctx.fill();
        }

        const tex = PIXI.Texture.from(canvas);
        const clouds = new PIXI.TilingSprite(tex, window.innerWidth + 1000, window.innerHeight + 1000);
        clouds.alpha = 0.2;
        clouds.blendMode = PIXI.BLEND_MODES.MULTIPLY;
        return clouds;
    }

    update(dt, cameraPos) {
        this.time += dt;

        // Движение тумана
        this.fog.tilePosition.x = -cameraPos.x * 0.5 + Math.sin(this.time * 0.1) * 50;
        this.fog.tilePosition.y = -cameraPos.y * 0.5 + Math.cos(this.time * 0.1) * 50;
        this.fog.width = window.innerWidth;
        this.fog.height = window.innerHeight;

        // Движение теней облаков (медленнее и в одну сторону)
        this.clouds.tilePosition.x = -cameraPos.x * 0.2 + this.time * 10;
        this.clouds.tilePosition.y = -cameraPos.y * 0.2 + this.time * 5;
        this.clouds.width = window.innerWidth;
        this.clouds.height = window.innerHeight;
    }
}
