
import { CONFIG } from '../../core/Constants.js';

/**
 * Библиотека текстур для объектов окружения.
 */
export class ObjectTemplates {
    static generate(app) {
        const textures = {};
        const g = new PIXI.Graphics();

        // --- FOREST: Tree ---
        g.clear();
        g.beginFill(0x4b3621); // Ствол
        g.drawRect(12, 20, 8, 12);
        g.beginFill(0x2d5a27); // Листва
        g.drawRect(4, 4, 24, 18);
        g.beginFill(0x1e3f1a); // Тень листвы
        g.drawRect(6, 6, 6, 6);
        textures.forest_tree = app.renderer.generateTexture(g);

        // --- WASTELAND: Dead Bush ---
        g.clear();
        g.beginFill(0x7f4f24);
        g.drawRect(14, 24, 4, 8);
        g.drawRect(8, 18, 16, 2);
        g.drawRect(10, 12, 2, 10);
        textures.wasteland_bush = app.renderer.generateTexture(g);

        // --- MOUNTAINS: Rock ---
        g.clear();
        g.beginFill(0x636e72); // Основной камень
        g.drawPolygon([8,28, 24,28, 28,16, 16,4, 4,16]);
        g.beginFill(0x2d3436, 0.3); // Тень камня
        g.drawRect(10, 10, 6, 6);
        textures.mountain_rock = app.renderer.generateTexture(g);

        // --- SWAMP: Mushroom ---
        g.clear();
        g.beginFill(0xdcdde1); // Ножка
        g.drawRect(13, 20, 6, 10);
        g.beginFill(0xc0392b); // Шляпка
        g.drawEllipse(16, 15, 14, 8);
        g.beginFill(0xffffff); // Точки
        g.drawRect(10, 12, 2, 2);
        g.drawRect(20, 14, 2, 2);
        textures.swamp_mushroom = app.renderer.generateTexture(g);

        return textures;
    }
}
