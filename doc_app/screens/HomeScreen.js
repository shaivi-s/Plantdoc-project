import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguage } from "../context/LanguageContext";
import { useUser } from "../context/UserContext";
import { getScans } from "../services/api";
import { getWeather } from "../services/weather";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const diseaseKeyMap = {
  "Maize Blight": "diseaseMaizeBlight",
  "Maize Common Rust": "diseaseMaizeCommonRust",
  "Maize Gray Leaf Spot": "diseaseMaizeGrayLeafSpot",
  "Maize Healthy": "diseaseMaizeHealthy",
  "Wheat Brown Rust": "diseaseWheatBrownRust",
  "Wheat Yellow Rust": "diseaseWheatYellowRust",
  "Wheat Healthy": "diseaseWheatHealthy",
};

const weatherDescriptionMap = {
  "clear sky": "खुला आकाश",
  "few clouds": "थोरै बादल",
  "scattered clouds": "छरिएको बादल",
  "broken clouds": "बादल",
  "overcast clouds": "प्रायः बादल",
  "light rain": "हल्का पानी",
  "moderate rain": "मध्यम पानी",
  "heavy intensity rain": "धेरै पानी",
  thunderstorm: "चट्याङ",
  mist: "कुइरो",
  haze: "धमिलो",
};

async function setupNotifications() {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return;

    const alreadyConfigured = await AsyncStorage.getItem("notif_configured");
    if (alreadyConfigured) return;

    await AsyncStorage.setItem("notif_configured", "true");

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "PlantDoc Reminder",
        body: "Time to check your crops for any signs of disease.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 8,
        minute: 0,
      },
    });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Weekly Check-in",
        body: "Review your scan history to track your crops' health over time.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 1,
        hour: 9,
        minute: 0,
      },
    });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Rainy Season Alert",
        body: "Humid weather increases fungal disease risk. Inspect your crops regularly.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 7,
        minute: 30,
      },
    });
  } catch (e) {
    // Fail silently
  }
}

