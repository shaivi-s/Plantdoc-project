import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguage } from "../context/LanguageContext";
import { useUser } from "../context/UserContext";
import { uploadProfilePhoto } from "../services/api";

export default function ProfileScreen({ navigation }) {
  const { user, setUser, token } = useUser();
  const { t, language, setLanguage } = useLanguage();
  const [uploading, setUploading] = useState(false);

  const handleLogout = () => {
    setUser(null);
    navigation.replace("Login");
  };

  const changePhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission Required", "Please allow photo access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (result.canceled) return;

    const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
    setUploading(true);
    try {
      await uploadProfilePhoto(base64, token);
      setUser({ ...user, profile_image: base64 });
    } catch (error) {
      Alert.alert("Upload Failed", error.message);
    } finally {
      setUploading(false);
    }
  };

  const chooseLanguage = () => {
    Alert.alert(t("language"), "", [
      { text: t("english"), onPress: () => setLanguage("en") },
      { text: t("nepali"), onPress: () => setLanguage("ne") },
      { text: t("cancel"), style: "cancel" },
    ]);
  };

  const showHelp = () => {
    Alert.alert(t("helpSupport"), t("helpContent"), [{ text: t("ok") }]);
  };

  const showAbout = () => {
    Alert.alert(t("aboutApp"), t("aboutContent"), [{ text: t("ok") }]);
  };

  const resetLanguagePicker = async () => {
    await AsyncStorage.removeItem("hasSelectedLanguage");
    Alert.alert(
      "Reset",
      "The language picker will show again next time you log out and restart the app.",
    );
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : null;

  const options = [
    {
      icon: "create-outline",
      label: t("editProfile"),
      value: "",
      action: () => navigation.navigate("EditProfile"),
    },
    {
      icon: "key-outline",
      label: t("changePasswordLabel"),
      value: "",
      action: () => navigation.navigate("ChangePassword"),
    },
    {
      icon: "language-outline",
      label: t("language"),
      value: language === "en" ? t("english") : t("nepali"),
      action: chooseLanguage,
    },
    {
      icon: "notifications-outline",
      label: t("notifications"),
      value: "",
      action: () => navigation.navigate("NotificationSettings"),
    },
    {
      icon: "help-circle-outline",
      label: t("helpSupport"),
      value: "",
      action: showHelp,
    },
    {
      icon: "information-circle-outline",
      label: t("aboutApp"),
      value: "",
      action: showAbout,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={styles.headerTitle}>{t("profile")}</Text>

        <View style={styles.profileCard}>
          <TouchableOpacity onPress={changePhoto} activeOpacity={0.8}>
            {user?.profile_image ? (
              <Image
                source={{ uri: user.profile_image }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.full_name
                    ? user.full_name.charAt(0).toUpperCase()
                    : "?"}
                </Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              {uploading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="camera" size={16} color="#FFF" />
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{user?.full_name || t("guestUser")}</Text>
          <Text style={styles.email}>{user?.email || t("notLoggedIn")}</Text>

          {user?.phone ? (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={14} color="#666" />
              <Text style={styles.infoText}>{user.phone}</Text>
            </View>
          ) : null}

          {user?.location ? (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.infoText}>{user.location}</Text>
            </View>
          ) : null}

          {memberSince ? (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={styles.infoText}>Member since {memberSince}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.optionsCard}>
          {options.map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={item.action}
              style={[
                styles.optionRow,
                i !== options.length - 1 && styles.optionBorder,
              ]}
            >
              <Ionicons name={item.icon} size={22} color="#608151" />
              <Text style={styles.optionLabel}>{item.label}</Text>
              {item.value ? (
                <Text style={styles.optionValue}>{item.value}</Text>
              ) : null}
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#E53935" />
          <Text style={styles.logoutText}>{t("logOut")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => navigation.navigate("DeleteAccount")}
        >
          <Ionicons name="trash-outline" size={18} color="#999" />
          <Text style={styles.deleteText}>{t("deleteAccount")}</Text>
        </TouchableOpacity>

        <Text style={styles.version}>PlantDoc v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7F2", paddingTop: 40 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#608151",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  avatarText: { color: "#FFF", fontSize: 32, fontWeight: "bold" },
  cameraBadge: {
    position: "absolute",
    bottom: 12,
    right: -2,
    backgroundColor: "#608151",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  name: { fontSize: 20, fontWeight: "bold", color: "#333" },
  email: { fontSize: 14, color: "#666", marginTop: 4 },
  infoRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 4 },
  infoText: { fontSize: 13, color: "#666" },
  optionsCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  optionBorder: { borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  optionLabel: { flex: 1, fontSize: 15, color: "#333" },
  optionValue: { fontSize: 14, color: "#999", marginRight: 8 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E53935",
    borderRadius: 16,
    gap: 8,
  },
  logoutText: { color: "#E53935", fontWeight: "bold", fontSize: 15 },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    gap: 6,
  },
  deleteText: { color: "#999", fontSize: 14 },
  version: { textAlign: "center", color: "#AAA", fontSize: 13, marginTop: 20 },
});
