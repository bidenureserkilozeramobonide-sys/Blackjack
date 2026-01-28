window.AudioManager = class AudioManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.init();
    }

    init() {
        // Preload sounds if we had files. 
        // For now, we define the keys we expect to use.
        // We will try to load from 'assets/audio/' but fail gracefully.
        const soundList = [
            'chip_place',
            'card_flip',
            'shuffle',
            'win',
            'lose',
            'push',
            'click'
        ];

        soundList.forEach(name => {
            this.sounds[name] = new Audio(`assets/audio/${name}.mp3`);
            this.sounds[name].volume = 0.5;
            // Suppress errors for missing files so it doesn't spam console too hard
            this.sounds[name].onerror = () => {
                // console.warn(`Audio missing: ${name}.mp3`);
                this.sounds[name].isMissing = true;
            };
        });
    }

    play(name) {
        if (!this.enabled) return;

        const sound = this.sounds[name];
        if (sound && !sound.isMissing) {
            // Clone node to allow overlapping sounds of same type
            const clone = sound.cloneNode();
            clone.volume = sound.volume;
            clone.play().catch(e => { });
        } else {
            // Fallback logging or slight visual cue could go here
            // console.log(`[Audio] Playing: ${name}`);
        }
    }

    toggle(state) {
        this.enabled = state;
    }
}
