/**
 * AdSystem - Google AdMob Integration via Capacitor
 * Handles rewarded video ads for earning gems
 */
window.AdSystem = class AdSystem {
    constructor(economyManager) {
        this.economy = economyManager;
        this.isInitialized = false;
        this.isAdLoaded = false;

        // Test Ad Unit ID - Replace with real ID from AdMob Console for production
        this.rewardedAdId = 'ca-app-pub-3940256099942544/5224354917';

        this.initAdMob();
    }

    async initAdMob() {
        // Check if running in Capacitor (native app)
        if (typeof Capacitor === 'undefined' || !Capacitor.isNativePlatform()) {
            console.log('AdMob: Running in browser, using mock ads');
            this.isInitialized = false;
            return;
        }

        try {
            const { AdMob } = await import('@capacitor-community/admob');
            this.AdMob = AdMob;

            // Initialize AdMob
            await AdMob.initialize({
                initializeForTesting: true, // Set to false for production
            });

            // Set up rewarded ad listeners
            AdMob.addListener('onRewardedVideoAdLoaded', () => {
                console.log('Rewarded ad loaded');
                this.isAdLoaded = true;
            });

            AdMob.addListener('onRewardedVideoAdFailedToLoad', (error) => {
                console.error('Rewarded ad failed to load:', error);
                this.isAdLoaded = false;
            });

            AdMob.addListener('onRewardedVideoAdClosed', () => {
                console.log('Rewarded ad closed');
                this.isAdLoaded = false;
                this.prepareRewardedAd(); // Preload next ad
            });

            AdMob.addListener('onRewardedVideoAdRewarded', (reward) => {
                console.log('User earned reward:', reward);
                this.economy.addGems(5);
                this.showRewardNotification();
            });

            this.isInitialized = true;
            this.prepareRewardedAd();
            console.log('AdMob initialized successfully');

        } catch (error) {
            console.error('AdMob initialization failed:', error);
            this.isInitialized = false;
        }
    }

    async prepareRewardedAd() {
        if (!this.isInitialized || !this.AdMob) return;

        try {
            await this.AdMob.prepareRewardedAd({
                adId: this.rewardedAdId,
            });
        } catch (error) {
            console.error('Failed to prepare rewarded ad:', error);
        }
    }

    async watchAd() {
        // If running in browser or AdMob not initialized, use mock
        if (!this.isInitialized || !this.AdMob) {
            this.mockWatchAd();
            return;
        }

        try {
            // Show loading state
            const btn = document.activeElement;
            if (btn) btn.disabled = true;

            await this.AdMob.showRewardedAd();

            if (btn) btn.disabled = false;
        } catch (error) {
            console.error('Failed to show rewarded ad:', error);
            if (btn) btn.disabled = false;

            // Fallback to mock if ad fails
            this.mockWatchAd();
        }
    }

    // Fallback mock for browser testing
    mockWatchAd() {
        console.log('Mock Ad: Starting...');
        const btn = document.activeElement;
        if (btn) btn.disabled = true;

        setTimeout(() => {
            console.log('Mock Ad: Finished');
            if (btn) btn.disabled = false;
            this.economy.addGems(5);
            this.showRewardNotification();
        }, 1500);
    }

    showRewardNotification() {
        // Use a nicer notification instead of alert
        const msgDisplay = document.getElementById('message-display');
        if (msgDisplay) {
            msgDisplay.textContent = '+5 Gems! 💎';
            msgDisplay.classList.remove('hidden');
            msgDisplay.style.color = '#9b59b6';

            setTimeout(() => {
                msgDisplay.classList.add('hidden');
                msgDisplay.style.color = '';
            }, 2000);
        } else {
            alert('Thanks for watching! +5 Gems');
        }
    }
}
