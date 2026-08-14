import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguage } from "../context/LanguageContext";

const STORAGE_KEYS = {
  dailyEnabled: "notif_daily_enabled",
  dailyTime: "notif_daily_time",
  weeklyEnabled: "notif_weekly_enabled",
  weeklyTime: "notif_weekly_time",
  seasonalEnabled: "notif_seasonal_enabled",
  seasonalTime: "notif_seasonal_time",
};

export default function NotificationSettingsScreen({ navigation }) {
  const { t } = useLanguage();
  const [dailyEnabled, setDailyEnabled] = useState(true);
  const [dailyTime, setDailyTime] = useState(new Date(2000, 0, 1, 8, 0));
  const [weeklyEnabled, setWeeklyEnabled] = useState(true);
  const [weeklyTime, setWeeklyTime] = useState(new Date(2000, 0, 1, 9, 0));
  const [seasonalEnabled, setSeasonalEnabled] = useState(true);
  const [seasonalTime, setSeasonalTime] = useState(new Date(2000, 0, 1, 7, 30));

  const [showPicker, setShowPicker] = useState(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const de = await AsyncStorage.getItem(STORAGE_KEYS.dailyEnabled);
    const dt = await AsyncStorage.getItem(STORAGE_KEYS.dailyTime);
    const we = await AsyncStorage.getItem(STORAGE_KEYS.weeklyEnabled);
    const wt = await AsyncStorage.getItem(STORAGE_KEYS.weeklyTime);
    const se = await AsyncStorage.getItem(STORAGE_KEYS.seasonalEnabled);
    const st = await AsyncStorage.getItem(STORAGE_KEYS.seasonalTime);

    setDailyEnabled(de !== "false");
    setWeeklyEnabled(we !== "false");
    setSeasonalEnabled(se !== "false");
    if (dt) setDailyTime(new Date(dt));
    if (wt) setWeeklyTime(new Date(wt));
    if (st) setSeasonalTime(new Date(st));
  };

  const applyAll = async (de, dt, we, wt, se, st) => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (de) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: t("notifDailyTitle"),
            body: t("notifDailyBody"),
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: dt.getHours(),
            minute: dt.getMinutes(),
          },
        });
      }

      if (we) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: t("notifWeeklyTitle"),
            body: t("notifWeeklyBody"),
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: 1,
            hour: wt.getHours(),
            minute: wt.getMinutes(),
          },
        });
      }

      if (se) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: t("notifSeasonalTitle"),
            body: t("notifSeasonalBody"),
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: st.getHours(),
            minute: st.getMinutes(),
          },
        });
      }
    } catch (error) {
      Alert.alert("Notification Error", "Could not update reminder settings.");
    }
  };

  const toggleDaily = async (value) => {
    setDailyEnabled(value);
    await AsyncStorage.setItem(
      STORAGE_KEYS.dailyEnabled,
      value ? "true" : "false",
    );
    applyAll(
      value,
      dailyTime,
      weeklyEnabled,
      weeklyTime,
      seasonalEnabled,
      seasonalTime,
    );
  };

  const toggleWeekly = async (value) => {
    setWeeklyEnabled(value);
    await AsyncStorage.setItem(
      STORAGE_KEYS.weeklyEnabled,
      value ? "true" : "false",
    );
    applyAll(
      dailyEnabled,
      dailyTime,
      value,
      weeklyTime,
      seasonalEnabled,
      seasonalTime,
    );
  };

  const toggleSeasonal = async (value) => {
    setSeasonalEnabled(value);
    await AsyncStorage.setItem(
      STORAGE_KEYS.seasonalEnabled,
      value ? "true" : "false",
    );
    applyAll(
      dailyEnabled,
      dailyTime,
      weeklyEnabled,
      weeklyTime,
      value,
      seasonalTime,
    );
  };

  const onTimeChange = async (event, selectedTime) => {
    const which = showPicker;
    setShowPicker(null);
    if (!selectedTime) return;

    if (which === "daily") {
      setDailyTime(selectedTime);
      await AsyncStorage.setItem(
        STORAGE_KEYS.dailyTime,
        selectedTime.toISOString(),
      );
      applyAll(
        dailyEnabled,
        selectedTime,
        weeklyEnabled,
        weeklyTime,
        seasonalEnabled,
        seasonalTime,
      );
    } else if (which === "weekly") {
      setWeeklyTime(selectedTime);
      await AsyncStorage.setItem(
        STORAGE_KEYS.weeklyTime,
        selectedTime.toISOString(),
      );
      applyAll(
        dailyEnabled,
        dailyTime,
        weeklyEnabled,
        selectedTime,
        seasonalEnabled,
        seasonalTime,
      );
    } else if (which === "seasonal") {
      setSeasonalTime(selectedTime);
      await AsyncStorage.setItem(
        STORAGE_KEYS.seasonalTime,
        selectedTime.toISOString(),
      );
      applyAll(
        dailyEnabled,
        dailyTime,
        weeklyEnabled,
        weeklyTime,
        seasonalEnabled,
        selectedTime,
      );
    }
  };

  const formatTime = (date) =>
    date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.back}
        >
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>{t("notificationsTitle")}</Text>
        <Text style={styles.subtitle}>{t("notificationsSubtitle")}</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{t("dailyCropReminder")}</Text>
              <Text style={styles.rowHint}>{t("everyDay")}</Text>
            </View>
            <Switch
              value={dailyEnabled}
              onValueChange={toggleDaily}
              trackColor={{ true: "#608151" }}
            />
          </View>
          {dailyEnabled && (
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowPicker("daily")}
            >
              <Ionicons name="time-outline" size={18} color="#608151" />
              <Text style={styles.timeText}>{formatTime(dailyTime)}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{t("weeklyCheckIn")}</Text>
              <Text style={styles.rowHint}>{t("everyMonday")}</Text>
            </View>
            <Switch
              value={weeklyEnabled}
              onValueChange={toggleWeekly}
              trackColor={{ true: "#608151" }}
            />
          </View>
          {weeklyEnabled && (
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowPicker("weekly")}
            >
              <Ionicons name="time-outline" size={18} color="#608151" />
              <Text style={styles.timeText}>{formatTime(weeklyTime)}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{t("rainySeasonAlert")}</Text>
              <Text style={styles.rowHint}>{t("everyDay")}</Text>
            </View>
            <Switch
              value={seasonalEnabled}
              onValueChange={toggleSeasonal}
              trackColor={{ true: "#608151" }}
            />
          </View>
          {seasonalEnabled && (
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowPicker("seasonal")}
            >
              <Ionicons name="time-outline" size={18} color="#608151" />
              <Text style={styles.timeText}>{formatTime(seasonalTime)}</Text>
            </TouchableOpacity>
          )}
        </View>

        {showPicker && (
          <DateTimePicker
            value={
              showPicker === "daily"
                ? dailyTime
                : showPicker === "weekly"
                  ? weeklyTime
                  : seasonalTime
            }
            mode="time"
            is24Hour={false}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onTimeChange}
          />
        )}
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
    marginBottom: 6,
  },
  subtitle: { fontSize: 14, color: "#888", marginBottom: 24 },
  card: {
    backgroundColor: "#F5F7F2",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowText: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 15, fontWeight: "600", color: "#333" },
  rowHint: { fontSize: 12, color: "#888", marginTop: 3 },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 10,
    gap: 8,
    alignSelf: "flex-start",
  },
  timeText: { fontSize: 14, fontWeight: "600", color: "#333" },
});
