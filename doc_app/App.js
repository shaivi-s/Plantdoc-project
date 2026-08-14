import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LanguageProvider } from "./context/LanguageContext";
import { UserProvider } from "./context/UserContext";
import AppNavigator from "./navigation/AppNavigator";

export default function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </UserProvider>
    </LanguageProvider>
  );
}
