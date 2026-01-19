window.Hand = class Hand {
    constructor(ownerElementId, scoreElementId) {
        this.cards = [];
        this.ownerElementId = ownerElementId; // DOM ID for card container
        this.scoreElementId = scoreElementId; // DOM ID for score text
    }

    addCard(card) {
        this.cards.push(card);
    }

    reset() {
        this.cards = [];
    }

    getScore() {
        let score = 0;
        let aces = 0;

        for (let card of this.cards) {
            score += card.value;
            if (card.rank === 'A') aces++;
        }

        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }

        return score;
    }

    isBusted() {
        return this.getScore() > 21;
    }

    isBlackjack() {
        return this.cards.length === 2 && this.getScore() === 21;
    }
}
