console.log("Spectral Blackjack Initialized");

window.addEventListener('DOMContentLoaded', () => {
    try {
        console.log("Starting Game Initialization...");
        const economy = new window.EconomyManager();
        const shop = new window.ShopManager(economy);
        const audio = new window.AudioManager();

        // Pass economy, shop, and audio to GM
        const gameInstance = new window.GameManager(economy, shop, audio);

        const ads = new window.AdSystem(economy);
        const iap = new window.IAPSystem(economy);

        // Global scope for HTML onclick events
        window.game = {
            adjustBet: (amount) => gameInstance.adjustBet(amount),
            clearBet: () => gameInstance.clearBet(),
            placeBet: () => gameInstance.placeBet(),
            hit: () => gameInstance.hit(),
            stand: () => gameInstance.stand(),
            doubleDown: () => gameInstance.doubleDown(),
            resetRound: () => gameInstance.resetRound()
        };

        window.ui = {
            toggleShop: (show) => {
                const el = document.getElementById('shop-overlay');
                if (show) {
                    el.classList.remove('hidden');
                    // Default to currency tab
                    window.ui.switchTab('currency');
                } else {
                    el.classList.add('hidden');
                }
            },

            switchTab: (tabName) => {
                // Update Buttons
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.tab === tabName);
                });

                // Update Content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.toggle('active', content.id === `tab-${tabName}`);
                    content.classList.toggle('hidden', content.id !== `tab-${tabName}`);
                });
            },
        };

        window.ads = {
            watchAd: () => ads.watchAd()
        };

        window.iap = {
            buyPack: (sku) => iap.buyPack(sku)
        };
        console.log("Game Initialization Complete. Buttons should work.");
    } catch (e) {
        console.error("FATAL ERROR IN MAIN:", e);
    }
});
