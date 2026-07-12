import { Preferences } from "@capacitor/preferences";
const FAVOURITES_KEY = "pb-favourites";
const DIRECTORY_KEY = "directory-data";
const EMPLOYEES_SEARCH_DATA = "EMPLOYEES_SEARCH_DATA";
const EMPLOYEES_DATA_LIST = "EMPLOYEES_DATA_LIST";

// /saveEMPLOYEES_DATA_LIST
export const saveEMPLOYEES_DATA_LIST = async (data: any) => {
  await Preferences.set({
    key: EMPLOYEES_DATA_LIST,
    value: JSON.stringify(data),
  });
};
//  getEMPLOYEES_DATA_LIST
export const getEMPLOYEES_DATA_LIST = async () => {
  const { value } = await Preferences.get({ key: EMPLOYEES_DATA_LIST });
  return value ? JSON.parse(value) : [];
};

//  saveEmployees
export const saveEmployeesSeachData = async (data: any) => {
  await Preferences.set({
    key: EMPLOYEES_SEARCH_DATA,
    value: JSON.stringify(data),
  });
};
//  getSavedEmployees
export const getEmployeesSeachData = async () => {
  const { value } = await Preferences.get({ key: EMPLOYEES_SEARCH_DATA });
  return value ? JSON.parse(value) : [];
};
// DIRECTORY
export const saveDirectoryData = async (
  employees: any[],
  designations: any[],
  stations: any[],
) => {
  await Preferences.set({
    key: DIRECTORY_KEY,
    value: JSON.stringify({
      employees,
      designations,
      stations,
    }),
  });
};
// getDirectoryData
export const getDirectoryData = async () => {
  try {
    const { value } = await Preferences.get({
      key: DIRECTORY_KEY,
    });

    if (!value) {
      return {
        employees: [],
        designations: [],
        stations: [],
      };
    }

    return JSON.parse(value);
  } catch (error) {
    console.error("Failed to parse directory data", error);

    return {
      employees: [],
      designations: [],
      stations: [],
    };
  }
};

// saveFavourites
export const saveFavourites = async (favourites: string[]) => {
  await Preferences.set({
    key: FAVOURITES_KEY,
    value: JSON.stringify(favourites),
  });
};
// getFavourites
export const getFavourites = async () => {
  const { value } = await Preferences.get({
    key: FAVOURITES_KEY,
  });

  return value ? JSON.parse(value) : [];
};
//clearFavouritesStorage
export const clearFavouritesStorage = async () => {
  await Preferences.remove({
    key: FAVOURITES_KEY,
  });
};

// TOKEN
export const saveToken = async (token: string) => {
  await Preferences.set({
    key: "token",
    value: token,
  });
};

export const getToken = async () => {
  const { value } = await Preferences.get({
    key: "token",
  });

  return value;
};

//Saved user details in preferences and can be accessed across the app
export const saveUserData = async (data: any) => {
  await Preferences.set({
    key: "user_data",
    value: JSON.stringify(data),
  });
};
//get user details from preferences
export const getUserData = async () => {
  const { value } = await Preferences.get({
    key: "user_data",
  });

  return value ? JSON.parse(value) : null;
};

// USER
export const saveUser = async (user: any) => {
  await Preferences.set({
    key: "user",
    value: JSON.stringify(user),
  });
};

export const getUser = async () => {
  const { value } = await Preferences.get({
    key: "user",
  });

  return value ? JSON.parse(value) : null;
};

// LOGIN TIME
export const saveLoginTime = async () => {
  const now = new Date().toISOString();

  await Preferences.set({
    key: "loginTime",
    value: now,
  });

  await Preferences.set({
    key: "lastActiveTime",
    value: now,
  });
};

export const getLoginTime = async () => {
  const { value } = await Preferences.get({
    key: "loginTime",
  });

  return value;
};

// ACTIVE TIME
export const updateLastActiveTime = async () => {
  await Preferences.set({
    key: "lastActiveTime",
    value: new Date().toISOString(),
  });
};

export const getLastActiveTime = async () => {
  const { value } = await Preferences.get({
    key: "lastActiveTime",
  });

  return value;
};

// LOGOUT
export const logoutUser = async () => {
  await Preferences.remove({
    key: "token",
  });
  await Preferences.remove({
    key: "user_data",
  });
  await Preferences.remove({
    key: "user",
  });
  await Preferences.remove({
    key: "loginTime",
  });
  await Preferences.remove({
    key: "lastActiveTime",
  });
  await Preferences.remove({
    key: FAVOURITES_KEY,
  });
  await Preferences.remove({
    key: DIRECTORY_KEY,
  });
  await Preferences.remove({
    key: EMPLOYEES_SEARCH_DATA,
  });

  // Clear all (remove all key and data)
  await Preferences.clear();
};
