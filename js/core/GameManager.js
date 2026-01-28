console.log('[GameManager] Version 11 loaded at', new Date().toISOString());

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

        // Insurance & Split properties
        this.insuranceBet = 0;
        this.hasInsurance = false;
        this.splitHand = null; // Second hand if split
        this.activeHandIndex = 0; // 0 = main hand, 1 = split hand
        this.isSplit = false;
        this.splitBet = 0;

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

        // Hide previous result message and controls
        const msg = document.getElementById('message-display');
        if (msg) msg.classList.add('hidden');

        const restartCtrl = document.getElementById('restart-controls');
        if (restartCtrl) {
            restartCtrl.classList.add('hidden');
            restartCtrl.style.display = '';
        }

        const actionCtrl = document.getElementById('action-controls');
        if (actionCtrl) {
            actionCtrl.classList.add('hidden');
            actionCtrl.style.display = '';
        }

        // Reset split/insurance state
        this.insuranceBet = 0;
        this.hasInsurance = false;
        this.splitHand = null;
        this.isSplit = false;
        this.splitBet = 0;
        this.activeHandIndex = 0;

        // Initial Deal
        this.playerHand.addCard(this.deck.draw());
        this.dealerHand.addCard(this.deck.draw());
        this.playerHand.addCard(this.deck.draw());
        this.dealerHand.addCard(this.deck.draw());

        if (this.audio) this.audio.play('card_flip');

        // Insurance disabled - go directly to player turn
        // (Original code checked if dealer shows Ace and offered insurance)

        this.proceedAfterInsurance();
    }

    offerInsurance() {
        // Show insurance prompt
        this.state = 'INSURANCE_OFFER';
        document.getElementById('betting-controls').classList.add('hidden');
        document.getElementById('action-controls').classList.add('hidden');
        document.getElementById('insurance-controls').classList.remove('hidden');
        this.updateUI();
    }

    takeInsurance() {
        // Insurance costs half the original bet
        const insuranceCost = Math.floor(this.currentBet / 2);

        if (this.economy && !this.economy.spendChips(insuranceCost)) {
            alert("Not enough chips for insurance!");
            return;
        }

        this.insuranceBet = insuranceCost;
        this.hasInsurance = true;
        if (this.audio) this.audio.play('chip_place');

        document.getElementById('insurance-controls').classList.add('hidden');
        this.proceedAfterInsurance();
    }

    declineInsurance() {
        this.hasInsurance = false;
        this.insuranceBet = 0;
        document.getElementById('insurance-controls').classList.add('hidden');
        this.proceedAfterInsurance();
    }

    proceedAfterInsurance() {
        // Check if dealer has blackjack
        if (this.dealerHand.isBlackjack()) {
            // Dealer has blackjack!
            if (this.hasInsurance) {
                // Insurance pays 2:1
                const payout = this.insuranceBet * 3;
                if (this.economy) this.economy.addChips(payout);
            }
            this.state = 'RESULT';
            this.resolveGame();
            return;
        }

        // Dealer doesn't have blackjack, insurance is lost
        // (chips already spent, no refund)

        if (this.playerHand.isBlackjack()) {
            this.state = 'RESULT';
            this.resolveGame();
        } else {
            this.state = 'PLAYER_TURN';
            document.getElementById('betting-controls').classList.add('hidden');
            document.getElementById('action-controls').classList.remove('hidden');
            this.updateSplitButton();
        }

        this.updateUI();
    }

    canSplit() {
        // Can only split on first action with exactly 2 cards of same rank
        if (this.isSplit) return false;
        if (this.playerHand.cards.length !== 2) return false;
        return this.playerHand.cards[0].rank === this.playerHand.cards[1].rank;
    }

    updateSplitButton() {
        const splitBtn = document.getElementById('split-btn');
        if (splitBtn) {
            if (this.canSplit() && this.economy && this.economy.chips >= this.currentBet) {
                splitBtn.classList.remove('hidden');
            } else {
                splitBtn.classList.add('hidden');
            }
        }
    }

    split() {
        if (this.state !== 'PLAYER_TURN' || !this.canSplit()) return;

        // Check if player has enough chips for split bet
        if (this.economy && !this.economy.spendChips(this.currentBet)) {
            alert("Not enough chips to split!");
            return;
        }

        this.splitBet = this.currentBet;
        this.isSplit = true;

        // Create split hand with second card
        this.splitHand = new window.Hand('split-cards', 'split-score');
        this.splitHand.addCard(this.playerHand.cards.pop());

        // Draw new cards for each hand
        this.playerHand.addCard(this.deck.draw());
        this.splitHand.addCard(this.deck.draw());

        if (this.audio) this.audio.play('card_flip');

        // Show split area
        document.getElementById('split-area').classList.remove('hidden');

        // Hide split button
        document.getElementById('split-btn').classList.add('hidden');

        // Start playing first hand
        this.activeHandIndex = 0;
        this.highlightActiveHand();
        this.updateUI();
    }

    highlightActiveHand() {
        const playerArea = document.getElementById('player-area');
        const splitArea = document.getElementById('split-area');

        if (this.activeHandIndex === 0) {
            playerArea.classList.add('active-hand');
            if (splitArea) splitArea.classList.remove('active-hand');
        } else {
            playerArea.classList.remove('active-hand');
            if (splitArea) splitArea.classList.add('active-hand');
        }
    }

    getActiveHand() {
        return this.activeHandIndex === 0 ? this.playerHand : this.splitHand;
    }

    hit() {
        if (this.state !== 'PLAYER_TURN') return;

        const activeHand = this.getActiveHand();
        activeHand.addCard(this.deck.draw());
        if (this.audio) this.audio.play('card_flip');

        if (activeHand.isBusted()) {
            // Hand busted, check if we have another hand to play
            if (this.isSplit && this.activeHandIndex === 0) {
                // Move to split hand
                this.activeHandIndex = 1;
                this.highlightActiveHand();
            } else {
                // All hands done
                this.state = 'DEALER_TURN';
                this.dealerTurn();
            }
        } else if (activeHand.getScore() === 21) {
            // Auto-stand at 21
            if (this.audio) this.audio.play('win');
            this.stand();
        }
        this.updateUI();
    }

    doubleDown() {
        if (this.state !== 'PLAYER_TURN') return;
        // Only on first action (2 cards)
        if (this.playerHand.cards.length !== 2) return;

        // Check if player has enough chips
        if (this.economy && !this.economy.spendChips(this.currentBet)) {
            alert("Not enough chips to Double Down!");
            return;
        }

        // Track for achievements
        this.isDoubledDown = true;

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

        // If split and on first hand, move to second hand
        if (this.isSplit && this.activeHandIndex === 0) {
            this.activeHandIndex = 1;
            this.highlightActiveHand();
            this.updateUI();
            return;
        }

        // All hands complete, dealer's turn
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

        // Force UI controls update after everything else
        document.getElementById('action-controls').classList.add('hidden');
        document.getElementById('restart-controls').classList.remove('hidden');
    }

    resolveGame() {
        const dScore = this.dealerHand.getScore();
        const dBust = this.dealerHand.isBusted();

        let totalWinnings = 0;
        let results = [];

        const resolveHand = (hand, bet, handName) => {
            const pScore = hand.getScore();
            const pBust = hand.isBusted();

            if (pBust) {
                return { result: `${handName}: Bust`, class: 'lose', payout: 0 };
            } else if (dBust) {
                return { result: `${handName}: Win!`, class: 'win', payout: bet * 2 };
            } else if (pScore > dScore) {
                return { result: `${handName}: Win!`, class: 'win', payout: bet * 2 };
            } else if (dScore > pScore) {
                return { result: `${handName}: Lose`, class: 'lose', payout: 0 };
            } else {
                return { result: `${handName}: Push`, class: 'push', payout: bet };
            }
        };

        const mainResult = resolveHand(this.playerHand, this.currentBet, this.isSplit ? 'Hand 1' : '');
        results.push(mainResult);
        totalWinnings += mainResult.payout;

        if (this.isSplit && this.splitHand) {
            const splitResult = resolveHand(this.splitHand, this.splitBet, 'Hand 2');
            results.push(splitResult);
            totalWinnings += splitResult.payout;
        }

        if (this.economy && totalWinnings > 0) {
            this.economy.addChips(totalWinnings);
        }

        let resultText = '';
        let resultClass = 'push';

        if (this.isSplit) {
            resultText = results.map(r => r.result).join(' | ');
            const wins = results.filter(r => r.class === 'win').length;
            const losses = results.filter(r => r.class === 'lose').length;
            if (wins > losses) resultClass = 'win';
            else if (losses > wins) resultClass = 'lose';
        } else {
            resultText = mainResult.class === 'win' ? 'You Win!' :
                mainResult.class === 'lose' ? 'Dealer Wins.' : 'Push (Tie).';
            resultClass = mainResult.class;
        }

        if (this.audio) {
            if (resultClass === 'win') this.audio.play('win');
            else if (resultClass === 'lose') this.audio.play('lose');
            else this.audio.play('push');
        }

        console.log(resultText);
        const msg = document.getElementById('message-display');
        if (msg) {
            msg.innerText = resultText;
            msg.className = "message " + resultClass;
            msg.classList.remove('hidden');
        }

        // Visual effects based on result
        if (resultClass === "win") {
            document.getElementById('player-area').classList.add('win-effect');

            // Check for blackjack special effect
            if (this.playerHand.isBlackjack()) {
                if (this.effects) this.effects.showBlackjackEffect();
            } else if (totalWinnings >= this.currentBet * 2) {
                // Big win effect for double or more
                if (this.effects) this.effects.showBigWinEffect(totalWinnings);
            } else {
                // Normal win confetti
                if (this.effects) this.effects.showConfetti('medium');
            }
        } else if (resultClass === "lose" && this.playerHand.isBusted()) {
            // Bust effect
            if (this.effects) this.effects.showBustEffect();
            if (this.animations) this.animations.shake(document.getElementById('player-cards'));
        }

        // Track achievements
        if (this.achievements) {
            const isBlackjack = this.playerHand.isBlackjack();
            const splitWinBoth = this.isSplit && results.every(r => r.class === 'win');

            this.achievements.recordHandResult({
                won: resultClass === 'win',
                lost: resultClass === 'lose',
                blackjack: isBlackjack,
                doubleWin: this.isDoubledDown && resultClass === 'win',
                splitWin: splitWinBoth,
                insuranceSave: this.hasInsurance && this.dealerHand.isBlackjack(),
                comeback: this.wasAtZeroChips && resultClass === 'win'
            });

            // Check chip milestones
            if (this.economy) {
                this.achievements.checkChipsAchievements(this.economy.chips);
            }
        }

        // Track stats
        if (this.stats) {
            this.stats.recordHand({
                won: resultClass === 'win',
                lost: resultClass === 'lose',
                blackjack: this.playerHand.isBlackjack(),
                busted: this.playerHand.isBusted(),
                doubled: this.isDoubledDown,
                split: this.isSplit,
                insuranceWin: this.hasInsurance && this.dealerHand.isBlackjack(),
                payout: totalWinnings,
                betLost: resultClass === 'lose' ? this.currentBet : 0
            });
        }

        // Track quests
        if (this.quests) {
            this.quests.recordHandResult({
                won: resultClass === 'win',
                lost: resultClass === 'lose',
                blackjack: this.playerHand.isBlackjack(),
                doubleWin: this.isDoubledDown && resultClass === 'win',
                split: this.isSplit,
                chipsEarned: totalWinnings,
                usedInsurance: this.hasInsurance
            });
        }

        // Record in history
        if (this.history) {
            this.history.recordHand({
                playerCards: this.playerHand.cards,
                dealerCards: this.dealerHand.cards,
                playerScore: this.playerHand.getScore(),
                dealerScore: this.dealerHand.getScore(),
                bet: this.currentBet,
                result: this.playerHand.isBlackjack() && resultClass === 'win' ? 'blackjack' : resultClass,
                payout: totalWinnings,
                wasDoubled: this.isDoubledDown,
                wasSplit: this.isSplit
            });
        }

        // Force hide action controls and show restart controls
        const actionCtrl = document.getElementById('action-controls');
        const restartCtrl = document.getElementById('restart-controls');

        console.log('resolveGame: actionCtrl=', actionCtrl, 'restartCtrl=', restartCtrl);

        if (actionCtrl) {
            actionCtrl.classList.add('hidden');
            actionCtrl.style.display = 'none'; // Force hide
        }
        if (restartCtrl) {
            restartCtrl.classList.remove('hidden');
            restartCtrl.style.display = 'flex'; // Force show
        }
    }

    resetRound() {
        this.state = 'BETTING';
        document.getElementById('message-display').classList.add('hidden');

        // Reset controls with inline style cleanup
        const restartCtrl = document.getElementById('restart-controls');
        const actionCtrl = document.getElementById('action-controls');
        const bettingCtrl = document.getElementById('betting-controls');

        if (restartCtrl) {
            restartCtrl.classList.add('hidden');
            restartCtrl.style.display = '';
        }
        if (actionCtrl) {
            actionCtrl.classList.add('hidden');
            actionCtrl.style.display = '';
        }
        if (bettingCtrl) {
            bettingCtrl.classList.remove('hidden');
        }

        document.getElementById('player-area').classList.remove('win-effect');
        document.getElementById('player-area').classList.remove('active-hand');

        // Reset split UI
        const splitArea = document.getElementById('split-area');
        if (splitArea) {
            splitArea.classList.add('hidden');
            splitArea.classList.remove('active-hand');
            const splitCards = document.getElementById('split-cards');
            if (splitCards) splitCards.innerHTML = '';
        }

        this.playerHand.reset();
        this.dealerHand.reset();
        if (this.splitHand) this.splitHand = null;
        this.isSplit = false;
        this.splitBet = 0;
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

        const betDisplay = document.getElementById('current-bet-display');
        if (betDisplay) betDisplay.innerText = this.currentBet;

        this.renderHand(this.playerHand);
        this.renderHand(this.dealerHand, this.state === 'PLAYER_TURN' || this.state === 'INSURANCE_OFFER');

        // Render split hand if exists
        if (this.isSplit && this.splitHand) {
            this.renderHand(this.splitHand);
        }
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
