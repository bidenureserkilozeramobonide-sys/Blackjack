window.GestureManager = class GestureManager {
    constructor(gameManager) {
        this.game = gameManager;
        this.enabled = true;
        this.startX = 0;
        this.startY = 0;
        this.threshold = 50; // Minimum swipe distance

        this.init();
    }

    init() {
        const gameArea = document.querySelector('.game-table');
        if (!gameArea) return;

        gameArea.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        gameArea.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

        // Also support mouse for desktop testing
        gameArea.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        gameArea.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        this.load();
    }

    load() {
        const saved = localStorage.getItem('sb_gestures_enabled');
        this.enabled = saved !== 'false';
    }

    save() {
        localStorage.setItem('sb_gestures_enabled', this.enabled.toString());
    }

    toggle(state) {
        this.enabled = state;
        this.save();
    }

    handleTouchStart(e) {
        if (!this.enabled) return;
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
    }

    handleTouchEnd(e) {
        if (!this.enabled) return;
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        this.processSwipe(endX - this.startX, endY - this.startY);
    }

    handleMouseDown(e) {
        if (!this.enabled) return;
        this.startX = e.clientX;
        this.startY = e.clientY;
    }

    handleMouseUp(e) {
        if (!this.enabled) return;
        this.processSwipe(e.clientX - this.startX, e.clientY - this.startY);
    }

    processSwipe(deltaX, deltaY) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        // Not a valid swipe
        if (absX < this.threshold && absY < this.threshold) return;

        // Determine swipe direction
        if (absY > absX) {
            // Vertical swipe
            if (deltaY < 0) {
                // Swipe UP = HIT
                this.showGestureHint('HIT ↑');
                if (window.game) window.game.hit();
            } else {
                // Swipe DOWN = STAND
                this.showGestureHint('STAND ↓');
                if (window.game) window.game.stand();
            }
        } else {
            // Horizontal swipe
            if (deltaX > 0) {
                // Swipe RIGHT = SPLIT (if available)
                this.showGestureHint('SPLIT →');
                if (window.game) window.game.split();
            } else {
                // Swipe LEFT = DOUBLE
                this.showGestureHint('DOUBLE ←');
                if (window.game) window.game.doubleDown();
            }
        }
    }

    showGestureHint(action) {
        // Remove existing hint
        const existing = document.querySelector('.gesture-hint');
        if (existing) existing.remove();

        const hint = document.createElement('div');
        hint.className = 'gesture-hint';
        hint.textContent = action;
        document.body.appendChild(hint);

        // Animate and remove
        setTimeout(() => hint.classList.add('show'), 10);
        setTimeout(() => {
            hint.classList.remove('show');
            setTimeout(() => hint.remove(), 300);
        }, 500);
    }

    renderSettingsToggle() {
        return `
            <div class="setting-row">
                <span class="setting-label">Swipe Gestures</span>
                <label class="toggle-switch">
                    <input type="checkbox" ${this.enabled ? 'checked' : ''} 
                           onchange="gestures.toggle(this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div class="gesture-guide">
                <div class="gesture-item">↑ Swipe Up = Hit</div>
                <div class="gesture-item">↓ Swipe Down = Stand</div>
                <div class="gesture-item">← Swipe Left = Double</div>
                <div class="gesture-item">→ Swipe Right = Split</div>
            </div>
        `;
    }
}
