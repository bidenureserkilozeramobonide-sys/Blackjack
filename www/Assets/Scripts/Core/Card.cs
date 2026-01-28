using UnityEngine;

namespace Core
{
    public enum Suit { Clubs, Diamonds, Hearts, Spades }
    public enum Rank { Two = 2, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Jack, Queen, King, Ace }

    public class Card : MonoBehaviour
    {
        public Suit suit;
        public Rank rank;
        public int value;

        [Header("Visuals")]
        public SpriteRenderer spriteRenderer;

        public void Setup(Suit suit, Rank rank, Sprite sprite)
        {
            this.suit = suit;
            this.rank = rank;
            
            // Standard Blackjack values
            if (rank == Rank.Ace)
            {
                value = 11; // Hand logic handles reduction to 1
            }
            else if (rank >= Rank.Ten) // Ten, Jack, Queen, King
            {
                value = 10;
            }
            else
            {
                value = (int)rank;
            }

            if (spriteRenderer != null)
            {
                spriteRenderer.sprite = sprite;
            }
            
            name = $"{rank} of {suit}";
        }
    }
}
