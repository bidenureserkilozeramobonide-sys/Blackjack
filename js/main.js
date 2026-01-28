console.log("Spectral Blackjack Initialized");

window.addEventListener('DOMContentLoaded', () => {
    try {
        console.log("Starting Game Initialization...");

        // Core managers
        const economy = new window.EconomyManager();
        const shop = new window.ShopManager(economy);
        const audio = new window.AudioManager();
        const achievements = new window.AchievementManager(economy);
        const dailyBonus = new window.DailyBonusManager(economy);
        const stats = new window.StatsManager();

        // Phase 7 Priorité 1 managers
        const questsManager = new window.QuestManager(economy, achievements);
        const wheelManager = new window.WheelManager(economy);
        const themesManager = new window.ThemeManager();
        const avatarsManager = new window.AvatarManager();
        const historyManager = new window.HistoryManager();

        // Phase 7 Priorité 2 managers
        const hapticManager = new window.HapticManager();
        const notificationManager = new window.NotificationManager();

        // Phase 8 managers - Visual Effects
        const animationManager = new window.AnimationManager();
        const effectsManager = new window.EffectsManager();

        // Create game instance
        const gameInstance = new window.GameManager(economy, shop, audio);
        gameInstance.achievements = achievements;
        gameInstance.stats = stats;
        gameInstance.quests = questsManager;
        gameInstance.history = historyManager;
        gameInstance.haptics = hapticManager;
        gameInstance.animations = animationManager;
        gameInstance.effects = effectsManager;

        // Gestures need game reference
        const gesturesManager = new window.GestureManager(gameInstance);

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
            split: () => gameInstance.split(),
            takeInsurance: () => gameInstance.takeInsurance(),
            declineInsurance: () => gameInstance.declineInsurance(),
            resetRound: () => gameInstance.resetRound(),
            audio: audio,
            haptics: hapticManager
        };

        window.ui = {
            toggleShop: (show) => {
                const el = document.getElementById('shop-overlay');
                if (show) {
                    el.classList.remove('hidden');
                    window.ui.switchTab('wheel');
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

                // Render dynamic content when switching tabs
                switch (tabName) {
                    case 'wheel':
                        wheelManager.renderWheel();
                        break;
                    case 'achievements':
                        achievements.renderAchievementsPanel();
                        break;
                    case 'stats':
                        stats.renderStatsPanel();
                        break;
                    case 'quests':
                        questsManager.renderQuestsPanel();
                        break;
                    case 'themes':
                        themesManager.renderThemesPanel();
                        break;
                    case 'avatars':
                        avatarsManager.renderAvatarsPanel();
                        break;
                    case 'history':
                        historyManager.renderHistoryPanel();
                        break;
                }
            },
        };

        window.ads = {
            watchAd: () => ads.watchAd()
        };

        window.iap = {
            buyPack: (sku) => iap.buyPack(sku)
        };

        // Global references for onclick handlers
        window.economy = economy;
        window.achievements = achievements;
        window.dailyBonus = dailyBonus;
        window.stats = stats;
        window.quests = questsManager;
        window.wheel = wheelManager;
        window.themes = themesManager;
        window.avatars = avatarsManager;
        window.history = historyManager;
        window.gestures = gesturesManager;
        window.haptics = hapticManager;
        window.notifications = notificationManager;

        // Initialize avatar display
        avatarsManager.updateDisplay();

        // Check for daily bonus on startup
        dailyBonus.checkOnStartup();

        // Request notification permission
        notificationManager.requestPermission();

        console.log("Game Initialization Complete. All Phase 7 features loaded.");
    } catch (e) {
        console.error("FATAL ERROR IN MAIN:", e);
    }
});
