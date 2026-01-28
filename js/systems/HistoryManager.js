window.HistoryManager = class HistoryManager {
    constructor() {
        this.maxHistory = 20;
        this.load();
    }

    load() {
        const saved = localStorage.getItem('sb_hand_history');
        this.history = saved ? JSON.parse(saved) : [];
    }

    save() {
        localStorage.setItem('sb_hand_history', JSON.stringify(this.history));
    }

    recordHand(handData) {
        const record = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            playerCards: handData.playerCards.map(c => ({ suit: c.suit, rank: c.rank })),
            dealerCards: handData.dealerCards.map(c => ({ suit: c.suit, rank: c.rank })),
            playerScore: handData.playerScore,
            dealerScore: handData.dealerScore,
            bet: handData.bet,
            result: handData.result, // 'win', 'lose', 'push', 'blackjack'
            payout: handData.payout,
            wasDoubled: handData.wasDoubled || false,
            wasSplit: handData.wasSplit || false
        };

        this.history.unshift(record);

        // Keep only last 20
        if (this.history.length > this.maxHistory) {
            this.history = this.history.slice(0, this.maxHistory);
        }

        this.save();
    }

    getHistory() {
        return this.history;
    }

    clearHistory() {
        if (confirm('Clear all hand history?')) {
            this.history = [];
            this.save();
            this.renderHistoryPanel();
        }
    }

    formatCard(card) {
        const suitSymbols = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
        const suitColors = { hearts: '#e74c3c', diamonds: '#e74c3c', clubs: '#2c3e50', spades: '#2c3e50' };
        return `<span style="color:${suitColors[card.suit]}">${card.rank}${suitSymbols[card.suit]}</span>`;
    }

    formatTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    renderHistoryPanel() {
        const container = document.getElementById('history-grid');
        if (!container) return;

        if (this.history.length === 0) {
            container.innerHTML = '<div class="history-empty">No hands played yet!</div>';
            return;
        }

        container.innerHTML = `
            <div class="history-header">
                <span>Last ${this.history.length} hands</span>
                <button class="history-clear-btn" onclick="history.clearHistory()">Clear</button>
            </div>
            <div class="history-list">
                ${this.history.map(hand => `
                    <div class="history-item ${hand.result}">
                        <div class="history-time">${this.formatTime(hand.timestamp)}</div>
                        <div class="history-cards">
                            <div class="history-hand">
                                <span class="hand-label">You:</span>
                                ${hand.playerCards.map(c => this.formatCard(c)).join(' ')}
                                <span class="hand-score">(${hand.playerScore})</span>
                            </div>
                            <div class="history-hand">
                                <span class="hand-label">Dealer:</span>
                                ${hand.dealerCards.map(c => this.formatCard(c)).join(' ')}
                                <span class="hand-score">(${hand.dealerScore})</span>
                            </div>
                        </div>
                        <div class="history-result">
                            <span class="result-badge ${hand.result}">${hand.result.toUpperCase()}</span>
                            ${hand.wasDoubled ? '<span class="tag">2x</span>' : ''}
                            ${hand.wasSplit ? '<span class="tag">Split</span>' : ''}
                        </div>
                        <div class="history-payout">
                            ${hand.result === 'win' || hand.result === 'blackjack' ?
                `<span class="payout positive">+${hand.payout}</span>` :
                hand.result === 'lose' ?
                    `<span class="payout negative">-${hand.bet}</span>` :
                    `<span class="payout neutral">0</span>`
            }
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}
