window.IAPSystem = class IAPSystem {
    constructor(economyManager) {
        this.economy = economyManager;
    }

    buyPack(sku) {
        console.log(`Processing purchase for ${sku}...`);

        // Mock Purchase
        setTimeout(() => {
            let gemsToAdd = 0;
            switch (sku) {
                case 'small': gemsToAdd = 50; break;
                case 'large': gemsToAdd = 300; break;
            }

            if (gemsToAdd > 0) {
                this.economy.addGems(gemsToAdd);
                alert(`Purchase Successful! +${gemsToAdd} Gems`);
            }
        }, 500);
    }
}
