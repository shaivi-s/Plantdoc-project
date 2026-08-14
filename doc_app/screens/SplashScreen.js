import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguage } from "../context/LanguageContext";
import { useUser } from "../context/UserContext";

export default function SplashScreen({ navigation }) {
  const { setLanguage } = useLanguage();
  const { user, token } = useUser();
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setChecking(false);
      setShowLanguagePicker(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const choose = (lang) => {
    setLanguage(lang);
    setShowLanguagePicker(false);
    navigation.replace(user && token ? "Main" : "Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🌿 PlantDoc AI</Text>
      {checking && (
        <ActivityIndicator
          size="large"
          color="#0a0a0a"
          style={{ marginTop: 20 }}
        />
      )}

      <Modal visible={showLanguagePicker} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.box}>
            <Ionicons name="language" size={32} color="#608151" />
            <Text style={styles.boxTitle}>
              Choose your language{"\n"}भाषा छान्नुहोस्
            </Text>

            <TouchableOpacity
              style={styles.langButton}
              onPress={() => choose("en")}
            >
              <Text style={styles.langButtonText}>English</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.langButton}
              onPress={() => choose("ne")}
            >
              <Text style={styles.langButtonText}>नेपाली</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E8B57",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: { fontSize: 34, fontWeight: "bold", color: "#eadcdc" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 28,
    width: "80%",
    alignItems: "center",
  },
  boxTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 24,
    lineHeight: 22,
  },
  langButton: {
    backgroundColor: "#608151",
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  langButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
