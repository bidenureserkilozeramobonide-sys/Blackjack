window.Card = class Card {
    constructor(suit, rank, value) {
        this.suit = suit;
        this.rank = rank;
        this.value = value;
    }

    getDisplayName() {
        return `${this.rank} of ${this.suit}`;
    }

    isRed() {
        return this.suit === 'Hearts' || this.suit === 'Diamonds';
    }
}
