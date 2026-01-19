using UnityEngine;
using UnityEngine.UI;
using Systems;

namespace UI
{
    public class ShopUI : MonoBehaviour
    {
        [Header("Shop Buttons")]
        public Button buyGemPackSmallBtn;
        public Button buyGemPackLargeBtn;
        
        // Example for one skin for simplicity
        public Button buySkinRedBtn;

        private void Start()
        {
            AutoWireShop();
        }

        private void AutoWireShop()
        {
            AssignButton("BuyGemPackSmall", () => IAPManager.Instance.BuyGemPack_Small(), ref buyGemPackSmallBtn);
            AssignButton("BuyGemPackLarge", () => IAPManager.Instance.BuyGemPack_Large(), ref buyGemPackLargeBtn);
            
            // Example skin purchase (Index 0 is default/unlocked, Index 1 is premium)
            AssignButton("BuySkinRed", () => BuySkin(1), ref buySkinRedBtn);
        }

        void AssignButton(string name, UnityEngine.Events.UnityAction action, ref Button btnRef)
        {
            // Search inside the ShopPanel hierarchy ideally, but global Find for prototype simplicity
            // In a real scenario, we'd search children of transform
            Transform found = RecursiveFind(transform, name);
            if(found)
            {
                btnRef = found.GetComponent<Button>();
                btnRef.onClick.RemoveAllListeners();
                btnRef.onClick.AddListener(action);
            }
        }

        Transform RecursiveFind(Transform parent, string name)
        {
            foreach(Transform child in parent)
            {
                if(child.name == name) return child;
                Transform result = RecursiveFind(child, name);
                if(result) return result;
            }
            return null;
        }

        void BuySkin(int index)
        {
            if(SkinManager.Instance.TryUnlockCardSkin(index))
            {
                Debug.Log($"Unlocked Skin {index}");
                SkinManager.Instance.EquipCardSkin(index);
            }
            else
            {
                Debug.Log("Not enough Gems!");
            }
        }
    }
}
