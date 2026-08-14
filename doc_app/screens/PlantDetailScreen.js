import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "../context/LanguageContext";

const PLANT_DATA = {
  Wheat: {
    color: "#A09E6D",
    diseases: [
      "Brown Rust (Leaf Rust)",
      "Yellow Rust (Stripe Rust)",
      "Healthy",
    ],
    care: "Wheat grows best in cool, dry weather. Water regularly but avoid waterlogging. Watch for orange, brown, or yellow pustules on leaves, which often signal rust diseases.",
    tip: "Inspect leaves weekly from the tillering stage for early signs of rust stripes or spots.",
  },
  Maize: {
    color: "#738C6D",
    diseases: [
      "Blight (Northern Leaf Blight)",
      "Common Rust",
      "Gray Leaf Spot",
      "Healthy",
    ],
    care: "Maize needs warm weather and full sunlight. Ensure good spacing between plants for airflow, which helps prevent fungal diseases.",
    tip: "Remove and destroy infected leaves early to stop disease from spreading.",
  },
};

const PLANT_DATA_NE = {
  Wheat: {
    diseases: ["खैरो खैरो रोग", "पहेंलो खैरो रोग", "स्वस्थ"],
    care: "गहुँ चिसो, सुख्खा मौसममा राम्रो हुन्छ। नियमित पानी दिनुहोस् तर जल जमाव नहुन दिनुहोस्। पातमा सुन्तला, खैरो, वा पहेंलो दानाहरू हेर्नुहोस्, जसले प्रायः रस्ट रोग संकेत गर्छ।",
    tip: "टिलरिङ चरणदेखि हरेक हप्ता रस्टका सुरुका संकेतका लागि पात जाँच गर्नुहोस्।",
  },
  Maize: {
    diseases: ["ब्लाइट", "सामान्य खैरो रोग", "ग्रे लिफ स्पट", "स्वस्थ"],
    care: "मकैलाई न्यानो मौसम र पूर्ण घाम चाहिन्छ। बिरुवाहरू बीच राम्रो दूरी राख्नुहोस् ताकि हावा चल्न सकोस्, जसले फंगल रोगबाट बचाउँछ।",
    tip: "रोग फैलिनबाट रोक्न संक्रमित पातहरू चाँडै हटाई नष्ट गर्नुहोस्।",
  },
};

export default function PlantDetailScreen({ route }) {
  const { plant } = route.params;
  const { t, language } = useLanguage();
  const isNepali = language === "ne";

  const data = PLANT_DATA[plant];
  const dataNe = PLANT_DATA_NE[plant];

  const diseases = isNepali ? dataNe.diseases : data.diseases;
  const care = isNepali ? dataNe.care : data.care;
  const tipText = isNepali ? dataNe.tip : data.tip;
  const plantLabel = isNepali ? t(plant.toLowerCase()) : plant;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <View style={[styles.banner, { backgroundColor: data.color }]}>
          <Ionicons name="leaf" size={28} color="#FFF" />
          <Text style={styles.plantName}>{plantLabel}</Text>
        </View>

        <Text style={styles.sectionLabel}>{t("diseasesDetected")}</Text>
        <View style={styles.card}>
          {diseases.map((d, i) => {
            const isHealthy = d === "Healthy" || d === "स्वस्थ";
            return (
              <View key={i} style={styles.diseaseRow}>
                <Ionicons
                  name={
                    isHealthy
                      ? "checkmark-circle-outline"
                      : "alert-circle-outline"
                  }
                  size={18}
                  color={isHealthy ? "#2E7D32" : "#D32F2F"}
                />
                <Text style={styles.diseaseText}>{d}</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>{t("careGuide")}</Text>
        <View style={styles.card}>
          <Text style={styles.bodyText}>{care}</Text>
        </View>

        <Text style={styles.sectionLabel}>{t("tip")}</Text>
        <View style={[styles.card, styles.tipCard]}>
          <View style={styles.tipRow}>
            <Ionicons name="bulb-outline" size={20} color="#608151" />
            <Text style={styles.tipText}>{tipText}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7F2" },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    gap: 12,
  },
  plantName: { fontSize: 24, fontWeight: "bold", color: "#FFF" },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 18,
    elevation: 2,
  },
  diseaseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  diseaseText: { fontSize: 15, color: "#333" },
  bodyText: { fontSize: 15, color: "#444", lineHeight: 23 },
  tipCard: { backgroundColor: "#EBEFE2" },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  tipText: { fontSize: 14, color: "#2E4620", lineHeight: 21, flex: 1 },
});
