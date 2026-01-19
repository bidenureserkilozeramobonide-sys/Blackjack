using UnityEngine;
using UnityEngine.Events;

namespace Systems
{
    public class AdManager : MonoBehaviour
    {
        public static AdManager Instance;

        public UnityEvent OnAdWatched; // Hook this to EconomyManager.AddGems in Editor or Code

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        public void ShowRewardedAd()
        {
            Debug.Log("Showing Ad...");
            // Simulate Ad watching
            Invoke(nameof(GrantReward), 1.0f);
        }

        private void GrantReward()
        {
            Debug.Log("Ad Watched! Converting to Reward.");
            OnAdWatched?.Invoke();
            
            // Direct integration for simplicity in this prototype
            if(EconomyManager.Instance) EconomyManager.Instance.AddGems(5); // 5 Gems per ad
        }
    }
}
