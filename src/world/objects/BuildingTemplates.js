
export class BuildingTemplates {
    static getHouseSchema(type) {
        const h = {
            'castle_keep': [],
            'city_house': [],
            'peasant_hut': []
        };

        // Замок (6x6)
        for(let x=0; x<6; x++) {
            for(let y=0; y<6; y++) {
                h.castle_keep.push({x, y, l:'f', t:'floor_marble'});
                if(y === 0 || x === 0 || x === 5) h.castle_keep.push({x, y, l:'w', t:'wall_citadel'});
                if(y < 5) h.castle_keep.push({x, y, l:'r', t:'roof_citadel'});
            }
        }
        h.castle_keep.push({x:3, y:1, l:'d', t:'int_throne'});

        // Городской дом (3x3)
        for(let x=0; x<3; x++) {
            for(let y=0; y<3; y++) {
                h.city_house.push({x, y, l:'f', t:'floor_planks'});
                if(y === 0) h.city_house.push({x, y, l:'w', t:'wall_timber'});
                if(y < 2) h.city_house.push({x, y, l:'r', t:'roof_tile_red'});
            }
        }

        // Хижина (2x2)
        for(let x=0; x<2; x++) {
            for(let y=0; y<2; y++) {
                h.peasant_hut.push({x, y, l:'f', t:'floor_planks'});
                if(y === 0) h.peasant_hut.push({x, y, l:'w', t:'wall_stone_dark'});
                if(y < 1) h.peasant_hut.push({x, y, l:'r', t:'roof_thatch'});
            }
        }

        return h[type] || h.peasant_hut;
    }

    static getTemplates() {
        return {}; // Метод для совместимости, основные данные в getHouseSchema
    }
}
