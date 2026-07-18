
export class BuildingTemplates {
    static getTemplates(app) { return {}; } // Совместимость

    static getHouseSchema(fullType) {
        const [category, indexStr] = fullType.split('_');
        const variant = parseInt(indexStr) || 0;
        const schema = [];

        if (category === 'n') { // Noble Estate
            const size = 5;
            for(let x=0; x<size; x++) {
                for(let y=0; y<size; y++) {
                    schema.push({x, y, l:'f', t:'f_stone'});
                    if(y === 0 || x === 0 || x === size-1) schema.push({x, y, l:'w', t:'w_noble'});
                    if(y < size-1) schema.push({x, y, l:'r', t:'r_black'});
                }
            }
            schema.push({x:2, y:1, l:'d', t:'int_throne'});
        } else if (category === 't') { // Tavern
            for(let x=0; x<4; x++) {
                for(let y=0; y<4; y++) {
                    schema.push({x, y, l:'f', t:'f_wood'});
                    if(y === 0) schema.push({x, y, l:'w', t:'w_white'});
                    if(y < 3) schema.push({x, y, l:'r', t:'r_red'});
                }
            }
            schema.push({x:1, y:1, l:'d', t:'int_bar'});
        } else { // Villager
            const size = 2;
            for(let x=0; x<size; x++) {
                for(let y=0; y<size; y++) {
                    schema.push({x, y, l:'f', t:'f_wood'});
                    if(y === 0) schema.push({x, y, l:'w', t:'w_wood'});
                    if(y < size-1) schema.push({x, y, l:'r', t:'r_thatch'});
                }
            }
            schema.push({x:0, y:size-1, l:'d', t:'int_bed'});
        }
        return schema;
    }
}
