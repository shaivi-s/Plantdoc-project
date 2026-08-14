import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguage } from "../context/LanguageContext";
import { useUser } from "../context/UserContext";
import { loginUser } from "../services/api";

export default function LoginScreen({ navigation }) {
  const { setUser, setToken } = useUser();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t("missingInfo"), t("enterEmailPassword"));
      return;
    }
    setLoading(true);
    try {
      const data = await loginUser(email.trim(), password);
      setUser(data.user);
      setToken(data.access_token);
      console.log("Saved login, token exists:", !!data.access_token);
      navigation.navigate("Main");
    } catch (error) {
      Alert.alert(t("loginFailed"), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.logoRow}>
          <Ionicons name="leaf" size={36} color="#608151" />
          <Text style={styles.logoText}>PlantDoc</Text>
        </View>

        <Text style={styles.title}>{t("welcomeBack")}</Text>
        <Text style={styles.subtitle}>{t("loginSubtitle")}</Text>

        <Text style={styles.label}>{t("emailOrPhone")}</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="person-outline"
            size={20}
            color="#999"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={t("emailPlaceholder")}
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.label}>{t("password")}</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#999"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={t("passwordPlaceholder")}
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRemember(!remember)}
          >
            <Ionicons
              name={remember ? "checkbox" : "square-outline"}
              size={20}
              color="#608151"
            />
            <Text style={styles.rememberText}>{t("rememberMe")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgot}>{t("forgotPassword")}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>{t("logIn")}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerWrapper}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.footerText}>
            {t("noAccount")} <Text style={styles.link}>{t("signUp")}</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { padding: 24, paddingTop: 70, flexGrow: 1 },
  logoRow: { flexDirection: "row", alignItems: "center", marginBottom: 40 },
  logoText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2E4620",
    marginLeft: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E4620",
    marginBottom: 6,
  },
  subtitle: { fontSize: 15, color: "#888", marginBottom: 30 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F4F1",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 15, color: "#333" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  rememberRow: { flexDirection: "row", alignItems: "center" },
  rememberText: { marginLeft: 8, color: "#555", fontSize: 14 },
  forgot: { color: "#608151", fontWeight: "600", fontSize: 14 },
  button: {
    backgroundColor: "#608151",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  footerWrapper: { marginTop: 24, alignItems: "center" },
  footerText: { color: "#666", fontSize: 14 },
  link: { color: "#608151", fontWeight: "bold" },
});
