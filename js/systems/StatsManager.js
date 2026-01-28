window.StatsManager = class StatsManager {
    constructor() {
        this.loadStats();
    }

    loadStats() {
        const saved = localStorage.getItem('sb_player_stats');
        this.stats = saved ? JSON.parse(saved) : this.getDefaultStats();
    }

    getDefaultStats() {
        return {
            totalHands: 0,
            wins: 0,
            losses: 0,
            pushes: 0,
            blackjacks: 0,
            busts: 0,
            doubleDowns: 0,
            splits: 0,
            insuranceWins: 0,
            totalChipsWon: 0,
            totalChipsLost: 0,
            biggestWin: 0,
            currentStreak: 0,
            bestStreak: 0,
            sessionStart: Date.now(),
            totalPlayTime: 0, // in seconds
            lastPlayed: null
        };
    }

    save() {
        localStorage.setItem('sb_player_stats', JSON.stringify(this.stats));
    }

    recordHand(result) {
        this.stats.totalHands++;
        this.stats.lastPlayed = new Date().toISOString();

        if (result.won) {
            this.stats.wins++;
            this.stats.currentStreak++;
            if (this.stats.currentStreak > this.stats.bestStreak) {
                this.stats.bestStreak = this.stats.currentStreak;
            }
            if (result.payout > 0) {
                this.stats.totalChipsWon += result.payout;
                if (result.payout > this.stats.biggestWin) {
                    this.stats.biggestWin = result.payout;
                }
            }
        } else if (result.lost) {
            this.stats.losses++;
            this.stats.currentStreak = 0;
            if (result.betLost > 0) {
                this.stats.totalChipsLost += result.betLost;
            }
        } else {
            this.stats.pushes++;
        }

        if (result.blackjack) this.stats.blackjacks++;
        if (result.busted) this.stats.busts++;
        if (result.doubled) this.stats.doubleDowns++;
        if (result.split) this.stats.splits++;
        if (result.insuranceWin) this.stats.insuranceWins++;

        this.save();
    }

    getWinRate() {
        if (this.stats.totalHands === 0) return 0;
        return ((this.stats.wins / this.stats.totalHands) * 100).toFixed(1);
    }

    getNetProfit() {
        return this.stats.totalChipsWon - this.stats.totalChipsLost;
    }

    renderStatsPanel() {
        const container = document.getElementById('stats-grid');
        if (!container) return;

        const winRate = this.getWinRate();
        const netProfit = this.getNetProfit();
        const profitClass = netProfit >= 0 ? 'positive' : 'negative';

        container.innerHTML = `
            <div class="stat-section">
                <h3><i class="fa-solid fa-chart-line"></i> Game Stats</h3>
                <div class="stat-row">
                    <span class="stat-label">Total Hands</span>
                    <span class="stat-value">${this.stats.totalHands.toLocaleString()}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Win Rate</span>
                    <span class="stat-value">${winRate}%</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Wins / Losses / Pushes</span>
                    <span class="stat-value">${this.stats.wins} / ${this.stats.losses} / ${this.stats.pushes}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Best Win Streak</span>
                    <span class="stat-value">${this.stats.bestStreak}</span>
                </div>
            </div>

            <div class="stat-section">
                <h3><i class="fa-solid fa-coins"></i> Economy</h3>
                <div class="stat-row">
                    <span class="stat-label">Net Profit</span>
                    <span class="stat-value ${profitClass}">${netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString()}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Biggest Win</span>
                    <span class="stat-value">${this.stats.biggestWin.toLocaleString()}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Total Won</span>
                    <span class="stat-value positive">+${this.stats.totalChipsWon.toLocaleString()}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Total Lost</span>
                    <span class="stat-value negative">-${this.stats.totalChipsLost.toLocaleString()}</span>
                </div>
            </div>

            <div class="stat-section">
                <h3><i class="fa-solid fa-star"></i> Special Plays</h3>
                <div class="stat-row">
                    <span class="stat-label">Blackjacks</span>
                    <span class="stat-value">${this.stats.blackjacks}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Double Downs</span>
                    <span class="stat-value">${this.stats.doubleDowns}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Splits</span>
                    <span class="stat-value">${this.stats.splits}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Insurance Wins</span>
                    <span class="stat-value">${this.stats.insuranceWins}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Busts</span>
                    <span class="stat-value">${this.stats.busts}</span>
                </div>
            </div>
        `;
    }

    resetStats() {
        if (confirm('Are you sure you want to reset all stats? This cannot be undone.')) {
            this.stats = this.getDefaultStats();
            this.save();
            this.renderStatsPanel();
        }
    }
}
