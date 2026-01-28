console.log('[AnimationManager] Loaded');

window.AnimationManager = class AnimationManager {
    constructor() {
        this.isAnimating = false;
        this.animationQueue = [];
        this.defaultDuration = 300; // ms
    }

    // Deal card from top of screen with rotation
    async dealCard(cardElement, delay = 0) {
        if (!cardElement) return;

        return new Promise(resolve => {
            setTimeout(() => {
                // Start position: above screen, rotated
                cardElement.style.transform = 'translateY(-200px) rotate(-15deg) scale(0.8)';
                cardElement.style.opacity = '0';
                cardElement.style.transition = 'none';

                // Force reflow
                cardElement.offsetHeight;

                // Animate to final position
                cardElement.style.transition = `all ${this.defaultDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
                cardElement.style.transform = 'translateY(0) rotate(0deg) scale(1)';
                cardElement.style.opacity = '1';

                setTimeout(resolve, this.defaultDuration);
            }, delay);
        });
    }

    // Flip card with 3D effect
    async flipCard(cardElement) {
        if (!cardElement) return;

        return new Promise(resolve => {
            cardElement.style.transition = `transform ${this.defaultDuration}ms ease-in-out`;
            cardElement.style.transformStyle = 'preserve-3d';

            // Flip to 90deg (hidden)
            cardElement.style.transform = 'rotateY(90deg)';

            setTimeout(() => {
                // Change content here if needed (handled externally)
                cardElement.classList.remove('face-down');

                // Flip to 0deg (visible)
                cardElement.style.transform = 'rotateY(0deg)';

                setTimeout(resolve, this.defaultDuration);
            }, this.defaultDuration / 2);
        });
    }

    // Slide card when hitting
    async slideIn(cardElement, fromDirection = 'right') {
        if (!cardElement) return;

        const offset = fromDirection === 'right' ? '100px' : '-100px';

        return new Promise(resolve => {
            cardElement.style.transform = `translateX(${offset})`;
            cardElement.style.opacity = '0';
            cardElement.style.transition = 'none';

            cardElement.offsetHeight;

            cardElement.style.transition = `all ${this.defaultDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
            cardElement.style.transform = 'translateX(0)';
            cardElement.style.opacity = '1';

            setTimeout(resolve, this.defaultDuration);
        });
    }

    // Shake effect for bust
    async shake(element) {
        if (!element) return;

        return new Promise(resolve => {
            element.classList.add('shake-animation');
            setTimeout(() => {
                element.classList.remove('shake-animation');
                resolve();
            }, 500);
        });
    }

    // Pulse effect for important moments
    async pulse(element) {
        if (!element) return;

        return new Promise(resolve => {
            element.classList.add('pulse-animation');
            setTimeout(() => {
                element.classList.remove('pulse-animation');
                resolve();
            }, 600);
        });
    }

    // Glow effect for wins
    async glow(element, color = '#f1c40f') {
        if (!element) return;

        return new Promise(resolve => {
            element.style.boxShadow = `0 0 30px ${color}, 0 0 60px ${color}`;
            element.style.transition = 'box-shadow 0.3s ease';

            setTimeout(() => {
                element.style.boxShadow = '';
                resolve();
            }, 1000);
        });
    }

    // Bounce effect
    async bounce(element) {
        if (!element) return;

        return new Promise(resolve => {
            element.classList.add('bounce-animation');
            setTimeout(() => {
                element.classList.remove('bounce-animation');
                resolve();
            }, 600);
        });
    }

    // Chain multiple animations
    async sequence(animations) {
        for (const anim of animations) {
            await anim();
        }
    }

    // Run animations in parallel
    async parallel(animations) {
        await Promise.all(animations.map(anim => anim()));
    }
}
