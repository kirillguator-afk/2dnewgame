
import { CONFIG } from '../../core/Constants.js';

/**
 * Расширенная библиотека текстур для объектов окружения.
 * Генерирует пиксель-арт вариации для каждого биома.
 */
export class ObjectTemplates {
    static generate(app) {
        const textures = {};
        const g = new PIXI.Graphics();

        const create = (name, drawFn) => {
            g.clear();
            drawFn(g);
            textures[name] = app.renderer.generateTexture(g);
        };

        // --- FOREST ---
        create('forest_tree_1', g => {
            g.beginFill(0x4b3621).drawRect(12, 20, 8, 12); // Ствол
            g.beginFill(0x2d5a27).drawRect(4, 4, 24, 18);  // Листва
        });
        create('forest_tree_2', g => {
            g.beginFill(0x3d2b1f).drawRect(14, 16, 4, 16);
            g.beginFill(0x1e3f1a).drawCircle(16, 12, 10);
        });
        create('forest_flower', g => {
            g.beginFill(0x2ecc71).drawRect(15, 24, 2, 8);
            g.beginFill(0xe74c3c).drawRect(12, 18, 8, 6);
        });

        // --- WASTELAND ---
        create('wasteland_bush', g => {
            g.beginFill(0x7f4f24).drawRect(8, 22, 16, 2).drawRect(12, 14, 2, 10).drawRect(18, 18, 2, 6);
        });
        create('wasteland_bones', g => {
            g.beginFill(0xecf0f1).drawEllipse(16, 28, 10, 3).drawCircle(10, 24, 3);
        });
        create('wasteland_ruin', g => {
            g.beginFill(0x2d3436).drawRect(4, 10, 24, 22).beginFill(0x000000, 0.5).drawRect(12, 16, 8, 8);
        });

        // --- MOUNTAINS ---
        create('mountains_rock_1', g => {
            g.beginFill(0x636e72).drawPolygon([4,28, 28,28, 24,8, 8,12]);
        });
        create('mountains_rock_2', g => {
            g.beginFill(0x95a5a6).drawPolygon([10,30, 22,30, 16,16]);
        });
        create('mountains_crystal', g => {
            g.beginFill(0x00d2ff).drawPolygon([16,4, 24,16, 16,28, 8,16]);
        });

        // --- SWAMP ---
        create('swamp_mushroom_1', g => {
            g.beginFill(0xdcdde1).drawRect(13, 20, 6, 10).beginFill(0xc0392b).drawEllipse(16, 15, 12, 6);
        });
        create('swamp_mushroom_2', g => {
            g.beginFill(0xdcdde1).drawRect(14, 22, 4, 8).beginFill(0x8e44ad).drawEllipse(16, 18, 8, 5);
        });
        create('swamp_reeds', g => {
            g.beginFill(0x16a085).drawRect(8, 10, 2, 22).drawRect(16, 4, 2, 28).drawRect(24, 14, 2, 18);
        });

        return textures;
    }
}
