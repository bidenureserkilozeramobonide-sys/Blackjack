window.ShopManager = class ShopManager {
    constructor(economyManager) {
        this.economy = economyManager;
        this.cardSkins = [
            { id: 'default', name: 'Classic Red', price: 0, cssClass: '' },
            { id: 'blue', name: 'Royal Blue', price: 50, cssClass: 'skin-blue' },
            { id: 'black', name: 'Midnight Black', price: 100, cssClass: 'skin-black' },
            { id: 'gold', name: 'Gold Luxury', price: 150, cssClass: 'skin-gold' },
            { id: 'neon', name: 'Neon Cyber', price: 200, cssClass: 'skin-neon' },
            { id: 'emerald', name: 'Emerald Elite', price: 250, cssClass: 'skin-emerald' },
            { id: 'phoenix', name: 'Phoenix Fire', price: 300, cssClass: 'skin-phoenix' },
            { id: 'diamond', name: 'Diamond Frost', price: 500, cssClass: 'skin-diamond' },
            // Phase 8 Premium Skins
            { id: 'vintage', name: 'Vintage Worn', price: 150, cssClass: 'skin-vintage' },
            { id: 'royal', name: 'Royal Crown', price: 300, cssClass: 'skin-royal' },
            { id: 'carbon', name: 'Carbon Fiber', price: 250, cssClass: 'skin-carbon' },
            { id: 'holo', name: 'Holographic', price: 500, cssClass: 'skin-holo' },
            { id: 'crimson', name: 'Crimson Blood', price: 400, cssClass: 'skin-crimson' }
        ];
        this.activeSkinId = localStorage.getItem('sb_active_skin') || 'default';
        this.unlockedSkins = JSON.parse(localStorage.getItem('sb_unlocked_skins')) || ['default'];

        this.renderShop();
    }

    isUnlocked(skinId) {
        return this.unlockedSkins.includes(skinId);
    }

    buySkin(skinId) {
        if (this.isUnlocked(skinId)) {
            alert("You already own this skin!");
            return;
        }

        const skin = this.cardSkins.find(s => s.id === skinId);
        if (!skin) return;

        if (this.economy.spendGems(skin.price)) {
            this.unlockedSkins.push(skinId);
            this.save();
            this.renderShop();
            alert(`Unlocked ${skin.name}!`);
        } else {
            alert("Not enough Gems!");
        }
    }

    equipSkin(skinId) {
        if (!this.isUnlocked(skinId)) {
            alert("You must buy this skin first!");
            return;
        }
        this.activeSkinId = skinId;
        this.save();
        this.renderShop();
        alert(`Equipped ${skinId}!`);

        // Force re-render of any visible cards
        // For simplicity, just reload page or let next render handle it
        // Ideally emit event. For prototype, we access global gameInstance if needed or rely on next hand.
    }

    save() {
        localStorage.setItem('sb_active_skin', this.activeSkinId);
        localStorage.setItem('sb_unlocked_skins', JSON.stringify(this.unlockedSkins));
    }

    renderShop() {
        const container = document.getElementById('skin-shop-grid');
        if (!container) return;

        container.innerHTML = '';
        this.cardSkins.forEach(skin => {
            const isOwned = this.isUnlocked(skin.id);
            const isActive = this.activeSkinId === skin.id;

            const btn = document.createElement('button');
            btn.className = 'shop-item';
            if (isActive) btn.style.border = '2px solid var(--accent-gold)';

            let priceText = '';
            if (isActive) priceText = 'EQUIPPED';
            else if (isOwned) priceText = 'OWNED';
            else priceText = `${skin.price} <i class="fa-regular fa-gem"></i>`;

            // Card Preview logic - dynamic for all skins
            const skinClass = skin.cssClass || '';
            const previewHTML = `<div class="card ${skinClass} face-down" style="transform:scale(0.5); width:50px; height:70px;"></div>`;

            btn.innerHTML = `
                <div class="item-visual">
                   ${previewHTML}
                </div>
                <div class="item-details">
                    <div class="item-name">${skin.name}</div>
                    <div class="item-price" style="${isActive ? 'color:#2ecc71' : ''}">${priceText}</div>
                </div>
            `;

            btn.onclick = () => {
                if (isOwned) this.equipSkin(skin.id);
                else this.buySkin(skin.id);
            };

            container.appendChild(btn);
        });
    }

    getActiveSkinClass() {
        const skin = this.cardSkins.find(s => s.id === this.activeSkinId);
        return skin ? skin.cssClass : '';
    }
}
