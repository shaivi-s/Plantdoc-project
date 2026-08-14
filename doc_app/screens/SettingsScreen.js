import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguage } from "../context/LanguageContext";

export default function SettingsScreen() {
  const { t, language, setLanguage } = useLanguage();

  const chooseLanguage = () => {
    Alert.alert(t("language"), "", [
      { text: t("english"), onPress: () => setLanguage("en") },
      { text: t("nepali"), onPress: () => setLanguage("ne") },
      { text: t("cancel"), style: "cancel" },
    ]);
  };

  const showAbout = () => {
    Alert.alert(
      t("aboutApp"),
      "PlantDoc detects diseases in wheat and maize from a leaf photo and recommends treatment.\n\nVersion 1.0.0",
      [{ text: t("ok") }],
    );
  };

  const showHelp = () => {
    Alert.alert(
      t("helpSupport"),
      "1. Tap 'Scan Plant'\n2. Take or choose a leaf photo\n3. View the detected disease\n4. Tap for medicine details\n\nUse good lighting and photograph a single leaf.",
      [{ text: t("ok") }],
    );
  };

  const comingSoon = (title) =>
    Alert.alert(title, "This feature is planned for a future update.", [
      { text: t("ok") },
    ]);

  const options = [
    {
      icon: "language-outline",
      label: t("language"),
      value: language === "en" ? t("english") : t("nepali"),
      action: chooseLanguage,
    },
    {
      icon: "notifications-outline",
      label: t("notifications"),
      value: t("on"),
      action: () => comingSoon(t("notifications")),
    },
    {
      icon: "moon-outline",
      label: t("darkMode"),
      value: t("off"),
      action: () => comingSoon(t("darkMode")),
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
        <Text style={styles.headerTitle}>{t("settings")}</Text>
        <View style={styles.card}>
          {options.map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={item.action}
              style={[styles.row, i !== options.length - 1 && styles.rowBorder]}
            >
              <Ionicons name={item.icon} size={22} color="#608151" />
              <Text style={styles.label}>{item.label}</Text>
              {item.value ? (
                <Text style={styles.value}>{item.value}</Text>
              ) : null}
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
          ))}
        </View>
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
  card: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  label: { flex: 1, fontSize: 15, color: "#333" },
  value: { fontSize: 14, color: "#999", marginRight: 8 },
  version: { textAlign: "center", color: "#AAA", fontSize: 13, marginTop: 24 },
});
