
export class AtmosphereSystem {
    constructor(app, container) {
        this.app = app;
        this.container = container;
        this.time = 0;

        this.fog = this.createFog();
        this.clouds = this.createClouds();
        
        this.container.addChild(this.clouds);
        this.container.addChild(this.fog);
    }

    createFog() {
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        const tex = PIXI.Texture.from(canvas);
        const fog = new PIXI.TilingSprite(tex, window.innerWidth, window.innerHeight);
        fog.alpha = 0.3;
        fog.blendMode = PIXI.BLEND_MODES.SCREEN;
        return fog;
    }

    createClouds() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024; canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for(let i=0; i<10; i++) {
            ctx.beginPath();
            ctx.arc(Math.random()*1024, Math.random()*1024, 100 + Math.random()*200, 0, Math.PI*2);
            ctx.fill();
        }

        const tex = PIXI.Texture.from(canvas);
        const clouds = new PIXI.TilingSprite(tex, window.innerWidth, window.innerHeight);
        clouds.alpha = 0.2;
        clouds.blendMode = PIXI.BLEND_MODES.MULTIPLY;
        return clouds;
    }

    update(dt, cameraPos) {
        this.time += dt;
        
        // Туман и облака теперь корректно перекрывают экран
        this.fog.width = window.innerWidth;
        this.fog.height = window.innerHeight;
        this.fog.tilePosition.x = Math.floor(-cameraPos.x * 0.05 + Math.sin(this.time * 0.1) * 20);
        this.fog.tilePosition.y = Math.floor(-cameraPos.y * 0.05);

        this.clouds.width = window.innerWidth;
        this.clouds.height = window.innerHeight;
        this.clouds.tilePosition.x = Math.floor(-cameraPos.x * 0.02 + this.time * 10);
        this.clouds.tilePosition.y = Math.floor(-cameraPos.y * 0.02 + this.time * 5);
    }
}
