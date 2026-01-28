window.EconomyManager = class EconomyManager {
    constructor() {
        this.chips = 1000;
        this.gems = 0;
        this.load();
        this.updateDisplay();
    }

    load() {
        const savedChips = localStorage.getItem('sb_chips');
        const savedGems = localStorage.getItem('sb_gems');

        if (savedChips !== null) this.chips = parseInt(savedChips);
        if (savedGems !== null) this.gems = parseInt(savedGems);
    }

    save() {
        localStorage.setItem('sb_chips', this.chips);
        localStorage.setItem('sb_gems', this.gems);
        this.updateDisplay();
    }

    updateDisplay() {
        const chipEl = document.getElementById('chip-balance');
        const gemEl = document.getElementById('gem-balance');
        if (chipEl) chipEl.innerText = this.chips;
        if (gemEl) gemEl.innerText = this.gems;
    }

    addChips(amount) {
        this.chips += amount;
        this.save();
    }

    spendChips(amount) {
        if (this.chips >= amount) {
            this.chips -= amount;
            this.save();
            return true;
        }
        return false;
    }

    addGems(amount) {
        this.gems += amount;
        this.save();
    }

    spendGems(amount) {
        if (this.gems >= amount) {
            this.gems -= amount;
            this.save();
            return true;
        }
        return false;
    }

    exchangeGemsForChips(gemCost, chipAmount) {
        if (this.spendGems(gemCost)) {
            this.addChips(chipAmount);
            return true;
        }
        return false;
    }

    checkBankruptcy() {
        if (this.chips <= 0) {
            this.chips = 100;
            this.save();
            // Optional: alert or UI feedback could go here, but kept silent for smoother flow or handled by caller
            return true; // Returned true to indicate bankruptcy rescue happened
        }
        return false;
    }
}
