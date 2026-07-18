
import { RACES } from '../core/Constants.js';

export class CharacterCreator {
    constructor(onComplete) {
        this.onComplete = onComplete;
        this.pointsPool = 20;
        this.stats = { str: 0, dex: 0, int: 0, tec: 0 };
        this.statNames = {
            str: 'Сила',
            dex: 'Ловкость',
            int: 'Интеллект',
            tec: 'Ремесло'
        };

        this.elements = {
            overlay: document.getElementById('creator-overlay'),
            name: document.getElementById('char-name'),
            race: document.getElementById('char-race'),
            color: document.getElementById('char-color'),
            points: document.getElementById('stat-points'),
            container: document.getElementById('stat-container'),
            startBtn: document.getElementById('start-btn'),
            hud: document.getElementById('ui-layer')
        };

        this.init();
    }

    init() {
        this.renderStats();
        this.elements.startBtn.addEventListener('click', () => {
            if (this.elements.name.value.length < 2) {
                alert("Введите имя героя!");
                return;
            }
            this.finish();
        });
        this.elements.race.addEventListener('change', () => this.renderStats());
    }

    renderStats() {
        this.elements.container.innerHTML = '';
        const selectedRace = RACES[this.elements.race.value];
        
        Object.entries(this.statNames).forEach(([key, label]) => {
            const baseValue = selectedRace.stats[key];
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between';
            div.innerHTML = `
                <div>
                    <div class="text-yellow-600 uppercase font-bold text-lg">${label}</div>
                </div>
                <div class="flex items-center gap-6">
                    <button class="stat-btn rpg-button w-10 h-10 text-xl" data-key="${key}" data-mod="-1">-</button>
                    <span class="w-10 text-center text-3xl font-['Ruslan_Display']">${baseValue + this.stats[key]}</span>
                    <button class="stat-btn rpg-button w-10 h-10 text-xl" data-key="${key}" data-mod="1">+</button>
                </div>
            `;
            this.elements.container.appendChild(div);
        });

        this.elements.container.querySelectorAll('.stat-btn').forEach(btn => {
            btn.onclick = () => this.modifyStat(btn.dataset.key, parseInt(btn.dataset.mod));
        });

        this.elements.points.innerText = this.pointsPool;
    }

    modifyStat(key, mod) {
        if (mod > 0 && this.pointsPool > 0) {
            this.stats[key]++;
            this.pointsPool--;
        } else if (mod < 0 && this.stats[key] > 0) {
            this.stats[key]--;
            this.pointsPool++;
        }
        this.renderStats();
    }

    finish() {
        const raceKey = this.elements.race.value; // HUMAN, DWARVEN etc.
        const charData = {
            name: this.elements.name.value || "Странник",
            raceId: raceKey,
            race: RACES[raceKey].name,
            color: this.elements.color.value,
            stats: { ...RACES[raceKey].stats }
        };
        Object.keys(this.stats).forEach(k => charData.stats[k] += this.stats[k]);
        this.elements.overlay.classList.add('hidden');
        this.elements.hud.classList.remove('hidden');
        this.onComplete(charData);
    }
}
