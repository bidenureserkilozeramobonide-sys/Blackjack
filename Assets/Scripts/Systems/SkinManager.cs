using System.Collections.Generic;
using UnityEngine;

namespace Systems
{
    public class SkinManager : MonoBehaviour
    {
        public static SkinManager Instance;

        [System.Serializable]
        public class SkinItem
        {
            public string id;
            public string displayName;
            public int priceGems;
            public Sprite sprite; // The actual texture
            public bool unlocked;
        }

        [Header("Card Skins")]
        public List<SkinItem> cardSkins;
        public int currentCardSkinIndex = 0;

        [Header("Table Skins")]
        public List<SkinItem> tableSkins;
        public int currentTableSkinIndex = 0;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        private void Start()
        {
            // Load unlocked state from PlayerPrefs in real app
        }

        public bool TryUnlockCardSkin(int index)
        {
            if(index < 0 || index >= cardSkins.Count) return false;
            var skin = cardSkins[index];

            if(skin.unlocked) return true; // Already owned

            if(EconomyManager.Instance.TrySpendGems(skin.priceGems))
            {
                skin.unlocked = true;
                // Save unlock state
                return true;
            }
            return false;
        }

        public void EquipCardSkin(int index)
        {
            if(index >= 0 && index < cardSkins.Count && cardSkins[index].unlocked)
            {
                currentCardSkinIndex = index;
                // Notify Deck to update card backs
            }
        }
    }
}
