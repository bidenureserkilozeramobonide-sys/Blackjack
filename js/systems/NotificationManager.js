// NotificationManager - Local notifications for game events
window.NotificationManager = class NotificationManager {
    constructor() {
        this.enabled = true;
        this.hasCapacitor = typeof Capacitor !== 'undefined';
        this.hasPermission = false;

        this.load();
        this.checkPermission();
    }

    load() {
        const saved = localStorage.getItem('sb_notifications_enabled');
        this.enabled = saved !== 'false';
    }

    save() {
        localStorage.setItem('sb_notifications_enabled', this.enabled.toString());
    }

    toggle(state) {
        this.enabled = state;
        this.save();
        if (state) {
            this.requestPermission();
        }
    }

    async checkPermission() {
        if ('Notification' in window) {
            this.hasPermission = Notification.permission === 'granted';
        }
    }

    async requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            const result = await Notification.requestPermission();
            this.hasPermission = result === 'granted';
        }
    }

    // Schedule a notification
    async schedule(options) {
        if (!this.enabled) return;

        const { title, body, icon = '🎰', delay = 0 } = options;

        // Try Capacitor Local Notifications first
        if (this.hasCapacitor && window.Capacitor?.Plugins?.LocalNotifications) {
            try {
                await window.Capacitor.Plugins.LocalNotifications.schedule({
                    notifications: [{
                        title: title,
                        body: body,
                        id: Date.now(),
                        schedule: { at: new Date(Date.now() + delay) }
                    }]
                });
                return;
            } catch (e) {
                console.log('[Notifications] Capacitor failed, trying web API');
            }
        }

        // Fallback to Web Notifications API
        if (this.hasPermission && 'Notification' in window) {
            if (delay > 0) {
                setTimeout(() => {
                    new Notification(title, { body, icon });
                }, delay);
            } else {
                new Notification(title, { body, icon });
            }
        }
    }

    // Pre-defined notifications
    dailyBonusReady() {
        this.schedule({
            title: '🎁 Daily Bonus Ready!',
            body: 'Your daily bonus is waiting for you. Come claim your chips and gems!'
        });
    }

    questsReset() {
        this.schedule({
            title: '🎯 New Daily Quests!',
            body: 'Fresh quests are ready. Complete them for bonus rewards!'
        });
    }

    wheelReady() {
        this.schedule({
            title: '🎡 Wheel Ready to Spin!',
            body: 'Your daily wheel spin is available. Try your luck!'
        });
    }

    achievementUnlocked(name) {
        this.schedule({
            title: '🏆 Achievement Unlocked!',
            body: `You earned "${name}". Check your trophies for your reward!`
        });
    }

    // Schedule daily reminder (call on app close or background)
    scheduleDailyReminder() {
        if (!this.enabled) return;

        // Schedule for next day at 10 AM
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0, 0);
        const delay = tomorrow - now;

        this.schedule({
            title: '🃏 Miss playing Blackjack?',
            body: 'Your daily bonus and quests are waiting!',
            delay: delay
        });
    }
}
