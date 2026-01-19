using System.Collections.Generic;
using UnityEngine;

namespace Core
{
    public class Deck : MonoBehaviour
    {
        [Header("Configuration")]
        public GameObject cardPrefab;
        public List<Sprite> cardSprites; // Assume ordered: 0-12 Clubs, 13-25 Diamonds, etc.

        private List<Card> cards = new List<Card>();
        private int currentIndex = 0;

        public void InitializeDeck()
        {
            // Clear existing if any (logic for reset)
            foreach(Transform child in transform)
            {
                Destroy(child.gameObject);
            }
            cards.Clear();

            // Create 52 cards
            int spriteIndex = 0;
            foreach (Suit suit in System.Enum.GetValues(typeof(Suit)))
            {
                foreach (Rank rank in System.Enum.GetValues(typeof(Rank)))
                {
                    GameObject cardObj = Instantiate(cardPrefab, transform);
                    Card cardScript = cardObj.GetComponent<Card>();
                    
                    Sprite faceSprite = (spriteIndex < cardSprites.Count) ? cardSprites[spriteIndex] : null;
                    
                    cardScript.Setup(suit, rank, faceSprite);
                    cardObj.SetActive(false); // Hide in deck
                    
                    cards.Add(cardScript);
                    spriteIndex++;
                }
            }
            
            Shuffle();
        }

        public void Shuffle()
        {
            // Fisher-Yates Shuffle
            int n = cards.Count;
            while (n > 1)
            {
                n--;
                int k = Random.Range(0, n + 1);
                Card value = cards[k];
                cards[k] = cards[n];
                cards[n] = value;
            }
            currentIndex = 0;
        }

        public Card DrawCard()
        {
            if (currentIndex >= cards.Count)
            {
                Debug.LogWarning("Deck empty! Reshuffling.");
                Shuffle();
            }

            Card card = cards[currentIndex];
            currentIndex++;
            return card;
        }
        
        public void ResetDeck()
        {
            foreach(var c in cards)
            {
                c.gameObject.SetActive(false);
                c.transform.SetParent(transform);
            }
            Shuffle();
        }
    }
}
