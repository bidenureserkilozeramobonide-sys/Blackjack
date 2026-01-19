using UnityEngine;
using UnityEngine.UI;
using Systems;
using Core;

namespace UI
{
    public class UIManager : MonoBehaviour
    {
        [Header("HUD References")]
        public Text balanceTxt; // "BalanceTxt"
        public Text gemsTxt;    // "GemsTxt"
        public Text scoreTxt;   // "PlayerScoreTxt" (not implemented in GameManager yet, but good to have)
        
        [Header("Panels")]
        public GameObject shopPanel;
        public Button openShopBtn;
        public Button closeShopBtn;

        [Header("Game Buttons")]
        public Button hitBtn;
        public Button standBtn;
        public Button betBtn;
        public Button adBtn;

        private void Start()
        {
            AutoWireUI();
        }

        private void Update()
        {
            UpdateHUD();
        }

        private void AutoWireUI()
        {
            // Find Panels
            if(shopPanel == null) shopPanel = GameObject.Find("ShopPanel");
            if(shopPanel) shopPanel.SetActive(false); // Hide by default

            // Find Texts
            if(balanceTxt == null) 
            {
                GameObject obj = GameObject.Find("BalanceTxt");
                if(obj) balanceTxt = obj.GetComponent<Text>();
            }
            if(gemsTxt == null) 
            {
                GameObject obj = GameObject.Find("GemsTxt");
                if(obj) gemsTxt = obj.GetComponent<Text>();
            }

            // Connection to Managers
            AssignButton("HitBtn", () => GameManager.Instance.OnHit(), ref hitBtn);
            AssignButton("StandBtn", () => GameManager.Instance.OnStand(), ref standBtn);
            AssignButton("BetBtn", () => GameManager.Instance.OnPlaceBet(), ref betBtn);
            AssignButton("AdBtn", () => AdManager.Instance.ShowRewardedAd(), ref adBtn);

            // Shop Connections
            AssignButton("OpenShopBtn", () => ToggleShop(true), ref openShopBtn);
            AssignButton("CloseShopBtn", () => ToggleShop(false), ref closeShopBtn);
        }

        void AssignButton(string name, UnityEngine.Events.UnityAction action, ref Button btnRef)
        {
            GameObject obj = GameObject.Find(name);
            if(obj)
            {
                btnRef = obj.GetComponent<Button>();
                btnRef.onClick.RemoveAllListeners();
                btnRef.onClick.AddListener(action);
            }
        }

        void ToggleShop(bool open)
        {
            if(shopPanel) shopPanel.SetActive(open);
        }

        void UpdateHUD()
        {
            if(EconomyManager.Instance)
            {
                if(balanceTxt) balanceTxt.text = "Chips: " + EconomyManager.Instance.chips;
                if(gemsTxt) gemsTxt.text = "Gems: " + EconomyManager.Instance.gems;
            }
        }
    }
}
