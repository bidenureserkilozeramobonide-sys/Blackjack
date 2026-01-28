using UnityEngine;

namespace Systems
{
    public class EconomyManager : MonoBehaviour
    {
        public static EconomyManager Instance;

        public int chips;
        public int gems;

        private const string CHIPS_KEY = "Chips";
        private const string GEMS_KEY = "Gems";

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);

            LoadEconomy();
        }

        public void LoadEconomy()
        {
            chips = PlayerPrefs.GetInt(CHIPS_KEY, 1000); // Default 1000 chips
            gems = PlayerPrefs.GetInt(GEMS_KEY, 0);
        }

        public void SaveEconomy()
        {
            PlayerPrefs.SetInt(CHIPS_KEY, chips);
            PlayerPrefs.SetInt(GEMS_KEY, gems);
            PlayerPrefs.Save();
        }

        public bool TrySpendChips(int amount)
        {
            if (chips >= amount)
            {
                chips -= amount;
                SaveEconomy();
                return true;
            }
            return false;
        }

        public void AddChips(int amount)
        {
            chips += amount;
            SaveEconomy();
        }

        public bool TrySpendGems(int amount)
        {
            if (gems >= amount)
            {
                gems -= amount;
                SaveEconomy();
                return true;
            }
            return false;
        }

        public void AddGems(int amount)
        {
            gems += amount;
            SaveEconomy();
        }
    }
}
