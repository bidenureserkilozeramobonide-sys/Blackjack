window.ShopManager = class ShopManager {
    constructor(economyManager) {
        this.economy = economyManager;
        this.cardSkins = [
            { id: 'default', name: 'Classic Red', price: 0, cssClass: '' },
            { id: 'blue', name: 'Royal Blue', price: 50, cssClass: 'skin-blue' },
            { id: 'black', name: 'Midnight Black', price: 100, cssClass: 'skin-black' }
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

            // Card Preview logic
            let previewHTML = '';
            if (skin.id === 'default') previewHTML = '<div class="card" style="transform:scale(0.5)"><div class="card-center" style="font-size:20px">♥</div></div>';
            else if (skin.id === 'blue') previewHTML = '<div class="card skin-blue face-down" style="transform:scale(0.5); width:50px; height:70px;"></div>';
            else if (skin.id === 'black') previewHTML = '<div class="card skin-black face-down" style="transform:scale(0.5); width:50px; height:70px;"></div>';

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
