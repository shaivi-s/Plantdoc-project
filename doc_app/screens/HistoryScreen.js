import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLanguage } from "../context/LanguageContext";
import { useUser } from "../context/UserContext";
import { getScans } from "../services/api";

const diseaseKeyMap = {
  "Maize Blight": "diseaseMaizeBlight",
  "Maize Common Rust": "diseaseMaizeCommonRust",
  "Maize Gray Leaf Spot": "diseaseMaizeGrayLeafSpot",
  "Maize Healthy": "diseaseMaizeHealthy",
  "Wheat Brown Rust": "diseaseWheatBrownRust",
  "Wheat Yellow Rust": "diseaseWheatYellowRust",
  "Wheat Healthy": "diseaseWheatHealthy",
};

export default function HistoryScreen() {
  const { token } = useUser();
  const { t } = useLanguage();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const displayDiseaseName = (name) => {
    const key = diseaseKeyMap[name];
    return key ? t(key) : name;
  };

  const loadScans = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await getScans(token);
      setScans(data);
    } catch (e) {
      setScans([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadScans();
    }, [loadScans]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadScans();
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>{t("scanHistory")}</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#608151" />
        </View>
      ) : scans.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="leaf-outline" size={48} color="#CCC" />
          <Text style={styles.emptyText}>{t("noScansHeading")}</Text>
          <Text style={styles.emptyHint}>{t("noScansHint")}</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {scans.map((scan) => (
            <View key={scan.id} style={styles.item}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: scan.is_healthy ? "#D1E6CE" : "#FBE0E0" },
                ]}
              >
                <Ionicons
                  name={scan.is_healthy ? "checkmark-circle" : "warning"}
                  size={24}
                  color={scan.is_healthy ? "#2E8B57" : "#D32F2F"}
                />
              </View>
              <View style={styles.details}>
                <Text style={styles.title}>
                  {displayDiseaseName(scan.predicted_class)}
                </Text>
                <Text style={styles.date}>
                  {formatDate(scan.created_at)} · {scan.confidence.toFixed(1)}%
                </Text>
              </View>
              <View
                style={[
                  styles.tag,
                  { backgroundColor: scan.is_healthy ? "#D1E6CE" : "#FBE0E0" },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: scan.is_healthy ? "#2E8B57" : "#D32F2F" },
                  ]}
                >
                  {scan.is_healthy ? t("healthy") : t("diseased")}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#F5F7F2",
  },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#333" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: { fontSize: 16, color: "#888", fontWeight: "600", marginTop: 12 },
  emptyHint: { fontSize: 13, color: "#AAA", textAlign: "center", marginTop: 6 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  details: { flex: 1 },
  title: { fontSize: 15, fontWeight: "600", color: "#333" },
  date: { fontSize: 12, color: "#666", marginTop: 4 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  tagText: { fontSize: 11, fontWeight: "bold" },
});
