import AsyncStorage from "@react-native-async-storage/async-storage";

const DONATIONS_KEY = "zh_donations";
const MEALS_KEY = "zh_meals_saved";

export async function getDonations() {
  try {
    const data = await AsyncStorage.getItem(DONATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveDonation(donation) {
  const donations = await getDonations();
  donations.unshift(donation);
  await AsyncStorage.setItem(DONATIONS_KEY, JSON.stringify(donations));
}

export async function updateDonation(id, updates) {
  const donations = await getDonations();
  const index = donations.findIndex((d) => d.id === id);
  if (index !== -1) {
    donations[index] = { ...donations[index], ...updates };
    await AsyncStorage.setItem(DONATIONS_KEY, JSON.stringify(donations));
  }
}

export async function getMealsSaved() {
  try {
    const val = await AsyncStorage.getItem(MEALS_KEY);
    return val ? parseInt(val) : 0;
  } catch {
    return 0;
  }
}

export async function addMealsSaved(qty) {
  const current = await getMealsSaved();
  const num = parseInt(qty) || 1;
  await AsyncStorage.setItem(MEALS_KEY, String(current + num));
}
