import { create } from "zustand";
import { Preferences } from "@capacitor/preferences";

const FAVOURITES_KEY = "pb-favourites";

interface FavouritesStore {
  favouriteIds: number[];

  loadFavourites: () => Promise<void>;

  toggleFavourite: (empCode: number) => Promise<void>;

  isFavourite: (empCode: number) => boolean;

  clearFavourites: () => Promise<void>;
}

export const useFavourites = create<FavouritesStore>((set, get) => ({
  favouriteIds: [],

  loadFavourites: async () => {
    try {
      const { value } = await Preferences.get({
        key: FAVOURITES_KEY,
      });

      const favourites: number[] = value ? JSON.parse(value) : [];

      set({
        favouriteIds: favourites,
      });
    } catch (error) {
      console.error("Failed to load favourites", error);
    }
  },

  toggleFavourite: async (empCode: number) => {
    try {
      const current = get().favouriteIds;

      const updated = current.includes(empCode)
        ? current.filter((id) => id !== empCode)
        : [...current, empCode];

      set({
        favouriteIds: updated,
      });

      await Preferences.set({
        key: FAVOURITES_KEY,
        value: JSON.stringify(updated),
      });
    } catch (error) {
      console.error("Failed to update favourites", error);
    }
  },

  isFavourite: (empCode: number) => {
    return get().favouriteIds.includes(empCode);
  },

  clearFavourites: async () => {
    try {
      set({
        favouriteIds: [],
      });

      await Preferences.remove({
        key: FAVOURITES_KEY,
      });
    } catch (error) {
      console.error("Failed to clear favourites", error);
    }
  },
}));
