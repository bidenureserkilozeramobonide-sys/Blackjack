/**
 * IAPSystem - Google Play Billing Integration
 * Handles in-app purchases for gem packs
 * 
 * NOTE: For full functionality, you need:
 * 1. A Google Play Console account ($25 one-time)
 * 2. Products configured in Play Console
 * 3. The cordova-plugin-purchase installed: npm install cordova-plugin-purchase
 */
window.IAPSystem = class IAPSystem {
    constructor(economyManager) {
        this.economy = economyManager;
        this.isInitialized = false;
        this.store = null;

        // Product IDs - Must match Play Console
        this.products = {
            small: {
                id: 'gem_pouch_50',
                gems: 50,
                price: '$0.99'
            },
            large: {
                id: 'gem_chest_300',
                gems: 300,
                price: '$4.99'
            }
        };

        this.initStore();
    }

    async initStore() {
        // Check if running in Capacitor native environment
        if (typeof Capacitor === 'undefined' || !Capacitor.isNativePlatform()) {
            console.log('IAP: Running in browser, using mock purchases');
            this.isInitialized = false;
            return;
        }

        // Check if CdvPurchase is available (from cordova-plugin-purchase)
        if (typeof CdvPurchase === 'undefined') {
            console.warn('IAP: cordova-plugin-purchase not installed');
            console.log('Install with: npm install cordova-plugin-purchase');
            this.isInitialized = false;
            return;
        }

        try {
            this.store = CdvPurchase.store;

            // Register products
            this.store.register([
                {
                    id: this.products.small.id,
                    type: CdvPurchase.ProductType.CONSUMABLE,
                    platform: CdvPurchase.Platform.GOOGLE_PLAY
                },
                {
                    id: this.products.large.id,
                    type: CdvPurchase.ProductType.CONSUMABLE,
                    platform: CdvPurchase.Platform.GOOGLE_PLAY
                }
            ]);

            // Handle approved purchases
            this.store.when()
                .approved(transaction => this.handleApproved(transaction))
                .verified(receipt => this.handleVerified(receipt));

            // Initialize store
            await this.store.initialize([CdvPurchase.Platform.GOOGLE_PLAY]);

            this.isInitialized = true;
            console.log('IAP Store initialized successfully');

        } catch (error) {
            console.error('IAP Store initialization failed:', error);
            this.isInitialized = false;
        }
    }

    handleApproved(transaction) {
        console.log('Purchase approved:', transaction);
        transaction.verify();
    }

    handleVerified(receipt) {
        console.log('Purchase verified:', receipt);

        // Find which product was purchased
        receipt.transactions.forEach(transaction => {
            transaction.products.forEach(product => {
                // Deliver gems based on product
                if (product.id === this.products.small.id) {
                    this.economy.addGems(this.products.small.gems);
                    this.showPurchaseSuccess(this.products.small.gems);
                } else if (product.id === this.products.large.id) {
                    this.economy.addGems(this.products.large.gems);
                    this.showPurchaseSuccess(this.products.large.gems);
                }
            });
        });

        receipt.finish();
    }

    async buyPack(sku) {
        const product = this.products[sku];
        if (!product) {
            console.error('Unknown product SKU:', sku);
            return;
        }

        // If not initialized, use mock
        if (!this.isInitialized || !this.store) {
            this.mockPurchase(sku);
            return;
        }

        try {
            console.log(`Initiating purchase for ${product.id}...`);

            const offer = this.store.get(product.id)?.getOffer();
            if (offer) {
                await this.store.order(offer);
            } else {
                console.error('Product not found in store:', product.id);
                // Fallback to mock
                this.mockPurchase(sku);
            }
        } catch (error) {
            console.error('Purchase failed:', error);
            alert('Purchase failed. Please try again.');
        }
    }

    // Mock purchase for browser testing
    mockPurchase(sku) {
        const product = this.products[sku];
        if (!product) return;

        console.log(`Mock Purchase: Processing ${sku}...`);

        setTimeout(() => {
            this.economy.addGems(product.gems);
            this.showPurchaseSuccess(product.gems);
        }, 500);
    }

    showPurchaseSuccess(gems) {
        const msgDisplay = document.getElementById('message-display');
        if (msgDisplay) {
            msgDisplay.textContent = `+${gems} Gems! 💎`;
            msgDisplay.classList.remove('hidden');
            msgDisplay.style.color = '#9b59b6';

            setTimeout(() => {
                msgDisplay.classList.add('hidden');
                msgDisplay.style.color = '';
            }, 2500);
        } else {
            alert(`Purchase Successful! +${gems} Gems`);
        }
    }

    // Restore previous purchases (for non-consumables)
    async restorePurchases() {
        if (!this.isInitialized || !this.store) {
            console.log('Cannot restore: Store not initialized');
            return;
        }

        try {
            await this.store.restorePurchases();
            console.log('Purchases restored');
        } catch (error) {
            console.error('Restore failed:', error);
        }
    }
}
