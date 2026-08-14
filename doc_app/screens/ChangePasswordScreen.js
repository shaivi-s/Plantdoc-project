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
import { changePassword } from "../services/api";

export default function ChangePasswordScreen({ navigation }) {
  const { token, setUser } = useUser();
  const { t } = useLanguage();
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    if (!current || !newPass || !confirm) {
      Alert.alert(t("missingInfo"), t("enterEmailPassword"));
      return;
    }
    if (newPass !== confirm) {
      Alert.alert(t("passwordMismatch"), t("newPasswordsMismatch"));
      return;
    }
    setLoading(true);
    try {
      await changePassword(current, newPass, token);
      Alert.alert(t("passwordChangedTitle"), t("passwordChangedMessage"), [
        {
          text: t("ok"),
          onPress: () => {
            setUser(null);
            navigation.replace("Login");
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.back}
        >
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>{t("changePasswordTitle")}</Text>

        <Text style={styles.label}>{t("currentPasswordLabel")}</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#999"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            value={current}
            onChangeText={setCurrent}
            secureTextEntry={!show}
            placeholder={t("currentPasswordPlaceholder")}
            placeholderTextColor="#999"
          />
        </View>

        <Text style={styles.label}>{t("newPasswordLabel")}</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#999"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            value={newPass}
            onChangeText={setNewPass}
            secureTextEntry={!show}
            placeholder={t("newPasswordPlaceholder")}
            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={() => setShow(!show)}>
            <Ionicons
              name={show ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>{t("passwordHint")}</Text>

        <Text style={styles.label}>{t("confirmNewPasswordLabel")}</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#999"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!show}
            placeholder={t("confirmNewPasswordPlaceholder")}
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleChange}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>{t("changePasswordButton")}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  content: { padding: 24, paddingTop: 50 },
  back: { marginBottom: 20 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2E4620",
    marginBottom: 24,
  },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F4F1",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 15, color: "#333" },
  hint: {
    fontSize: 12,
    color: "#999",
    marginTop: -10,
    marginBottom: 16,
    marginLeft: 4,
  },
  button: {
    backgroundColor: "#608151",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
