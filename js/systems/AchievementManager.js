window.AchievementManager = class AchievementManager {
    constructor(economyManager) {
        this.economy = economyManager;

        // Define all achievements
        this.achievements = [
            // Progression achievements
            { id: 'first_win', name: 'First Victory', description: 'Win your first hand', icon: '🏆', reward: 5, type: 'one-time' },
            { id: 'win_streak_3', name: 'Hot Streak', description: 'Win 3 hands in a row', icon: '🔥', reward: 10, type: 'one-time' },
            { id: 'win_streak_5', name: 'On Fire!', description: 'Win 5 hands in a row', icon: '💥', reward: 25, type: 'one-time' },
            { id: 'win_streak_10', name: 'Unstoppable', description: 'Win 10 hands in a row', icon: '⚡', reward: 50, type: 'one-time' },

            // Skill achievements
            { id: 'blackjack', name: 'Natural 21', description: 'Get a Blackjack', icon: '🃏', reward: 5, type: 'one-time' },
            { id: 'blackjack_10', name: 'Blackjack Master', description: 'Get 10 Blackjacks', icon: '♠️', reward: 20, type: 'milestone', target: 10 },
            { id: 'double_win', name: 'Double Trouble', description: 'Win after doubling down', icon: '✌️', reward: 10, type: 'one-time' },
            { id: 'split_win', name: 'Divided We Stand', description: 'Win both hands after a split', icon: '✂️', reward: 15, type: 'one-time' },
            { id: 'insurance_save', name: 'Smart Bet', description: 'Win insurance against dealer blackjack', icon: '🛡️', reward: 10, type: 'one-time' },

            // Wealth achievements
            { id: 'chips_1000', name: 'Getting Started', description: 'Have 1,000 chips', icon: '💰', reward: 5, type: 'milestone', target: 1000 },
            { id: 'chips_5000', name: 'High Roller', description: 'Have 5,000 chips', icon: '💵', reward: 15, type: 'milestone', target: 5000 },
            { id: 'chips_10000', name: 'Millionaire', description: 'Have 10,000 chips', icon: '💎', reward: 30, type: 'milestone', target: 10000 },

            // Gameplay achievements
            { id: 'hands_50', name: 'Regular Player', description: 'Play 50 hands', icon: '🎰', reward: 10, type: 'milestone', target: 50 },
            { id: 'hands_100', name: 'Dedicated', description: 'Play 100 hands', icon: '🎲', reward: 20, type: 'milestone', target: 100 },
            { id: 'hands_500', name: 'Veteran', description: 'Play 500 hands', icon: '👑', reward: 50, type: 'milestone', target: 500 },

            // Special achievements
            { id: 'comeback', name: 'Comeback Kid', description: 'Win after being down to 0 chips', icon: '🔄', reward: 20, type: 'one-time' },
            { id: 'skin_collector', name: 'Collector', description: 'Own 5 different skins', icon: '🎨', reward: 25, type: 'milestone', target: 5 },
        ];

        // Load saved progress
        this.unlocked = JSON.parse(localStorage.getItem('sb_achievements_unlocked')) || [];
        this.progress = JSON.parse(localStorage.getItem('sb_achievements_progress')) || {};
        this.stats = JSON.parse(localStorage.getItem('sb_stats')) || {
            totalWins: 0,
            totalHands: 0,
            currentStreak: 0,
            maxStreak: 0,
            blackjacks: 0,
            doubleWins: 0,
            splitWins: 0,
            insuranceSaves: 0
        };
    }

    isUnlocked(achievementId) {
        return this.unlocked.includes(achievementId);
    }

    getProgress(achievementId) {
        return this.progress[achievementId] || 0;
    }

    save() {
        localStorage.setItem('sb_achievements_unlocked', JSON.stringify(this.unlocked));
        localStorage.setItem('sb_achievements_progress', JSON.stringify(this.progress));
        localStorage.setItem('sb_stats', JSON.stringify(this.stats));
    }

    // Called after each hand
    recordHandResult(result) {
        this.stats.totalHands++;

        if (result.won) {
            this.stats.totalWins++;
            this.stats.currentStreak++;
            if (this.stats.currentStreak > this.stats.maxStreak) {
                this.stats.maxStreak = this.stats.currentStreak;
            }

            // Check win streak achievements
            this.checkAchievement('first_win');
            if (this.stats.currentStreak >= 3) this.checkAchievement('win_streak_3');
            if (this.stats.currentStreak >= 5) this.checkAchievement('win_streak_5');
            if (this.stats.currentStreak >= 10) this.checkAchievement('win_streak_10');
        } else if (result.lost) {
            this.stats.currentStreak = 0;
        }

        if (result.blackjack) {
            this.stats.blackjacks++;
            this.checkAchievement('blackjack');
            this.updateProgress('blackjack_10', this.stats.blackjacks);
        }

        if (result.doubleWin) {
            this.stats.doubleWins++;
            this.checkAchievement('double_win');
        }

        if (result.splitWin) {
            this.stats.splitWins++;
            this.checkAchievement('split_win');
        }

        if (result.insuranceSave) {
            this.stats.insuranceSaves++;
            this.checkAchievement('insurance_save');
        }

        if (result.comeback) {
            this.checkAchievement('comeback');
        }

        // Check hands played milestones
        this.updateProgress('hands_50', this.stats.totalHands);
        this.updateProgress('hands_100', this.stats.totalHands);
        this.updateProgress('hands_500', this.stats.totalHands);

        this.save();
    }

    // Called when chips change
    checkChipsAchievements(chips) {
        this.updateProgress('chips_1000', chips);
        this.updateProgress('chips_5000', chips);
        this.updateProgress('chips_10000', chips);
    }

    // Called when skins change
    checkSkinAchievements(unlockedCount) {
        this.updateProgress('skin_collector', unlockedCount);
    }

    checkAchievement(achievementId) {
        if (this.isUnlocked(achievementId)) return false;

        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement) return false;

        this.unlocked.push(achievementId);
        this.save();
        this.showUnlockNotification(achievement);

        // Award gems
        if (this.economy && achievement.reward > 0) {
            this.economy.addGems(achievement.reward);
        }

        return true;
    }

    updateProgress(achievementId, value) {
        if (this.isUnlocked(achievementId)) return;

        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement || achievement.type !== 'milestone') return;

        this.progress[achievementId] = value;

        if (value >= achievement.target) {
            this.checkAchievement(achievementId);
        }
    }

    showUnlockNotification(achievement) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-reward">+${achievement.reward} <i class="fa-regular fa-gem"></i></div>
            </div>
        `;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);

        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    renderAchievementsPanel() {
        const container = document.getElementById('achievements-grid');
        if (!container) return;

        container.innerHTML = '';

        this.achievements.forEach(achievement => {
            const isUnlocked = this.isUnlocked(achievement.id);
            const progress = this.getProgress(achievement.id);

            const item = document.createElement('div');
            item.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;

            let progressHTML = '';
            if (achievement.type === 'milestone' && !isUnlocked) {
                const percent = Math.min(100, (progress / achievement.target) * 100);
                progressHTML = `
                    <div class="achievement-progress">
                        <div class="progress-bar" style="width: ${percent}%"></div>
                        <span>${progress}/${achievement.target}</span>
                    </div>
                `;
            }

            item.innerHTML = `
                <div class="achievement-icon ${isUnlocked ? '' : 'locked'}">${isUnlocked ? achievement.icon : '🔒'}</div>
                <div class="achievement-details">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                    ${progressHTML}
                    <div class="achievement-reward">${achievement.reward} <i class="fa-regular fa-gem"></i></div>
                </div>
            `;

            container.appendChild(item);
        });
    }

    getStats() {
        return this.stats;
    }

    getUnlockedCount() {
        return this.unlocked.length;
    }

    getTotalCount() {
        return this.achievements.length;
    }
}
