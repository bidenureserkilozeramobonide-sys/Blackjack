#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using UnityEngine.UI;
using Core;
using Systems;
using UI;

namespace EditorScripts
{
    public class SceneSetup : EditorWindow
    {
        [MenuItem("Tools/Setup Blackjack Scene")]
        public static void SetupScene()
        {
            // 1. Setup Core Managers
            CreateManager<GameManager>("GameManager");
            CreateManager<EconomyManager>("EconomyManager");
            CreateManager<AdManager>("AdManager");
            CreateManager<IAPManager>("IAPManager");
            CreateManager<SkinManager>("SkinManager");

            // 2. Setup Gameplay Objects
            if (!GameObject.Find("Deck")) new GameObject("Deck").AddComponent<Deck>();
            if (!GameObject.Find("PlayerHand")) 
            {
                var ph = new GameObject("PlayerHand").AddComponent<Hand>();
                ph.cardSpawnPoint = ph.transform; // Self as spawn point
            }
            if (!GameObject.Find("DealerHand")) 
            {
                var dh = new GameObject("DealerHand").AddComponent<Hand>();
                dh.cardSpawnPoint = dh.transform;
                dh.transform.position = new Vector3(0, 3, 0); // Offset Dealer
            }

            // 3. Setup UI (Canvas)
            GameObject canvasObj = GameObject.Find("Canvas");
            if (!canvasObj)
            {
                canvasObj = new GameObject("Canvas");
                Canvas c = canvasObj.AddComponent<Canvas>();
                c.renderMode = RenderMode.ScreenSpaceOverlay;
                canvasObj.AddComponent<CanvasScaler>();
                canvasObj.AddComponent<GraphicRaycaster>();
            }

            // UI Manager
            if (!GameObject.Find("UIManager")) 
            {
                GameObject uiMgr = new GameObject("UIManager");
                uiMgr.AddComponent<UIManager>();
            }

            // Create Standard UI Elements
            CreateText(canvasObj, "BalanceTxt", "Chips: 1000", new Vector2(-300, 180));
            CreateText(canvasObj, "GemsTxt", "Gems: 0", new Vector2(300, 180));
            CreateText(canvasObj, "PlayerScoreTxt", "Score: 0", new Vector2(0, -50));

            // Buttons
            CreateButton(canvasObj, "BetBtn", "Place Bet ($10)", new Vector2(0, -150));
            CreateButton(canvasObj, "HitBtn", "Hit", new Vector2(-100, -250));
            CreateButton(canvasObj, "StandBtn", "Stand", new Vector2(100, -250));
            CreateButton(canvasObj, "AdBtn", "Watch Ad (+5 Gems)", new Vector2(300, 100));
            
            CreateButton(canvasObj, "OpenShopBtn", "Shop", new Vector2(-300, 100));

            // Shop Panel
            GameObject shopPanel = GameObject.Find("ShopPanel");
            if (!shopPanel)
            {
                shopPanel = new GameObject("ShopPanel");
                shopPanel.transform.SetParent(canvasObj.transform, false);
                Image img = shopPanel.AddComponent<Image>();
                img.color = new Color(0, 0, 0, 0.9f);
                RectTransform rect = shopPanel.GetComponent<RectTransform>();
                rect.anchorMin = Vector2.zero;
                rect.anchorMax = Vector2.one;
                rect.offsetMin = Vector2.zero;
                rect.offsetMax = Vector2.zero;

                shopPanel.AddComponent<ShopUI>();

                CreateButton(shopPanel, "CloseShopBtn", "Close", new Vector2(300, 180));
                CreateButton(shopPanel, "BuyGemPackSmall", "50 Gems ($0.99)", new Vector2(-100, 0));
                CreateButton(shopPanel, "BuyGemPackLarge", "300 Gems ($4.99)", new Vector2(100, 0));
                CreateButton(shopPanel, "BuySkinRed", "Red Skin (100 Gems)", new Vector2(0, -100));
            }

            Debug.Log("Blackjack Scene Generated! Don't forget to assign Card Prefabs to the Deck in Inspector.");
        }

        static void CreateManager<T>(string name) where T : Component
        {
            if (!GameObject.Find(name)) new GameObject(name).AddComponent<T>();
        }

        static void CreateText(GameObject canvas, string name, string content, Vector2 pos)
        {
            if (GameObject.Find(name)) return;
            GameObject txtObj = new GameObject(name);
            txtObj.transform.SetParent(canvas.transform, false);
            Text t = txtObj.AddComponent<Text>();
            t.text = content;
            t.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            t.color = Color.white;
            t.alignment = TextAnchor.MiddleCenter;
            t.fontSize = 24;
            t.rectTransform.sizeDelta = new Vector2(200, 50);
            t.rectTransform.anchoredPosition = pos;
        }

        static void CreateButton(GameObject parent, string name, string label, Vector2 pos)
        {
            if (GameObject.Find(name)) return; // Search globally or in parent? For simplicity globally unique names.
            
            // Re-check child
            foreach(Transform t in parent.transform) if(t.name == name) return;

            GameObject btnObj = new GameObject(name);
            btnObj.transform.SetParent(parent.transform, false);
            Image img = btnObj.AddComponent<Image>();
            img.color = Color.gray;
            Button btn = btnObj.AddComponent<Button>();
            
            GameObject textObj = new GameObject("Text");
            textObj.transform.SetParent(btnObj.transform, false);
            Text tLabel = textObj.AddComponent<Text>();
            tLabel.text = label;
            tLabel.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            tLabel.color = Color.black;
            tLabel.alignment = TextAnchor.MiddleCenter;
            
            RectTransform rect = btnObj.GetComponent<RectTransform>();
            rect.sizeDelta = new Vector2(160, 40);
            rect.anchoredPosition = pos;
            
            RectTransform textRect = textObj.GetComponent<RectTransform>();
            textRect.anchorMin = Vector2.zero;
            textRect.anchorMax = Vector2.one;
            textRect.offsetMin = Vector2.zero;
            textRect.offsetMax = Vector2.zero;
        }
    }
}
#endif
