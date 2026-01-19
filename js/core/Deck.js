// Card is globally available via window.Card

window.Deck = class Deck {
    constructor() {
        this.cards = [];
        this.suits = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];
        this.ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.generateDeck();
    }

    generateDeck() {
        this.cards = [];
        for (let suit of this.suits) {
            for (let rank of this.ranks) {
                let value = parseInt(rank);
                if (rank === 'J' || rank === 'Q' || rank === 'K') value = 10;
                if (rank === 'A') value = 11; // Hand logic manages Ace value

                this.cards.push(new Card(suit, rank, value));
            }
        }
    }

    shuffle() {
        // Fisher-Yates
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    draw() {
        if (this.cards.length === 0) {
            console.log("Deck empty, reshuffling new deck.");
            this.generateDeck();
            this.shuffle();
        }
        return this.cards.pop();
    }
}
