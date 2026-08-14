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
import { updateProfile } from "../services/api";

export default function EditProfileScreen({ navigation }) {
  const { user, setUser, token } = useUser();
  const { t } = useLanguage();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(user?.location || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert(t("missingInfo"), t("nameEmptyError"));
      return;
    }
    setLoading(true);
    try {
      const updated = await updateProfile(
        { full_name: fullName, phone, location },
        token,
      );
      setUser({ ...user, ...updated });
      Alert.alert(t("profileSaved"), t("profileSavedMessage"), [
        { text: t("ok"), onPress: () => navigation.goBack() },
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

        <Text style={styles.title}>{t("editProfileTitle")}</Text>

        <Text style={styles.label}>{t("fullNameLabel")}</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="person-outline"
            size={20}
            color="#999"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder={t("yourName")}
            placeholderTextColor="#999"
          />
        </View>

        <Text style={styles.label}>{t("phoneLabel")}</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="call-outline"
            size={20}
            color="#999"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder={t("yourPhone")}
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.label}>{t("locationLabel")}</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="location-outline"
            size={20}
            color="#999"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder={t("yourLocation")}
            placeholderTextColor="#999"
          />
        </View>

        <Text style={styles.note}>{t("emailCannotChange")}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>{t("saveChanges")}</Text>
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
  note: { fontSize: 12, color: "#999", marginBottom: 20, marginLeft: 4 },
  button: {
    backgroundColor: "#608151",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
