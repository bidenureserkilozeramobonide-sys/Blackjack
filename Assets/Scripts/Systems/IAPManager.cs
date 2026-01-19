using UnityEngine;

namespace Systems
{
    public class IAPManager : MonoBehaviour
    {
        public static IAPManager Instance;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        public void BuyGemPack_Small()
        {
            Debug.Log("Buying Small Gem Pack ($0.99)...");
            // Simulate purchase validation
            CompletePurchase(50);
        }

        public void BuyGemPack_Large()
        {
            Debug.Log("Buying Large Gem Pack ($4.99)...");
            CompletePurchase(300);
        }

        private void CompletePurchase(int gemsAmount)
        {
            Debug.Log("Purchase Successful!");
            if(EconomyManager.Instance) EconomyManager.Instance.AddGems(gemsAmount);
        }
    }
}
