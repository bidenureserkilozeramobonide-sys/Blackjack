console.log('[EffectsManager] Loaded');

window.EffectsManager = class EffectsManager {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        this.setupCanvas();
    }

    setupCanvas() {
        // Create canvas for particle effects
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'effects-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // Confetti explosion
    showConfetti(intensity = 'medium') {
        const counts = { low: 50, medium: 100, high: 200 };
        const count = counts[intensity] || 100;

        const colors = ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#e67e22'];

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
                y: window.innerHeight / 2,
                vx: (Math.random() - 0.5) * 15,
                vy: -Math.random() * 15 - 5,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                gravity: 0.3,
                life: 1,
                decay: 0.01 + Math.random() * 0.01,
                type: 'confetti'
            });
        }

        if (!this.animationId) {
            this.animate();
        }
    }

    // Blackjack special effect
    showBlackjackEffect() {
        // Golden particles
        for (let i = 0; i < 80; i++) {
            const angle = (Math.PI * 2 / 80) * i;
            const speed = 5 + Math.random() * 5;
            this.particles.push({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 6 + 3,
                color: '#f1c40f',
                life: 1,
                decay: 0.015,
                type: 'spark'
            });
        }

        // Show text overlay
        this.showTextPopup('BLACKJACK!', '#f1c40f', 2000);

        if (!this.animationId) {
            this.animate();
        }
    }

    // Big win effect with coins
    showBigWinEffect(amount) {
        // Coin particles
        for (let i = 0; i < 60; i++) {
            this.particles.push({
                x: window.innerWidth / 2 + (Math.random() - 0.5) * 100,
                y: window.innerHeight / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: -Math.random() * 12 - 3,
                size: 15,
                color: '#f1c40f',
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 20,
                gravity: 0.4,
                life: 1,
                decay: 0.008,
                type: 'coin'
            });
        }

        this.showTextPopup(`+${amount}`, '#2ecc71', 1500);

        if (!this.animationId) {
            this.animate();
        }
    }

    // Bust effect
    showBustEffect() {
        // Red/orange explosion
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 5;
            this.particles.push({
                x: window.innerWidth / 2,
                y: window.innerHeight * 0.7,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: Math.random() * 8 + 4,
                color: Math.random() > 0.5 ? '#e74c3c' : '#e67e22',
                life: 1,
                decay: 0.02,
                type: 'spark'
            });
        }

        if (!this.animationId) {
            this.animate();
        }
    }

    // Text popup animation
    showTextPopup(text, color, duration = 1500) {
        const popup = document.createElement('div');
        popup.className = 'effect-text-popup';
        popup.textContent = text;
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            font-size: 48px;
            font-weight: 900;
            color: ${color};
            text-shadow: 0 0 20px ${color}, 0 4px 0 rgba(0,0,0,0.3);
            z-index: 10000;
            pointer-events: none;
            animation: popupScale ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        `;
        document.body.appendChild(popup);

        setTimeout(() => popup.remove(), duration);
    }

    // Animation loop
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles = this.particles.filter(p => {
            // Update position
            p.x += p.vx;
            p.y += p.vy;
            if (p.gravity) p.vy += p.gravity;
            if (p.rotation !== undefined) p.rotation += p.rotationSpeed || 0;
            p.life -= p.decay;

            if (p.life <= 0) return false;

            // Draw particle
            this.ctx.save();
            this.ctx.globalAlpha = p.life;
            this.ctx.translate(p.x, p.y);
            if (p.rotation) this.ctx.rotate(p.rotation * Math.PI / 180);

            if (p.type === 'confetti') {
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            } else if (p.type === 'coin') {
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, p.size / 2, p.size / 2 * Math.abs(Math.cos(p.rotation * 0.1)), 0, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = '#c9a000';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            } else if (p.type === 'spark') {
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }

            this.ctx.restore();
            return true;
        });

        if (this.particles.length > 0) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            this.animationId = null;
        }
    }

    // Clear all effects
    clear() {
        this.particles = [];
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
