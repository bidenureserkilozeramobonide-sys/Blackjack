window.AvatarManager = class AvatarManager {
    constructor() {
        // Professional Font Awesome icons instead of emojis
        this.avatars = [
            { id: 'player1', icon: 'fa-solid fa-user', name: 'Player', price: 0, color: '#3498db' },
            { id: 'player2', icon: 'fa-solid fa-user-tie', name: 'Executive', price: 0, color: '#2c3e50' },
            { id: 'player3', icon: 'fa-solid fa-crown', name: 'Royalty', price: 50, color: '#f1c40f' },
            { id: 'player4', icon: 'fa-solid fa-star', name: 'Star', price: 50, color: '#e74c3c' },
            { id: 'player5', icon: 'fa-solid fa-diamond', name: 'Diamond', price: 75, color: '#00bcd4' },
            { id: 'player6', icon: 'fa-solid fa-fire', name: 'Fire', price: 75, color: '#e67e22' },
            { id: 'player7', icon: 'fa-solid fa-bolt', name: 'Thunder', price: 100, color: '#f39c12' },
            { id: 'player8', icon: 'fa-solid fa-shield', name: 'Shield', price: 100, color: '#27ae60' },
            { id: 'player9', icon: 'fa-solid fa-skull', name: 'Skull', price: 150, color: '#9b59b6' },
            { id: 'player10', icon: 'fa-solid fa-ghost', name: 'Ghost', price: 200, color: '#1abc9c' }
        ];

        this.load();
    }

    load() {
        this.currentAvatar = localStorage.getItem('sb_current_avatar') || 'player1';
        const unlocked = localStorage.getItem('sb_unlocked_avatars');
        this.unlockedAvatars = unlocked ? JSON.parse(unlocked) : ['player1', 'player2'];
    }

    save() {
        localStorage.setItem('sb_current_avatar', this.currentAvatar);
        localStorage.setItem('sb_unlocked_avatars', JSON.stringify(this.unlockedAvatars));
    }

    isUnlocked(avatarId) {
        return this.unlockedAvatars.includes(avatarId);
    }

    unlockAvatar(avatarId, economy) {
        const avatar = this.avatars.find(a => a.id === avatarId);
        if (!avatar || this.isUnlocked(avatarId)) return false;

        if (!economy || !economy.spendGems(avatar.price)) {
            return false;
        }

        this.unlockedAvatars.push(avatarId);
        this.save();
        return true;
    }

    setAvatar(avatarId) {
        if (!this.isUnlocked(avatarId)) return false;

        this.currentAvatar = avatarId;
        this.updateDisplay();
        this.save();
        return true;
    }

    getCurrentAvatar() {
        return this.avatars.find(a => a.id === this.currentAvatar);
    }

    updateDisplay() {
        const display = document.getElementById('player-avatar');
        if (display) {
            const avatar = this.getCurrentAvatar();
            if (avatar) {
                display.innerHTML = `<i class="${avatar.icon}"></i>`;
                display.style.background = `linear-gradient(135deg, ${avatar.color} 0%, ${this.darkenColor(avatar.color)} 100%)`;
            }
        }
    }

    darkenColor(hex) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.max(0, (num >> 16) - 40);
        const g = Math.max(0, ((num >> 8) & 0x00FF) - 40);
        const b = Math.max(0, (num & 0x0000FF) - 40);
        return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
    }

    renderAvatarsPanel() {
        const container = document.getElementById('avatars-grid');
        if (!container) return;

        container.innerHTML = this.avatars.map(avatar => {
            const isUnlocked = this.isUnlocked(avatar.id);
            const isActive = this.currentAvatar === avatar.id;

            return `
                <div class="avatar-item ${isUnlocked ? 'unlocked' : 'locked'} ${isActive ? 'active' : ''}"
                     onclick="avatars.handleAvatarClick('${avatar.id}')">
                    <div class="avatar-icon-display" style="background: linear-gradient(135deg, ${avatar.color} 0%, ${this.darkenColor(avatar.color)} 100%);">
                        <i class="${avatar.icon}"></i>
                    </div>
                    <div class="avatar-name">${avatar.name}</div>
                    ${!isUnlocked ?
                    `<div class="avatar-price">${avatar.price} <i class="fa-regular fa-gem"></i></div>` :
                    isActive ? '<div class="avatar-status"><i class="fa-solid fa-check"></i></div>' : ''
                }
                </div>
            `;
        }).join('');
    }

    handleAvatarClick(avatarId) {
        if (this.isUnlocked(avatarId)) {
            this.setAvatar(avatarId);
            this.renderAvatarsPanel();
        } else {
            const avatar = this.avatars.find(a => a.id === avatarId);
            if (confirm(`Unlock ${avatar.name} for ${avatar.price} gems?`)) {
                if (this.unlockAvatar(avatarId, window.economy)) {
                    this.setAvatar(avatarId);
                    this.renderAvatarsPanel();
                    if (window.game && window.game.audio) {
                        window.game.audio.play('achievement');
                    }
                } else {
                    alert('Not enough gems!');
                }
            }
        }
    }
}
