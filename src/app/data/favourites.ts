import { create } from "zustand";
import { Preferences } from "@capacitor/preferences";
import { Employees } from "../models/employees";

const FAVOURITES_KEY = "pb-favourites";

interface FavouritesData {
  favouriteIds: number[];
  favouriteContacts: Employees[];
}

interface FavouritesStore {
  favouriteIds: number[];
  favouriteContacts: Employees[];

  loadFavourites: () => Promise<void>;

  toggleFavourite: (employee: Employees) => Promise<void>;

  isFavourite: (empCode: number) => boolean;

  clearFavourites: () => Promise<void>;
}

export const useFavourites = create<FavouritesStore>((set, get) => ({
  favouriteIds: [],
  favouriteContacts: [],

  loadFavourites: async () => {
    try {
      const { value } = await Preferences.get({
        key: FAVOURITES_KEY,
      });

      if (!value) {
        return;
      }

      const data: FavouritesData = JSON.parse(value);

      set({
        favouriteIds: data.favouriteIds || [],
        favouriteContacts: data.favouriteContacts || [],
      });
    } catch (error) {
      console.error("Failed to load favourites", error);
    }
  },

  toggleFavourite: async (employee: Employees) => {
    try {
      const { favouriteIds, favouriteContacts } = get();

      const exists = favouriteIds.includes(employee.EmpCode);

      let updatedIds: number[];
      let updatedContacts: Employees[];

      if (exists) {
        updatedIds = favouriteIds.filter((id) => id !== employee.EmpCode);

        updatedContacts = favouriteContacts.filter(
          (item) => item.EmpCode !== employee.EmpCode,
        );
      } else {
        updatedIds = [...favouriteIds, employee.EmpCode];

        updatedContacts = [...favouriteContacts, employee];
      }

      const saveData: FavouritesData = {
        favouriteIds: updatedIds,
        favouriteContacts: updatedContacts,
      };

      set(saveData);

      await Preferences.set({
        key: FAVOURITES_KEY,
        value: JSON.stringify(saveData),
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
        favouriteContacts: [],
      });

      await Preferences.remove({
        key: FAVOURITES_KEY,
      });
    } catch (error) {
      console.error("Failed to clear favourites", error);
    }
  },
}));
