import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("auth_user");
      const storedToken = await AsyncStorage.getItem("auth_token");
      if (storedUser && storedToken) {
        setUserState(JSON.parse(storedUser));
        setTokenState(storedToken);
      }
    } catch (e) {
      // Fail silently, user just needs to log in again
    } finally {
      setLoading(false);
    }
  };

  const setUser = async (userData) => {
    setUserState(userData);
    if (userData) {
      await AsyncStorage.setItem("auth_user", JSON.stringify(userData));
    } else {
      await AsyncStorage.removeItem("auth_user");
    }
  };

  const setToken = async (tokenData) => {
    setTokenState(tokenData);
    if (tokenData) {
      await AsyncStorage.setItem("auth_token", tokenData);
    } else {
      await AsyncStorage.removeItem("auth_token");
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, token, setToken, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
