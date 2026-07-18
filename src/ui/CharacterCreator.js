
import { RACES } from '../core/Constants.js';

export class CharacterCreator {
    constructor(onComplete) {
        this.onComplete = onComplete;
        this.pointsPool = 20;
        this.stats = { str: 0, dex: 0, int: 0, tec: 0 };
        this.statNames = {
            str: 'Strength (Combat & Load)',
            dex: 'Dexterity (Speed & Piloting)',
            int: 'Intelligence (Hacking & Research)',
            tec: 'Technical (Mechanics & Energy)'
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
            if (this.elements.name.value.length < 3) {
                alert("Neural link name too short (min 3 characters)");
                return;
            }
            this.finish();
        });

        // Слушатель смены расы для авто-коррекции
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
                <div class="text-xs">
                    <div class="text-cyan-500 uppercase font-bold">${key}</div>
                    <div class="text-[10px] text-cyan-800">${label}</div>
                </div>
                <div class="flex items-center gap-3">
                    <button class="stat-btn w-6 h-6 border border-cyan-500/50 hover:bg-cyan-500/30 text-cyan-400" data-key="${key}" data-mod="-1">-</button>
                    <span class="w-8 text-center text-cyan-400 font-bold">${baseValue + this.stats[key]}</span>
                    <button class="stat-btn w-6 h-6 border border-cyan-500/50 hover:bg-cyan-500/30 text-cyan-400" data-key="${key}" data-mod="1">+</button>
                </div>
            `;
            this.elements.container.appendChild(div);
        });

        // Навешиваем события на кнопки
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
        const charData = {
            name: this.elements.name.value || "Anonymous_Diver",
            race: this.elements.race.value,
            color: this.elements.color.value,
            stats: { ...RACES[this.elements.race.value].stats }
        };

        // Добавляем распределенные очки к базовым статам
        Object.keys(this.stats).forEach(k => charData.stats[k] += this.stats[k]);

        // Прячем меню
        this.elements.overlay.classList.add('hidden');
        this.elements.hud.classList.remove('hidden');

        // Вызываем коллбэк в Engine
        this.onComplete(charData);
    }
}
