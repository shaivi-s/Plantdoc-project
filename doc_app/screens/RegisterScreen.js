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
import { registerUser } from "../services/api";

export default function RegisterScreen({ navigation }) {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkPassword = (pw) => {
    if (pw.length < 8) return t("passwordMustBe8");
    if (!/[A-Za-z]/.test(pw)) return t("passwordMustContainLetter");
    if (!/[0-9]/.test(pw)) return t("passwordMustContainNumber");
    if (!/[^A-Za-z0-9]/.test(pw)) return t("passwordMustContainSymbol");
    return null;
  };

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert(t("missingInfo"), t("enterEmailPassword"));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t("passwordMismatch"), t("passwordsDoNotMatch"));
      return;
    }

    const pwError = checkPassword(password);
    if (pwError) {
      Alert.alert(t("weakPassword"), pwError);
      return;
    }

    setLoading(true);
    try {
      await registerUser(fullName, email.trim(), password, phone, "Kathmandu");
      Alert.alert(t("registrationSuccessful"), t("accountCreatedLoginPrompt"), [
        { text: "OK", onPress: () => navigation.replace("Login") },
      ]);
    } catch (error) {
      Alert.alert(t("registrationFailed"), error.message);
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
          <Ionicons name="leaf" size={32} color="#608151" />
          <Text style={styles.logoText}>PlantDoc</Text>
        </View>
        <Text style={styles.title}>{t("registration")}</Text>

        <Text style={styles.label}>{t("fullName")}</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="person-outline"
            size={20}
            color="#999"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={t("enterName")}
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <Text style={styles.label}>{t("email")}</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="#999"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={t("enterEmail")}
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.label}>{t("phoneNumber")}</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="call-outline"
            size={20}
            color="#999"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="+977 98XXXXXXXX"
            placeholderTextColor="#999"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
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
        <Text style={styles.hint}>{t("passwordHint")}</Text>

        <Text style={styles.label}>{t("confirmPassword")}</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#999"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={t("confirmPassword")}
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
            <Ionicons
              name={showConfirm ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>{t("register")}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>{t("haveAccount")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { padding: 24, paddingTop: 50, flexGrow: 1 },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E4620",
    marginLeft: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2E4620",
    marginBottom: 20,
  },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F4F1",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: "#333" },
  hint: {
    fontSize: 12,
    color: "#999",
    marginTop: -8,
    marginBottom: 14,
    marginLeft: 4,
  },
  button: {
    backgroundColor: "#608151",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  link: {
    color: "#608151",
    textAlign: "center",
    marginTop: 18,
    fontWeight: "500",
  },
});