export default function HomeScreen({ navigation }) {
  const { user, token } = useUser();
  const { t, language } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [recentScans, setRecentScans] = useState([]);

  const displayDiseaseName = (name) => {
    const key = diseaseKeyMap[name];
    return key ? t(key) : name;
  };

  const displayWeatherDescription = (description) => {
    if (language === "ne" && weatherDescriptionMap[description]) {
      return weatherDescriptionMap[description];
    }
    return description;
  };

  useEffect(() => {
    getWeather(language)
      .then(setWeather)
      .catch(() => setWeather({ error: true }));
  }, [language]);

  useEffect(() => {
    setupNotifications();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      getScans(token)
        .then((data) => setRecentScans(data.slice(0, 3)))
        .catch(() => setRecentScans([]));
    }, [token]),
  );

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(t("permissionRequired"), t("allowCamera"));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) {
      navigation.navigate("Result", { imageUri: result.assets[0].uri });
    }
  };

  const openGallery = async () => {
    // On web, browsers handle file access via their own dialog — skip the permission check
    if (Platform.OS !== "web") {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert(t("permissionRequired"), t("allowPhotos"));
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) {
      navigation.navigate("Result", { imageUri: result.assets[0].uri });
    }
  };

  const chooseImageSource = () => {
    if (Platform.OS === "web") {
      openGallery();
    } else {
      Alert.alert(t("scanTitle"), t("scanMessage"), [
        { text: t("takePhoto"), onPress: openCamera },
        { text: t("chooseGallery"), onPress: openGallery },
        { text: t("cancel"), style: "cancel" },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7F2" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {t("greeting")},{" "}
              {user?.full_name ? user.full_name.split(" ")[0] : "there"} 👋
            </Text>
            <Text style={styles.subGreeting}>{t("checkCrops")}</Text>
          </View>
        </View>

        <View style={styles.weatherCard}>
          <View style={styles.weatherLeft}>
            <Ionicons
              name={weather?.isRaining ? "rainy" : "sunny"}
              size={36}
              color={weather?.isRaining ? "#4A90D9" : "#FDB813"}
            />
            <View style={styles.weatherTextContainer}>
              <Text style={styles.weatherLocation}>
                {weather?.city ||
                  (weather?.error ? t("locationOff") : t("locating"))}
              </Text>
              <Text style={styles.weatherTemp}>
                {weather?.temp !== undefined
                  ? `${displayWeatherDescription(weather.description)}, ${weather.temp}°C`
                  : t("loading")}
              </Text>
            </View>
          </View>

          {weather?.temp !== undefined && (
            <View style={styles.rainAlert}>
              {weather.isRaining ? (
                <Text style={styles.rainNow}>🌧 {t("rainingNow")}</Text>
              ) : weather.rainSoon ? (
                <Text style={styles.rainSoon}>☔ {t("rainExpected")}</Text>
              ) : (
                <Text style={styles.noRain}>{t("noRain")}</Text>
              )}
              <Text style={styles.humidity}>
                {t("humidity")} {weather.humidity}%
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.scanButton}
          activeOpacity={0.8}
          onPress={chooseImageSource}
        >
          <Ionicons
            name="camera"
            size={24}
            color="#FFFFFF"
            style={styles.scanIcon}
          />
          <Text style={styles.scanButtonText}>{t("scanPlant")}</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("myPlants")}</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          <TouchableOpacity
            style={[styles.plantCard, { backgroundColor: "#A09E6D" }]}
            onPress={() =>
              navigation.navigate("PlantDetail", { plant: "Wheat" })
            }
          >
            <Text style={styles.plantName}>{t("wheat")}</Text>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=200&q=80",
              }}
              style={styles.plantImage}
            />
            <View style={[styles.statusTag, { backgroundColor: "#E1E9F1" }]}>
              <Text style={[styles.statusText, { color: "#4A708B" }]}>
                {t("tapToView")}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.plantCard, { backgroundColor: "#738C6D" }]}
            onPress={() =>
              navigation.navigate("PlantDetail", { plant: "Maize" })
            }
          >
            <Text style={styles.plantName}>{t("maize")}</Text>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=200&q=80",
              }}
              style={styles.plantImage}
            />
            <View style={styles.statusTag}>
              <Text style={styles.statusText}>{t("tapToView")}</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        <Text
          style={[
            styles.sectionTitle,
            { marginLeft: 20, marginTop: 10, marginBottom: 15 },
          ]}
        >
          {t("recentScans")}
        </Text>

        {recentScans.length === 0 ? (
          <View style={styles.emptyScans}>
            <Text style={styles.emptyScansText}>{t("noScansYet")}</Text>
          </View>
        ) : (
          recentScans.map((scan) => (
            <View key={scan.id} style={styles.recentScanCard}>
              <View
                style={[
                  styles.scanIconCircle,
                  { backgroundColor: scan.is_healthy ? "#D1E6CE" : "#FBE0E0" },
                ]}
              >
                <Ionicons
                  name={scan.is_healthy ? "checkmark-circle" : "warning"}
                  size={22}
                  color={scan.is_healthy ? "#2E8B57" : "#D32F2F"}
                />
              </View>
              <View style={styles.scanDetails}>
                <Text style={styles.scanRecordTitle}>
                  {displayDiseaseName(scan.predicted_class)}
                </Text>
                <Text style={styles.scanTime}>
                  {formatDate(scan.created_at)} · {scan.confidence.toFixed(1)}%
                </Text>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7F2" },
  scrollContent: { paddingTop: Platform.OS === "android" ? 40 : 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  greeting: { fontSize: 22, fontWeight: "700", color: "#2E4620" },
  subGreeting: { fontSize: 13, color: "#888", marginTop: 2 },
  weatherCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
    marginBottom: 25,
  },
  weatherLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  weatherTextContainer: { marginLeft: 12, flex: 1 },
  weatherLocation: { fontSize: 14, color: "#888", fontWeight: "500" },
  weatherTemp: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    textTransform: "capitalize",
  },
  rainAlert: { alignItems: "flex-end" },
  rainNow: { fontSize: 13, color: "#4A90D9", fontWeight: "600" },
  rainSoon: { fontSize: 13, color: "#E8A33D", fontWeight: "600" },
  noRain: { fontSize: 13, color: "#888" },
  humidity: { fontSize: 12, color: "#999", marginTop: 4 },
  scanButton: {
    backgroundColor: "#608151",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 30,
    elevation: 5,
    marginBottom: 30,
  },
  scanIcon: { marginRight: 10 },
  scanButtonText: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 20, fontWeight: "600", color: "#111" },
  horizontalScroll: { marginBottom: 10 },
  plantCard: {
    width: 110,
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
    marginRight: 15,
  },
  plantName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  plantImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#FFF",
    marginBottom: 10,
  },
  statusTag: {
    backgroundColor: "#D1E6CE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { color: "#2A4A28", fontSize: 10, fontWeight: "bold" },
  recentScanCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 14,
    elevation: 1,
  },
  scanIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  scanDetails: { flex: 1 },
  scanRecordTitle: { fontSize: 15, fontWeight: "600", color: "#111" },
  scanTime: { fontSize: 12, color: "#666", marginTop: 3 },
  emptyScans: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 14,
    alignItems: "center",
  },
  emptyScansText: { fontSize: 13, color: "#999" },
});
