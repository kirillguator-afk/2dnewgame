
export class InputHandler {
    constructor() {
        this.keys = new Set();
        this.mouse = { x: 0, y: 0, buttons: new Set(), lastButtons: new Set() };
        
        window.addEventListener('keydown', (e) => this.keys.add(e.code));
        window.addEventListener('keyup', (e) => this.keys.delete(e.code));
        
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mousedown', (e) => this.mouse.buttons.add(e.button));
        window.addEventListener('mouseup', (e) => this.mouse.buttons.delete(e.button));
    }

    isKeyDown(code) { return this.keys.has(code); }
    
    isMouseDown(button) { return this.mouse.buttons.has(button); }
    
    isMouseJustPressed(button) {
        return this.mouse.buttons.has(button) && !this.lastButtons.has(button);
    }

    update() {
        // Клонируем состояние кнопок для определения "JustPressed" в следующем кадре
        this.lastButtons = new Set(this.mouse.buttons);
    }
}
