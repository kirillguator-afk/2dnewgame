
import { Engine } from './core/Engine.js';

window.addEventListener('DOMContentLoaded', () => {
    try {
        const game = new Engine();
        game.init('game-container');
        window.NEON_GEAR = game; // Для дебага
    } catch (err) {
        console.error("Critical Engine Failure:", err);
    }
});
