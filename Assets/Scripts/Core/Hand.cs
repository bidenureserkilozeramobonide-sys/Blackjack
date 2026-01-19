using System.Collections.Generic;
using UnityEngine;

namespace Core
{
    public class Hand : MonoBehaviour
    {
        public List<Card> currentCards = new List<Card>();
        public int currentScore = 0;
        public Transform cardSpawnPoint;
        public float cardSpacing = 0.5f;

        public void AddCard(Card card)
        {
            card.gameObject.SetActive(true);
            card.transform.SetParent(cardSpawnPoint);
            
            // Simple logic to fan cards out
            Vector3 newPos = Vector3.zero;
            newPos.x = currentCards.Count * cardSpacing;
            card.transform.localPosition = newPos;
            
            currentCards.Add(card);
            CalculateScore();
        }

        public void ClearHand()
        {
            currentCards.Clear();
            currentScore = 0;
            // Visuals are handled by Deck.ResetDeck pulling them back, or we destroy them if instantiated nicely.
            // In this architecture, cards are pooled in Deck, so we just clear our list reference.
        }

        void CalculateScore()
        {
            int score = 0;
            int aceCount = 0;

            foreach (Card c in currentCards)
            {
                score += c.value;
                if (c.rank == Rank.Ace)
                {
                    aceCount++;
                }
            }

            // Adjust for Aces if bust
            while (score > 21 && aceCount > 0)
            {
                score -= 10;
                aceCount--;
            }

            currentScore = score;
        }

        public bool IsBusted()
        {
            return currentScore > 21;
        }

        public bool IsBlackjack()
        {
            return currentCards.Count == 2 && currentScore == 21;
        }
    }
}
