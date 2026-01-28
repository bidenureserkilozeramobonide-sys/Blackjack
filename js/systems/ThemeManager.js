window.ThemeManager = class ThemeManager {
    constructor() {
        this.themes = [
            {
                id: 'vegas',
                name: 'Vegas Classic',
                icon: '🎰',
                colors: {
                    tableBg: 'linear-gradient(135deg, #1a472a 0%, #0d2818 100%)',
                    feltColor: '#1a472a',
                    accentColor: '#ffd700',
                    cardShadow: 'rgba(0, 0, 0, 0.5)'
                },
                price: 0
            },
            {
                id: 'montecarlo',
                name: 'Monte Carlo',
                icon: '🏛️',
                colors: {
                    tableBg: 'linear-gradient(135deg, #1a365d 0%, #0d1b2a 100%)',
                    feltColor: '#1a365d',
                    accentColor: '#c9b037',
                    cardShadow: 'rgba(0, 0, 50, 0.5)'
                },
                price: 100
            },
            {
                id: 'underwater',
                name: 'Deep Ocean',
                icon: '🌊',
                colors: {
                    tableBg: 'linear-gradient(135deg, #0077b6 0%, #023e8a 50%, #03045e 100%)',
                    feltColor: '#0077b6',
                    accentColor: '#48cae4',
                    cardShadow: 'rgba(0, 50, 100, 0.6)'
                },
                price: 150
            },
            {
                id: 'space',
                name: 'Galaxy',
                icon: '🌌',
                colors: {
                    tableBg: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
                    feltColor: '#0f0c29',
                    accentColor: '#a855f7',
                    cardShadow: 'rgba(100, 0, 150, 0.5)'
                },
                price: 200
            },
            {
                id: 'midnight',
                name: 'Midnight',
                icon: '🌙',
                colors: {
                    tableBg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
                    feltColor: '#0a0a0a',
                    accentColor: '#e94560',
                    cardShadow: 'rgba(0, 0, 0, 0.7)'
                },
                price: 175
            },
            {
                id: 'sunset',
                name: 'Sunset',
                icon: '🌅',
                colors: {
                    tableBg: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #9b2335 100%)',
                    feltColor: '#cc5500',
                    accentColor: '#ffd700',
                    cardShadow: 'rgba(100, 50, 0, 0.5)'
                },
                price: 200
            },
            // Phase 8 Animated Themes
            {
                id: 'aurora',
                name: 'Northern Lights',
                icon: '✨',
                colors: {
                    tableBg: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
                    feltColor: '#0f0f23',
                    accentColor: '#00ff88',
                    cardShadow: 'rgba(0, 255, 136, 0.3)'
                },
                price: 300,
                animated: true,
                animationClass: 'theme-aurora'
            },
            {
                id: 'ocean',
                name: 'Ocean Wave',
                icon: '🌊',
                colors: {
                    tableBg: 'linear-gradient(180deg, #0077b6 0%, #0096c7 30%, #00b4d8 60%, #0077b6 100%)',
                    feltColor: '#006994',
                    accentColor: '#90e0ef',
                    cardShadow: 'rgba(0, 150, 199, 0.4)'
                },
                price: 250,
                animated: true,
                animationClass: 'theme-ocean'
            },
            {
                id: 'neoncity',
                name: 'Neon City',
                icon: '🏙️',
                colors: {
                    tableBg: 'linear-gradient(135deg, #0d0d0d 0%, #1a0a2e 50%, #0d0d0d 100%)',
                    feltColor: '#0d0d0d',
                    accentColor: '#ff00ff',
                    cardShadow: 'rgba(255, 0, 255, 0.4)'
                },
                price: 400,
                animated: true,
                animationClass: 'theme-neoncity'
            }
        ];

        this.load();
        this.applyTheme(this.currentTheme);
    }

    load() {
        this.currentTheme = localStorage.getItem('sb_current_theme') || 'vegas';
        const unlocked = localStorage.getItem('sb_unlocked_themes');
        this.unlockedThemes = unlocked ? JSON.parse(unlocked) : ['vegas'];
    }

    save() {
        localStorage.setItem('sb_current_theme', this.currentTheme);
        localStorage.setItem('sb_unlocked_themes', JSON.stringify(this.unlockedThemes));
    }

    isUnlocked(themeId) {
        return this.unlockedThemes.includes(themeId);
    }

    unlockTheme(themeId, economy) {
        const theme = this.themes.find(t => t.id === themeId);
        if (!theme || this.isUnlocked(themeId)) return false;

        if (!economy || !economy.spendGems(theme.price)) {
            return false;
        }

        this.unlockedThemes.push(themeId);
        this.save();
        return true;
    }

    setTheme(themeId) {
        if (!this.isUnlocked(themeId)) return false;

        this.currentTheme = themeId;
        this.applyTheme(themeId);
        this.save();
        return true;
    }

    applyTheme(themeId) {
        const theme = this.themes.find(t => t.id === themeId);
        if (!theme) return;

        const root = document.documentElement;
        root.style.setProperty('--table-bg', theme.colors.tableBg);
        root.style.setProperty('--felt-color', theme.colors.feltColor);
        root.style.setProperty('--accent-gold', theme.colors.accentColor);
        root.style.setProperty('--card-shadow', theme.colors.cardShadow);

        // Update body background
        document.body.style.background = theme.colors.tableBg;

        // Remove all theme animation classes
        document.body.classList.remove('theme-aurora', 'theme-ocean', 'theme-neoncity');

        // Add animation class if animated theme
        if (theme.animated && theme.animationClass) {
            document.body.classList.add(theme.animationClass);
        }
    }

    getCurrentTheme() {
        return this.themes.find(t => t.id === this.currentTheme);
    }

    renderThemesPanel() {
        const container = document.getElementById('themes-grid');
        if (!container) return;

        container.innerHTML = this.themes.map(theme => {
            const isUnlocked = this.isUnlocked(theme.id);
            const isActive = this.currentTheme === theme.id;

            return `
                <div class="theme-item ${isUnlocked ? 'unlocked' : 'locked'} ${isActive ? 'active' : ''}"
                     onclick="themes.handleThemeClick('${theme.id}')"
                     style="background: ${theme.colors.tableBg}">
                    <div class="theme-preview">
                        <span class="theme-icon">${theme.icon}</span>
                    </div>
                    <div class="theme-info">
                        <div class="theme-name">${theme.name}</div>
                        ${!isUnlocked ?
                    `<div class="theme-price">${theme.price} 💎</div>` :
                    isActive ? '<div class="theme-status">✓ Active</div>' : '<div class="theme-status">Owned</div>'
                }
                    </div>
                </div>
            `;
        }).join('');
    }

    handleThemeClick(themeId) {
        if (this.isUnlocked(themeId)) {
            this.setTheme(themeId);
            this.renderThemesPanel();
        } else {
            // Try to purchase
            if (confirm(`Unlock this theme for ${this.themes.find(t => t.id === themeId).price} gems?`)) {
                if (this.unlockTheme(themeId, window.economy)) {
                    this.setTheme(themeId);
                    this.renderThemesPanel();
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
