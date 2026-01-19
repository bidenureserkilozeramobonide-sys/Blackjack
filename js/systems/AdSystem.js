window.AdSystem = class AdSystem {
    constructor(economyManager) {
        this.economy = economyManager;
    }

    watchAd() {
        // Mock Ad Logic
        console.log("Ad request started...");

        // Disable button visually (optional)
        const btn = document.activeElement;
        if (btn) btn.disabled = true;

        setTimeout(() => {
            console.log("Ad finished.");
            if (btn) btn.disabled = false;

            // Reward
            this.economy.addGems(5);
            alert("Thanks for watching! +5 Gems");
        }, 1500);
    }
}
