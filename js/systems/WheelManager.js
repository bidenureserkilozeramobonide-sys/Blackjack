window.WheelManager = class WheelManager {
    constructor(economyManager) {
        this.economy = economyManager;
        this.isSpinning = false;
        this.currentRotation = 0;

        // Wheel segments (probability weighted)
        this.segments = [
            { label: '50', type: 'chips', value: 50, color: '#e74c3c', probability: 20 },
            { label: '100', type: 'chips', value: 100, color: '#3498db', probability: 18 },
            { label: '1', type: 'gems', value: 1, color: '#9b59b6', probability: 15 },
            { label: '200', type: 'chips', value: 200, color: '#2ecc71', probability: 12 },
            { label: '2', type: 'gems', value: 2, color: '#e67e22', probability: 10 },
            { label: '500', type: 'chips', value: 500, color: '#1abc9c', probability: 8 },
            { label: '3', type: 'gems', value: 3, color: '#f39c12', probability: 7 },
            { label: '1000', type: 'chips', value: 1000, color: '#e91e63', probability: 5 },
            { label: '5', type: 'gems', value: 5, color: '#00bcd4', probability: 3 },
            { label: 'JACKPOT', type: 'chips', value: 2500, color: '#ffd700', probability: 2 }
        ];

        this.load();
    }

    load() {
        this.lastSpin = localStorage.getItem('sb_wheel_last_spin');
        this.spinsToday = parseInt(localStorage.getItem('sb_wheel_spins_today')) || 0;
    }

    save() {
        localStorage.setItem('sb_wheel_last_spin', this.lastSpin);
        localStorage.setItem('sb_wheel_spins_today', this.spinsToday.toString());
    }

    canSpin() {
        if (!this.lastSpin) return true;

        const now = new Date();
        const lastSpinDate = new Date(this.lastSpin);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastDate = new Date(lastSpinDate.getFullYear(), lastSpinDate.getMonth(), lastSpinDate.getDate());

        if (today > lastDate) {
            this.spinsToday = 0;
        }

        return this.spinsToday < 1;
    }

    getTimeUntilNextSpin() {
        if (this.canSpin()) return 0;

        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        return tomorrow - now;
    }

    formatTime(ms) {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }

    getRandomSegment() {
        const totalWeight = this.segments.reduce((sum, s) => sum + s.probability, 0);
        let random = Math.random() * totalWeight;

        for (const segment of this.segments) {
            random -= segment.probability;
            if (random <= 0) return segment;
        }

        return this.segments[0];
    }

    calculateSpinDegrees(segmentIndex) {
        const segmentAngle = 360 / this.segments.length;
        const targetAngle = segmentIndex * segmentAngle + segmentAngle / 2;
        const fullRotations = 5 + Math.floor(Math.random() * 3);
        return fullRotations * 360 + (360 - targetAngle);
    }

    // Build conic-gradient for wheel background
    buildConicGradient() {
        const segmentAngle = 360 / this.segments.length;
        let gradientStops = [];

        this.segments.forEach((seg, i) => {
            const startAngle = i * segmentAngle;
            const endAngle = (i + 1) * segmentAngle;
            gradientStops.push(`${seg.color} ${startAngle}deg ${endAngle}deg`);
        });

        return `conic-gradient(from 0deg, ${gradientStops.join(', ')})`;
    }

    // Render wheel inline in shop tab
    renderWheel() {
        const container = document.getElementById('wheel-container');
        if (!container) return;

        const segmentAngle = 360 / this.segments.length;
        const radius = 100; // Position labels at this radius from center

        // Create labels positioned around the wheel
        const labelsHtml = this.segments.map((seg, i) => {
            const angle = (i * segmentAngle) + (segmentAngle / 2) - 90; // -90 to start from top
            const radians = (angle * Math.PI) / 180;
            const x = 50 + (35 * Math.cos(radians)); // 35% from center
            const y = 50 + (35 * Math.sin(radians));

            const icon = seg.type === 'gems' ? '<i class="fa-regular fa-gem"></i>' : '';

            return `
                <div class="wheel-label" style="left: ${x}%; top: ${y}%; transform: translate(-50%, -50%) rotate(${angle + 90}deg);">
                    ${seg.label}${icon}
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="wheel-section">
                <h3><i class="fa-solid fa-dharmachakra"></i> Daily Spin</h3>
                <div class="wheel-wrapper">
                    <div class="wheel-pointer-inline">
                        <i class="fa-solid fa-caret-down"></i>
                    </div>
                    <div class="wheel-inline" id="the-wheel" style="background: ${this.buildConicGradient()};">
                        ${labelsHtml}
                        <div class="wheel-center"></div>
                    </div>
                </div>
                <div class="wheel-controls">
                    ${this.canSpin() ?
                `<button class="btn-spin" id="spin-btn" onclick="wheel.spinWheel()">
                            <i class="fa-solid fa-play"></i> SPIN
                        </button>` :
                `<div class="wheel-timer">
                            <i class="fa-solid fa-clock"></i> Next spin in: ${this.formatTime(this.getTimeUntilNextSpin())}
                        </div>`
            }
                </div>
                <div class="wheel-result" id="wheel-result"></div>
            </div>
        `;
    }

    spinWheel() {
        if (!this.canSpin() || this.isSpinning) return;

        this.isSpinning = true;
        const result = this.getRandomSegment();
        const segmentIndex = this.segments.indexOf(result);
        const degreesToSpin = this.calculateSpinDegrees(segmentIndex);

        const wheelEl = document.getElementById('the-wheel');
        const spinBtn = document.getElementById('spin-btn');
        const resultEl = document.getElementById('wheel-result');

        if (spinBtn) {
            spinBtn.disabled = true;
            spinBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Spinning...';
        }

        // Apply spin animation
        this.currentRotation += degreesToSpin;
        wheelEl.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
        wheelEl.style.transform = `rotate(${this.currentRotation}deg)`;

        // Play sound
        if (window.game && window.game.audio) {
            window.game.audio.play('shuffle');
        }

        // After spin completes
        setTimeout(() => {
            // Award prize
            if (result.type === 'chips' && this.economy) {
                this.economy.addChips(result.value);
            } else if (result.type === 'gems' && this.economy) {
                this.economy.addGems(result.value);
            }

            // Update spin tracking
            this.lastSpin = new Date().toISOString();
            this.spinsToday++;
            this.save();

            // Play win sound
            if (window.game && window.game.audio) {
                window.game.audio.play('win');
            }

            // Show result
            const prizeText = result.type === 'chips' ? `${result.value} Chips` : `${result.value} Gems`;
            resultEl.innerHTML = `
                <div class="prize-won">
                    <i class="fa-solid fa-trophy"></i>
                    You won: <strong>${prizeText}</strong>
                </div>
            `;
            resultEl.classList.add('show');

            // Update button
            if (spinBtn) {
                spinBtn.outerHTML = `
                    <div class="wheel-timer">
                        <i class="fa-solid fa-clock"></i> Next spin in: ${this.formatTime(this.getTimeUntilNextSpin())}
                    </div>
                `;
            }

            this.isSpinning = false;
        }, 4500);
    }

    // Keep for backward compatibility
    showWheelPopup() {
        if (window.ui) {
            window.ui.toggleShop(true);
            window.ui.switchTab('wheel');
        }
    }

    closePopup() { }
}
