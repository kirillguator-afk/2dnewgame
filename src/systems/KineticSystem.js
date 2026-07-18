
import { ENTITY_TYPES, CONFIG } from '../core/Constants.js';

/**
 * Система управления кинетической энергией.
 * Реализует физику передачи вращения между механизмами.
 */
export class KineticSystem {
    constructor() {
        this.entities = new Map(); // id -> data
        this.networks = []; // Группы связанных механизмов
    }

    addEntity(id, type, x, y) {
        this.entities.set(id, {
            id,
            type,
            x,
            y,
            rpm: 0,
            targetRpm: 0,
            torque: 0,
            source: type === ENTITY_TYPES.MOTOR,
            connections: []
        });
        this.rebuildNetworks();
    }

    removeEntity(id) {
        this.entities.delete(id);
        this.rebuildNetworks();
    }

    // Построение графа связей между механизмами
    rebuildNetworks() {
        const ents = Array.from(this.entities.values());
        ents.forEach(e => e.connections = []);

        for (let i = 0; i < ents.length; i++) {
            for (let j = i + 1; j < ents.length; j++) {
                const a = ents[i];
                const b = ents[j];
                
                // Простая проверка на соседство (дистанция 1 тайл)
                const dist = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
                if (dist <= 1.1) { // 1.1 чтобы учесть погрешности float
                    a.connections.push(b.id);
                    b.connections.push(a.id);
                }
            }
        }
    }

    update(dt) {
        // 1. Сначала обновляем источники (моторы)
        for (const entity of this.entities.values()) {
            if (entity.source) {
                entity.rpm = 256; // Константная скорость мотора для теста
            }
        }

        // 2. Распространяем RPM по графу (Breadth-First Search)
        const visited = new Set();
        const queue = Array.from(this.entities.values()).filter(e => e.source);

        while (queue.length > 0) {
            const current = queue.shift();
            visited.add(current.id);

            for (const connId of current.connections) {
                if (!visited.has(connId)) {
                    const neighbor = this.entities.get(connId);
                    // В этой версии передача 1:1, но можно добавить Gear Ratios
                    neighbor.rpm = current.rpm; 
                    queue.push(neighbor);
                }
            }
        }

        // 3. Затухание для неподключенных объектов
        for (const entity of this.entities.values()) {
            if (!visited.has(entity.id) && !entity.source) {
                entity.rpm *= 0.95; // Трение
                if (entity.rpm < 0.1) entity.rpm = 0;
            }
        }
    }

    getKineticData(id) {
        return this.entities.get(id);
    }
}
