// HapticManager - Provides haptic feedback on supported devices (Capacitor/Mobile)
window.HapticManager = class HapticManager {
    constructor() {
        this.enabled = true;
        this.hasCapacitor = typeof Capacitor !== 'undefined';
        this.load();
    }

    load() {
        const saved = localStorage.getItem('sb_haptics_enabled');
        this.enabled = saved !== 'false';
    }

    save() {
        localStorage.setItem('sb_haptics_enabled', this.enabled.toString());
    }

    toggle(state) {
        this.enabled = state;
        this.save();
    }

    // Light impact - for button presses, card flips
    light() {
        if (!this.enabled) return;
        this.vibrate(10);
    }

    // Medium impact - for chip placement, selections
    medium() {
        if (!this.enabled) return;
        this.vibrate(25);
    }

    // Heavy impact - for wins, achievements
    heavy() {
        if (!this.enabled) return;
        this.vibrate(50);
    }

    // Success pattern - for big wins
    success() {
        if (!this.enabled) return;
        // Three quick vibrations
        this.vibrate([30, 50, 30, 50, 30]);
    }

    // Error pattern - for losses
    error() {
        if (!this.enabled) return;
        // Two longer vibrations
        this.vibrate([100, 50, 100]);
    }

    // Warning pattern - for close calls
    warning() {
        if (!this.enabled) return;
        this.vibrate([50, 30, 50]);
    }

    vibrate(pattern) {
        // Try Capacitor Haptics first
        if (this.hasCapacitor && window.Capacitor?.Plugins?.Haptics) {
            try {
                if (Array.isArray(pattern)) {
                    // For patterns, just do a notification
                    window.Capacitor.Plugins.Haptics.notification({ type: 'SUCCESS' });
                } else if (pattern <= 15) {
                    window.Capacitor.Plugins.Haptics.impact({ style: 'LIGHT' });
                } else if (pattern <= 35) {
                    window.Capacitor.Plugins.Haptics.impact({ style: 'MEDIUM' });
                } else {
                    window.Capacitor.Plugins.Haptics.impact({ style: 'HEAVY' });
                }
                return;
            } catch (e) {
                // Fall through to navigator.vibrate
            }
        }

        // Fallback to Vibration API
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    // Win feedback
    onWin(isBigWin = false) {
        if (isBigWin) {
            this.success();
        } else {
            this.heavy();
        }
    }

    // Lose feedback
    onLose() {
        this.error();
    }

    // Card dealt
    onCardDealt() {
        this.light();
    }

    // Chip placed
    onChipPlaced() {
        this.medium();
    }

    // Achievement unlocked
    onAchievement() {
        this.success();
    }
}
