window.DailyBonusManager = class DailyBonusManager {
    constructor(economyManager) {
        this.economy = economyManager;

        // Load saved data
        this.lastClaimDate = localStorage.getItem('sb_daily_last_claim');
        this.currentStreak = parseInt(localStorage.getItem('sb_daily_streak')) || 0;

        // Bonus tiers based on streak
        this.bonusTiers = [
            { day: 1, chips: 50, gems: 1 },
            { day: 2, chips: 75, gems: 1 },
            { day: 3, chips: 100, gems: 2 },
            { day: 4, chips: 150, gems: 2 },
            { day: 5, chips: 200, gems: 3 },
            { day: 6, chips: 300, gems: 4 },
            { day: 7, chips: 500, gems: 5 }  // Weekly bonus
        ];
    }

    canClaim() {
        if (!this.lastClaimDate) return true;

        const now = new Date();
        const lastClaim = new Date(this.lastClaimDate);

        // Check if it's a new day
        const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastDate = new Date(lastClaim.getFullYear(), lastClaim.getMonth(), lastClaim.getDate());

        return nowDate > lastDate;
    }

    isStreakBroken() {
        if (!this.lastClaimDate) return false;

        const now = new Date();
        const lastClaim = new Date(this.lastClaimDate);

        // More than 48 hours = streak broken
        const hoursDiff = (now - lastClaim) / (1000 * 60 * 60);
        return hoursDiff > 48;
    }

    claim() {
        if (!this.canClaim()) {
            return { success: false, message: 'Already claimed today!' };
        }

        // Check if streak is broken
        if (this.isStreakBroken()) {
            this.currentStreak = 0;
        }

        // Increment streak
        this.currentStreak++;
        if (this.currentStreak > 7) this.currentStreak = 1; // Reset after week

        // Get bonus for current streak day
        const tierIndex = Math.min(this.currentStreak, 7) - 1;
        const bonus = this.bonusTiers[tierIndex];

        // Award bonus
        if (this.economy) {
            this.economy.addChips(bonus.chips);
            this.economy.addGems(bonus.gems);
        }

        // Save
        this.lastClaimDate = new Date().toISOString();
        localStorage.setItem('sb_daily_last_claim', this.lastClaimDate);
        localStorage.setItem('sb_daily_streak', this.currentStreak.toString());

        return {
            success: true,
            day: this.currentStreak,
            chips: bonus.chips,
            gems: bonus.gems,
            message: `Day ${this.currentStreak} Bonus!`
        };
    }

    getTimeUntilNextBonus() {
        if (this.canClaim()) return 0;

        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        return tomorrow - now; // milliseconds
    }

    getCurrentStreak() {
        return this.currentStreak;
    }

    getNextBonus() {
        const nextDay = this.currentStreak >= 7 ? 1 : this.currentStreak + 1;
        return this.bonusTiers[nextDay - 1];
    }

    showDailyBonusPopup() {
        // Check if can claim
        if (!this.canClaim()) {
            this.showCountdown();
            return;
        }

        // Create popup
        const popup = document.createElement('div');
        popup.className = 'daily-bonus-popup';
        popup.id = 'daily-bonus-popup';

        const nextBonus = this.getNextBonus();
        const streakDay = this.currentStreak + 1;

        popup.innerHTML = `
            <div class="daily-bonus-content">
                <div class="daily-bonus-header">
                    <span class="daily-bonus-icon">🎁</span>
                    <h2>Daily Bonus!</h2>
                </div>
                <div class="daily-bonus-streak">Day ${streakDay > 7 ? 1 : streakDay} Streak</div>
                <div class="daily-bonus-rewards">
                    <div class="reward-item">
                        <span class="reward-value">${nextBonus.chips}</span>
                        <span class="reward-label"><i class="fa-solid fa-coins"></i> Chips</span>
                    </div>
                    <div class="reward-item">
                        <span class="reward-value">${nextBonus.gems}</span>
                        <span class="reward-label"><i class="fa-regular fa-gem"></i> Gems</span>
                    </div>
                </div>
                <button class="daily-bonus-claim" onclick="dailyBonus.claimAndClose()">CLAIM!</button>
                <div class="daily-bonus-streak-display">
                    ${this.bonusTiers.map((tier, i) => `
                        <div class="streak-day ${i < this.currentStreak ? 'completed' : ''} ${i === (streakDay > 7 ? 0 : streakDay - 1) ? 'current' : ''}">
                            <span>Day ${i + 1}</span>
                            <span>${tier.chips}💰</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(popup);

        // Animate in
        setTimeout(() => popup.classList.add('show'), 100);
    }

    showCountdown() {
        const time = this.getTimeUntilNextBonus();
        const hours = Math.floor(time / (1000 * 60 * 60));
        const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));

        alert(`Next bonus in: ${hours}h ${minutes}m`);
    }

    claimAndClose() {
        const result = this.claim();

        if (result.success) {
            // Play sound if available
            if (window.game && window.game.audio) {
                window.game.audio.play('achievement');
            }

            // Update economy display
            if (this.economy) {
                this.economy.updateDisplay();
            }
        }

        // Close popup
        const popup = document.getElementById('daily-bonus-popup');
        if (popup) {
            popup.classList.remove('show');
            setTimeout(() => popup.remove(), 300);
        }

        return result;
    }

    // Check on game start if should show popup
    checkOnStartup() {
        if (this.canClaim()) {
            setTimeout(() => this.showDailyBonusPopup(), 1000);
        }
    }
}
