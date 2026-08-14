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
import { deleteAccount } from "../services/api";

export default function DeleteAccountScreen({ navigation }) {
  const { setUser, token } = useUser();
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    if (!password) {
      Alert.alert(t("passwordRequired"), t("enterPasswordToConfirm"));
      return;
    }
    Alert.alert(
      t("deleteAccountConfirmTitle"),
      t("deleteAccountConfirmMessage"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("deleteForever"),
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await deleteAccount(password, token);
              setUser(null);
              navigation.replace("Login");
            } catch (error) {
              Alert.alert("Error", error.message);
              setLoading(false);
            }
          },
        },
      ],
    );
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

        <View style={styles.warnCircle}>
          <Ionicons name="warning" size={36} color="#D32F2F" />
        </View>

        <Text style={styles.title}>{t("deleteAccountTitle")}</Text>
        <Text style={styles.subtitle}>{t("deleteAccountWarning")}</Text>

        <Text style={styles.label}>{t("password")}</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#999"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!show}
            placeholder={t("passwordPlaceholder")}
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

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.deleteButtonText}>{t("deleteMyAccount")}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>{t("cancel")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  content: { padding: 24, paddingTop: 50 },
  back: { marginBottom: 20 },
  warnCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FDEDED",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#D32F2F",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
  },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F4F1",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 24,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 15, color: "#333" },
  deleteButton: {
    backgroundColor: "#D32F2F",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  cancelButton: { paddingVertical: 16, alignItems: "center", marginTop: 8 },
  cancelText: { color: "#608151", fontSize: 15, fontWeight: "600" },
});
