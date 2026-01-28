window.QuestManager = class QuestManager {
    constructor(economyManager, achievementManager) {
        this.economy = economyManager;
        this.achievements = achievementManager;

        // Quest templates
        this.questTemplates = [
            { id: 'win_hands', name: 'Winner', desc: 'Win {target} hands', targets: [3, 5, 7], icon: '🏆', rewardChips: 50, rewardGems: 1 },
            { id: 'play_hands', name: 'Active Player', desc: 'Play {target} hands', targets: [5, 10, 15], icon: '🎰', rewardChips: 30, rewardGems: 0 },
            { id: 'get_blackjack', name: 'Natural 21', desc: 'Get a Blackjack', targets: [1], icon: '🃏', rewardChips: 75, rewardGems: 2 },
            { id: 'win_streak', name: 'Hot Streak', desc: 'Win {target} hands in a row', targets: [2, 3], icon: '🔥', rewardChips: 100, rewardGems: 2 },
            { id: 'double_win', name: 'Risk Taker', desc: 'Win after doubling down', targets: [1], icon: '✌️', rewardChips: 60, rewardGems: 1 },
            { id: 'split_play', name: 'Divided', desc: 'Play a split hand', targets: [1], icon: '✂️', rewardChips: 40, rewardGems: 1 },
            { id: 'earn_chips', name: 'Profit', desc: 'Earn {target} chips', targets: [200, 500, 1000], icon: '💰', rewardChips: 50, rewardGems: 1 },
            { id: 'use_insurance', name: 'Safe Play', desc: 'Use insurance', targets: [1], icon: '🛡️', rewardChips: 30, rewardGems: 0 },
        ];

        this.load();
        this.checkDayReset();
    }

    load() {
        const saved = localStorage.getItem('sb_daily_quests');
        if (saved) {
            const data = JSON.parse(saved);
            this.quests = data.quests || [];
            this.lastReset = data.lastReset || null;
            this.sessionStats = data.sessionStats || this.getDefaultSessionStats();
        } else {
            this.quests = [];
            this.lastReset = null;
            this.sessionStats = this.getDefaultSessionStats();
        }
    }

    save() {
        localStorage.setItem('sb_daily_quests', JSON.stringify({
            quests: this.quests,
            lastReset: this.lastReset,
            sessionStats: this.sessionStats
        }));
    }

    getDefaultSessionStats() {
        return {
            handsPlayed: 0,
            handsWon: 0,
            currentStreak: 0,
            blackjacks: 0,
            doubleWins: 0,
            splits: 0,
            chipsEarned: 0,
            insuranceUsed: 0
        };
    }

    checkDayReset() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        if (!this.lastReset || this.lastReset < today) {
            this.generateDailyQuests();
            this.lastReset = today;
            this.sessionStats = this.getDefaultSessionStats();
            this.save();
        }
    }

    generateDailyQuests() {
        // Pick 3 random unique quests
        const shuffled = [...this.questTemplates].sort(() => Math.random() - 0.5);
        this.quests = shuffled.slice(0, 3).map(template => {
            const target = template.targets[Math.floor(Math.random() * template.targets.length)];
            return {
                id: template.id,
                name: template.name,
                desc: template.desc.replace('{target}', target),
                icon: template.icon,
                target: target,
                progress: 0,
                completed: false,
                claimed: false,
                rewardChips: template.rewardChips * (target > 1 ? Math.ceil(target / 2) : 1),
                rewardGems: template.rewardGems
            };
        });
    }

    // Called after each hand
    recordHandResult(result) {
        this.sessionStats.handsPlayed++;

        if (result.won) {
            this.sessionStats.handsWon++;
            this.sessionStats.currentStreak++;
            this.updateQuestProgress('win_hands', 1);
            this.updateQuestProgress('win_streak', this.sessionStats.currentStreak, true);
        } else if (result.lost) {
            this.sessionStats.currentStreak = 0;
        }

        if (result.blackjack) {
            this.sessionStats.blackjacks++;
            this.updateQuestProgress('get_blackjack', 1);
        }

        if (result.doubleWin) {
            this.sessionStats.doubleWins++;
            this.updateQuestProgress('double_win', 1);
        }

        if (result.split) {
            this.sessionStats.splits++;
            this.updateQuestProgress('split_play', 1);
        }

        if (result.chipsEarned > 0) {
            this.sessionStats.chipsEarned += result.chipsEarned;
            this.updateQuestProgress('earn_chips', this.sessionStats.chipsEarned, true);
        }

        if (result.usedInsurance) {
            this.sessionStats.insuranceUsed++;
            this.updateQuestProgress('use_insurance', 1);
        }

        this.updateQuestProgress('play_hands', 1);
        this.save();
    }

    updateQuestProgress(questId, value, isAbsolute = false) {
        const quest = this.quests.find(q => q.id === questId && !q.completed);
        if (!quest) return;

        if (isAbsolute) {
            quest.progress = value;
        } else {
            quest.progress += value;
        }

        if (quest.progress >= quest.target) {
            quest.progress = quest.target;
            quest.completed = true;
        }
    }

    claimQuest(index) {
        const quest = this.quests[index];
        if (!quest || !quest.completed || quest.claimed) return false;

        // Award rewards
        if (this.economy) {
            this.economy.addChips(quest.rewardChips);
            if (quest.rewardGems > 0) {
                this.economy.addGems(quest.rewardGems);
            }
        }

        quest.claimed = true;
        this.save();

        // Play sound
        if (window.game && window.game.audio) {
            window.game.audio.play('achievement');
        }

        return true;
    }

    getQuests() {
        return this.quests;
    }

    getTimeUntilReset() {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        return tomorrow - now;
    }

    renderQuestsPanel() {
        const container = document.getElementById('quests-grid');
        if (!container) return;

        const timeLeft = this.getTimeUntilReset();
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        container.innerHTML = `
            <div class="quests-header">
                <span class="quests-title">Daily Quests</span>
                <span class="quests-timer">Resets in ${hours}h ${minutes}m</span>
            </div>
            <div class="quests-list">
                ${this.quests.map((quest, i) => `
                    <div class="quest-item ${quest.completed ? 'completed' : ''} ${quest.claimed ? 'claimed' : ''}">
                        <div class="quest-icon">${quest.icon}</div>
                        <div class="quest-info">
                            <div class="quest-name">${quest.name}</div>
                            <div class="quest-desc">${quest.desc}</div>
                            <div class="quest-progress-bar">
                                <div class="quest-progress-fill" style="width: ${(quest.progress / quest.target) * 100}%"></div>
                                <span>${quest.progress}/${quest.target}</span>
                            </div>
                        </div>
                        <div class="quest-reward">
                            <span>${quest.rewardChips}💰</span>
                            ${quest.rewardGems > 0 ? `<span>${quest.rewardGems}💎</span>` : ''}
                        </div>
                        ${quest.completed && !quest.claimed ?
                `<button class="quest-claim-btn" onclick="quests.claimQuest(${i}); quests.renderQuestsPanel();">CLAIM</button>` :
                quest.claimed ? '<span class="quest-claimed">✓</span>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
}
