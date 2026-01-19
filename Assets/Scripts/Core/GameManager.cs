using System.Collections;
using UnityEngine;
using UnityEngine.Events;

namespace Core
{
    public enum GameState { Betting, Dealing, PlayerTurn, DealerTurn, Calculating, Result }

    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance;

        [Header("State")]
        public GameState currentState;

        [Header("References (Auto-Wired)")]
        public Deck deck;
        public Hand playerHand;
        public Hand dealerHand;

        [Header("Settings")]
        public int currentBet = 10;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        private void Start()
        {
            AutoWireDependencies();
            ChangeState(GameState.Betting);
        }

        private void AutoWireDependencies()
        {
            if (deck == null) deck = FindObjectOfType<Deck>();
            if (playerHand == null) 
            {
                GameObject ph = GameObject.Find("PlayerHand");
                if (ph) playerHand = ph.GetComponent<Hand>();
            }
            if (dealerHand == null) 
            {
                GameObject dh = GameObject.Find("DealerHand");
                if (dh) dealerHand = dh.GetComponent<Hand>();
            }
        }

        public void ChangeState(GameState newState)
        {
            currentState = newState;
            switch (currentState)
            {
                case GameState.Betting:
                    ResetRound();
                    break;
                case GameState.Dealing:
                    StartCoroutine(DealRoutine());
                    break;
                case GameState.PlayerTurn:
                    break;
                case GameState.DealerTurn:
                    StartCoroutine(DealerRoutine());
                    break;
                case GameState.Calculating:
                    CalculateResult();
                    break;
                case GameState.Result:
                    break;
            }
        }

        private void ResetRound()
        {
            playerHand.ClearHand();
            dealerHand.ClearHand();
            deck.ResetDeck();
        }

        public void OnPlaceBet()
        {
            if (Systems.EconomyManager.Instance != null)
            {
                if (Systems.EconomyManager.Instance.TrySpendChips(currentBet))
                {
                    ChangeState(GameState.Dealing);
                }
                else
                {
                    Debug.Log("Not enough chips!");
                }
            }
            else
            {
                // Fallback for testing w/o EconomyManager
                ChangeState(GameState.Dealing);
            }
        }

        IEnumerator DealRoutine()
        {
            yield return new WaitForSeconds(0.5f);
            playerHand.AddCard(deck.DrawCard());
            yield return new WaitForSeconds(0.5f);
            dealerHand.AddCard(deck.DrawCard());
            yield return new WaitForSeconds(0.5f);
            playerHand.AddCard(deck.DrawCard());
            yield return new WaitForSeconds(0.5f);
            dealerHand.AddCard(deck.DrawCard());

            if (playerHand.IsBlackjack())
            {
                ChangeState(GameState.Calculating);
            }
            else
            {
                ChangeState(GameState.PlayerTurn);
            }
        }

        public void OnHit()
        {
            if (currentState != GameState.PlayerTurn) return;

            playerHand.AddCard(deck.DrawCard());
            if (playerHand.IsBusted())
            {
                ChangeState(GameState.Calculating);
            }
        }

        public void OnStand()
        {
            if (currentState != GameState.PlayerTurn) return;
            ChangeState(GameState.DealerTurn);
        }

        IEnumerator DealerRoutine()
        {
            while (dealerHand.currentScore < 17)
            {
                yield return new WaitForSeconds(1.0f);
                dealerHand.AddCard(deck.DrawCard());
            }
            yield return new WaitForSeconds(0.5f);
            ChangeState(GameState.Calculating);
        }

        void CalculateResult()
        {
            bool playerBust = playerHand.IsBusted();
            bool dealerBust = dealerHand.IsBusted();
            int pScore = playerHand.currentScore;
            int dScore = dealerHand.currentScore;

            if (playerBust)
            {
                Debug.Log("Player Busted. Dealer Wins.");
            }
            else if (dealerBust)
            {
                Debug.Log("Dealer Busted. Player Wins!");
                if(Systems.EconomyManager.Instance) Systems.EconomyManager.Instance.AddChips(currentBet * 2);
            }
            else if (pScore > dScore)
            {
                Debug.Log("Player Wins!");
                // 2:1 Payout
                if(Systems.EconomyManager.Instance) Systems.EconomyManager.Instance.AddChips(currentBet * 2);
            }
            else if (dScore > pScore)
            {
                Debug.Log("Dealer Wins.");
            }
            else
            {
                Debug.Log("Push (Tie).");
                // Return bet
                if(Systems.EconomyManager.Instance) Systems.EconomyManager.Instance.AddChips(currentBet);
            }

            ChangeState(GameState.Result);
        }
        
        public void RestartGame()
        {
            ChangeState(GameState.Betting);
        }
    }
}
