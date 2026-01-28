window.GameManager = class GameManager {
    constructor(economyManager, shopManager, audioManager) {
        this.economy = economyManager;
        this.shop = shopManager;
        this.audio = audioManager;
        this.deck = new window.Deck();
        this.playerHand = new window.Hand('player-cards', 'player-score');
        this.dealerHand = new window.Hand('dealer-cards', 'dealer-score');

        this.state = 'BETTING'; // BETTING, DEALING, PLAYER_TURN, DEALER_TURN, RESULT
        this.currentBet = 10;

        this.deck.shuffle();
        this.updateUI();
    }

    adjustBet(amount) {
        if (this.state !== 'BETTING') return;
        if (this.currentBet + amount >= 0) {
            this.currentBet += amount;
            this.updateUI();

            // Toggle Text Visibility
            const table = document.querySelector('.game-table');
            if (this.currentBet > 0) table.classList.add('table-active');
            else table.classList.remove('table-active');

            // Visual Stack Logic
            if (amount > 0) {
                this.addVisualChip(amount);
                if (this.audio) this.audio.play('chip_place');
            }
            else if (amount < 0) this.removeVisualChip();
        }
    }

    clearBet() {
        if (this.state !== 'BETTING') return;
        this.currentBet = 0;
        this.updateUI();
        this.clearVisualStack();
        document.querySelector('.game-table').classList.remove('table-active');
    }

    addVisualChip(amount) {
        const container = document.getElementById('bet-stack-container');
        if (!container) return;

        // Smart Grouping: Find an existing column that matches 'amount' and isn't full
        let targetColumn = null;
        const columns = Array.from(container.children);

        for (let col of columns) {
            const firstChip = col.firstElementChild;
            // Check if column matches our chip type and has space (< 5)
            if (firstChip && firstChip.classList.contains(`chip-${amount}`)) {
                if (col.childElementCount < 5) {
                    targetColumn = col;
                    break;
                }
            }
        }

        if (!targetColumn) {
            targetColumn = document.createElement('div');
            targetColumn.className = `chip-column type-${amount}`;
            container.appendChild(targetColumn);
        }

        const chip = document.createElement('div');
        chip.className = `visual-chip chip-${amount}`;
        chip.innerText = amount;
        targetColumn.appendChild(chip);

        // Sort Stacks to ensure correct grouping CSS applies
        this.sortStacks();

        // Consolidation Logic
        this.consolidateChips();
    }

    sortStacks() {
        const container = document.getElementById('bet-stack-container');
        if (!container) return;

        const columns = Array.from(container.children);

        // Sort Descending (500 -> 100 -> 50 -> 25 -> 10)
        columns.sort((a, b) => {
            const valA = this.getColValue(a);
            const valB = this.getColValue(b);
            return valB - valA;
        });

        // Re-append in order
        columns.forEach(col => container.appendChild(col));
    }

    getColValue(col) {
        if (col.firstElementChild) {
            return parseInt(col.firstElementChild.innerText);
        }
        return 0;
    }

    consolidateChips() {
        // Count total value in stack
        // This is a visual-only consolidation for now, assuming the backing logic handles math.
        // Actually, we should just check the specific rules requested.
        // 5x 10 -> 50
        // 2x 25 -> 50
        // 2x 50 -> 100

        const container = document.getElementById('bet-stack-container');
        if (!container) return;

        // Helper to check for consolidation
        const checkAndConsolidate = () => {
            // We need to iterate through columns and check their counts
            const columns = Array.from(container.children);
            for (let col of columns) {
                const chips = col.children;
                if (chips.length === 0) continue;
                const firstVal = parseInt(chips[0].innerText);

                // Rule 1: 5x 10 -> 50
                if (firstVal === 10 && chips.length >= 5) {
                    this.replaceStack(col, 50, 5);
                    return true;
                }
                // Rule 2: 2x 25 -> 50
                if (firstVal === 25 && chips.length >= 2) {
                    this.replaceStack(col, 50, 2);
                    return true;
                }
                // Rule 3: 2x 50 -> 100
                if (firstVal === 50 && chips.length >= 2) {
                    this.replaceStack(col, 100, 2);
                    return true;
                }
                // Rule 4: 5x 100 -> 500
                if (firstVal === 100 && chips.length >= 5) {
                    this.replaceStack(col, 500, 5);
                    return true;
                }
            }
            return false;
        };

        // Run repeatedly until stable
        while (checkAndConsolidate()) { }
    }

    replaceStack(column, newValue, countToRemove) {
        // Remove 'countToRemove' chips from the column
        // If column becomes empty, remove it.
        // Then add the new chip value calls addVisualChip(newValue) recursively

        for (let i = 0; i < countToRemove; i++) {
            if (column.lastChild) column.removeChild(column.lastChild);
        }

        if (column.childElementCount === 0) {
            column.remove();
        }

        // Add the new consolidated chip
        // We call addVisualChip again, which will find the right place for it
        this.addVisualChip(newValue);
    }

    removeVisualChip() {
        const container = document.getElementById('bet-stack-container');
        if (!container) return;

        let currentColumn = container.lastElementChild;
        if (currentColumn) {
            if (currentColumn.lastChild) {
                currentColumn.removeChild(currentColumn.lastChild);
            }
            // If column is empty, remove it (unless it's the only one, but cleaner to remove)
            if (currentColumn.childElementCount === 0) {
                container.removeChild(currentColumn);
            }
        }
    }

    clearVisualStack() {
        const stack = document.getElementById('bet-stack-container');
        if (stack) stack.innerHTML = '';
    }

    placeBet() {
        if (this.state !== 'BETTING') return;
        if (this.currentBet <= 0) {
            alert("Please place a bet!");
            return;
        }

        if (this.economy && !this.economy.spendChips(this.currentBet)) {
            alert("Not enough chips!");
            return;
        }

        console.log(`Bet placed: ${this.currentBet}`);
        if (this.audio) this.audio.play('shuffle');
        this.startRound();
    }

    startRound() {
        this.state = 'DEALING';
        this.playerHand.reset();
        this.dealerHand.reset();

        // Initial Deal (Mock delay logic would go here in full app, instantaneous for logic test)
        this.playerHand.addCard(this.deck.draw());
        this.dealerHand.addCard(this.deck.draw());
        this.playerHand.addCard(this.deck.draw());
        this.dealerHand.addCard(this.deck.draw());

        if (this.audio) this.audio.play('card_flip');

        if (this.playerHand.isBlackjack()) {
            this.state = 'RESULT';
            this.resolveGame();
        } else {
            this.state = 'PLAYER_TURN';
            document.getElementById('betting-controls').classList.add('hidden');
            document.getElementById('action-controls').classList.remove('hidden');
        }

        this.updateUI();
    }

    hit() {
        if (this.state !== 'PLAYER_TURN') return;

        this.playerHand.addCard(this.deck.draw());
        if (this.audio) this.audio.play('card_flip');

        if (this.playerHand.isBusted()) {
            this.state = 'RESULT';
            this.resolveGame();
        }
        this.updateUI();
    }

    doubleDown() {
        if (this.state !== 'PLAYER_TURN') return;
        // Check if player has enough chips
        if (this.economy && !this.economy.spendChips(this.currentBet)) {
            alert("Not enough chips to Double Down!");
            return;
        }

        // Double the bet
        if (this.audio) this.audio.play('chip_place');
        this.currentBet *= 2;

        // Draw ONE card
        this.playerHand.addCard(this.deck.draw());
        if (this.audio) this.audio.play('card_flip');

        // Check Bust
        if (this.playerHand.isBusted()) {
            this.state = 'RESULT';
            this.resolveGame();
        } else {
            // Force Stand
            this.stand();
        }
        this.updateUI();
    }

    stand() {
        if (this.state !== 'PLAYER_TURN') return;
        this.state = 'DEALER_TURN';
        this.dealerTurn();
    }

    dealerTurn() {
        // Simple Dealer Logic: Hit until 17
        while (this.dealerHand.getScore() < 17) {
            this.dealerHand.addCard(this.deck.draw());
            if (this.audio) this.audio.play('card_flip');
        }
        this.state = 'RESULT';
        this.resolveGame();
        this.updateUI();
    }

    resolveGame() {
        const pScore = this.playerHand.getScore();
        const dScore = this.dealerHand.getScore();
        const pBust = this.playerHand.isBusted();
        const dBust = this.dealerHand.isBusted();
        let result = "";
        let resultClass = "";

        if (pBust) {
            result = "Busted! Dealer Wins.";
            resultClass = "lose";
            if (this.audio) this.audio.play('lose');
        }
        else if (dBust) {
            result = "Dealer Busted! You Win!";
            if (this.economy) this.economy.addChips(this.currentBet * 2);
            resultClass = "win";
            if (this.audio) this.audio.play('win');
        }
        else if (pScore > dScore) {
            result = "You Win!";
            if (this.economy) this.economy.addChips(this.currentBet * 2);
            resultClass = "win";
            if (this.audio) this.audio.play('win');
        }
        else if (dScore > pScore) {
            result = "Dealer Wins.";
            resultClass = "lose";
            if (this.audio) this.audio.play('lose');
        }
        else {
            result = "Push (Tie).";
            if (this.economy) this.economy.addChips(this.currentBet);
            resultClass = "push";
            if (this.audio) this.audio.play('push');
        }

        console.log(result);
        const msg = document.getElementById('message-display');
        if (msg) {
            msg.innerText = result;
            msg.className = "message " + resultClass; // Reset class
            msg.classList.remove('hidden');
        }

        // Apply visual to hand area
        if (resultClass === "win") {
            document.getElementById('player-area').classList.add('win-effect');
        }

        // Show Restart
        document.getElementById('action-controls').classList.add('hidden');
        document.getElementById('restart-controls').classList.remove('hidden');
    }

    resetRound() {
        this.state = 'BETTING';
        document.getElementById('message-display').classList.add('hidden');
        document.getElementById('restart-controls').classList.add('hidden');
        document.getElementById('betting-controls').classList.remove('hidden');
        document.getElementById('player-area').classList.remove('win-effect'); // Clear FX
        this.playerHand.reset();
        this.dealerHand.reset();
        this.clearVisualStack();
        this.updateUI();
    }

    // Temporary Direct UI manip for testing logic
    updateUI() {
        // Bankruptcy Check Hook
        // ONLY check in BETTING phase (when no active chips are on the table)
        if (this.state === 'BETTING' && this.economy && this.economy.checkBankruptcy()) {
            // If bankruptcy rescue happened, we could show a toast here. 
            // For now, let's just make sure the display updates.
            this.economy.updateDisplay();
            const msg = document.getElementById('message-display');
            if (msg) {
                msg.innerText = "Bankrupt! +100 Free Chips";
                msg.classList.remove('hidden');
                setTimeout(() => { if (this.state === 'BETTING') msg.classList.add('hidden'); }, 2000);
            }
        }

        // In a real system, this would emit events or call UIManager
        const betDisplay = document.getElementById('current-bet-display');
        if (betDisplay) betDisplay.innerText = this.currentBet;

        this.renderHand(this.playerHand);
        this.renderHand(this.dealerHand, this.state === 'PLAYER_TURN'); // Hide dealer hole card if player turn
    }

    renderHand(hand, hideHoleCard = false) {
        const container = document.getElementById(hand.ownerElementId);
        const scoreDisplay = document.getElementById(hand.scoreElementId);
        if (!container) return;

        container.innerHTML = '';
        hand.cards.forEach((card, index) => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card';
            if (this.shop) {
                const skinClass = this.shop.getActiveSkinClass();
                if (skinClass) cardDiv.classList.add(skinClass);
            }
            if (card.isRed()) cardDiv.classList.add('red');

            // Hide Dealer's first card logic
            if (hideHoleCard && hand === this.dealerHand && index === 0) {
                cardDiv.classList.add('face-down');
                // No inner content needed for face down due to CSS
            } else {
                const suitIcon = this.getSuitIcon(card.suit);
                cardDiv.innerHTML = `
                    <div class="card-corner top-left">
                        <span>${card.rank}</span>
                        <span>${suitIcon}</span>
                    </div>
                    <div class="card-center">${suitIcon}</div>
                    <div class="card-corner bottom-right">
                        <span>${card.rank}</span>
                        <span>${suitIcon}</span>
                    </div>
                `;
            }

            // Stagger animation
            cardDiv.style.animationDelay = `${index * 0.1}s`;

            container.appendChild(cardDiv);
        });

        if (scoreDisplay) {
            // Hide dealer score if hole card hidden
            if (hideHoleCard && hand === this.dealerHand) {
                scoreDisplay.innerText = "?";
            } else {
                scoreDisplay.innerText = hand.getScore();
            }
            scoreDisplay.classList.remove('hidden');
        }
    }

    getSuitIcon(suit) {
        switch (suit) {
            case 'Hearts': return '♥';
            case 'Diamonds': return '♦';
            case 'Clubs': return '♣';
            case 'Spades': return '♠';
        }
    }
}
