
export class BuildingTemplates {
    // Генератор жилых домов (10 вариаций)
    static generateVillager(variant) {
        const schema = [];
        const size = (variant % 2 === 0) ? 2 : 3;
        const wall = (variant < 5) ? 'w_wood' : 'w_white';
        const roof = (variant % 3 === 0) ? 'r_thatch' : 'r_red';
        const floor = 'f_wood';

        for(let x=0; x < size; x++) {
            for(let y=0; y < size; y++) {
                schema.push({x, y, l:'f', t: floor});
                if(y === 0) schema.push({x, y, l:'w', t: wall});
                if(y < size-1) schema.push({x, y, l:'r', t: roof});
            }
        }
        // Индивидуальная мебель
        if(variant % 2 === 0) schema.push({x:0, y:size-1, l:'d', t:'int_bed'});
        else schema.push({x:size-1, y:size-1, l:'d', t:'int_chest'});
        
        return schema;
    }

    // Генератор поместий (5 вариаций)
    static generateNoble(variant) {
        const schema = [];
        const w = 5 + (variant % 2);
        const h = 5 + (variant % 3);
        const wall = 'w_noble';
        const roof = 'r_black';
        const floor = 'f_marble';

        for(let x=0; x < w; x++) {
            for(let y=0; y < h; y++) {
                schema.push({x, y, l:'f', t: floor});
                if(y === 0 || x === 0 || x === w-1) schema.push({x, y, l:'w', t: wall});
                if(y < h-1) schema.push({x, y, l:'r', t: roof});
            }
        }
        schema.push({x: Math.floor(w/2), y: 1, l:'d', t:'int_rug'});
        schema.push({x: Math.floor(w/2), y: 1, l:'d', t:'int_throne'});
        schema.push({x: 1, y: h-1, l:'d', t:'int_shelf'});
        return schema;
    }

    // Генератор таверн (10 вариаций)
    static generateTavern(variant) {
        const schema = [];
        const w = 4 + (variant % 3);
        const h = 4 + (variant % 2);
        
        for(let x=0; x < w; x++) {
            for(let y=0; y < h; y++) {
                schema.push({x, y, l:'f', t: 'f_wood'});
                if(y === 0) schema.push({x, y, l:'w', t: 'w_timber'});
                if(y < h-1) schema.push({x, y, l:'r', t: 'r_red'});
            }
        }
        // Стойка
        schema.push({x: 1, y: 1, l:'d', t:'int_bar'});
        schema.push({x: 1, y: 0, l:'d', t:'int_barrel'});
        // Столы в зависимости от вариации
        if(variant % 2 === 0) {
            schema.push({x: w-1, y: h-1, l:'d', t:'int_table'});
        } else {
            schema.push({x: w-2, y: h-2, l:'d', t:'int_table'});
        }
        return schema;
    }

    static getHouseSchema(fullType) {
        const [category, indexStr] = fullType.split('_');
        const index = parseInt(indexStr) || 0;
        
        if(category === 'v') return this.generateVillager(index % 10);
        if(category === 'n') return this.generateNoble(index % 5);
        if(category === 't') return this.generateTavern(index % 10);
        
        return this.generateVillager(0);
    }

    static getTemplates() { return {}; } // Для совместимости
}
