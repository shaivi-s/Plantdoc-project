import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "../context/LanguageContext";
import { useUser } from "../context/UserContext";
import { detectDisease, saveScan } from "../services/api";

export default function ResultsScreen({ route, navigation }) {
  const { imageUri } = route.params;
  const { token } = useUser();
  const { t, language } = useLanguage();
  const [analyzing, setAnalyzing] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    detectDisease(imageUri)
      .then((data) => {
        setResult(data);
        setAnalyzing(false);

        if (data.is_valid_leaf) {
          const isHealthy = data.disease?.includes("Healthy");
          if (token) {
            saveScan(data.disease, data.confidence, isHealthy, token).catch(
              () => {},
            );
          }
        }
      })
      .catch((err) => {
        setError(err.message || "Could not analyze the image.");
        setAnalyzing(false);
      });
  }, []);

  const isHealthy = result?.disease?.includes("Healthy");
  const isInvalidLeaf = result && result.is_valid_leaf === false;
  const isNepali = language === "ne";

  const pick = (enField, neField) => {
    if (isNepali && neField) return neField;
    return enField;
  };

  const displayDisease = result ? pick(result.disease, result.disease_ne) : "";
  const displayDescription = result
    ? pick(result.description, result.description_ne)
    : "";
  const displaySymptoms = result
    ? pick(result.symptoms, result.symptoms_ne)
    : "";
  const displayPrevention = result
    ? pick(result.prevention, result.prevention_ne)
    : "";
  const displayRejectMessage = result
    ? pick(result.message, result.message_ne)
    : "";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("analysisResults")}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <Image source={{ uri: imageUri }} style={styles.image} />

        {analyzing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#608151" />
            <Text style={styles.loadingText}>
              PlantDoc AI is analyzing your leaf...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.resultCard}>
            <Ionicons name="cloud-offline-outline" size={40} color="#D32F2F" />
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHint}>
              Make sure the server is running and try again.
            </Text>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.doneButtonText}>{t("doneButton")}</Text>
            </TouchableOpacity>
          </View>
        ) : isInvalidLeaf ? (
          <View style={styles.resultCard}>
            <View style={styles.invalidIconCircle}>
              <Ionicons name="leaf-outline" size={36} color="#E8A33D" />
            </View>
            <Text style={styles.invalidTitle}>{t("notValidLeafTitle")}</Text>
            <Text style={styles.invalidMessage}>{displayRejectMessage}</Text>
            <TouchableOpacity
              style={styles.medicineButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="camera-outline" size={20} color="#FFF" />
              <Text style={styles.medicineButtonText}>{t("doneButton")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultCard}>
            <View style={styles.diseaseHeader}>
              <Ionicons
                name={isHealthy ? "checkmark-circle" : "warning"}
                size={24}
                color={isHealthy ? "#2E7D32" : "#D32F2F"}
              />
              <Text
                style={[
                  styles.diseaseName,
                  { color: isHealthy ? "#2E7D32" : "#D32F2F" },
                ]}
              >
                {displayDisease}
              </Text>
            </View>
            <Text style={styles.confidence}>
              {result.confidence}% {t("confidenceLabel")}
            </Text>

            {displayDescription ? (
              <Text style={styles.description}>{displayDescription}</Text>
            ) : null}

            {displaySymptoms ? (
              <>
                <Text style={styles.sectionTitle}>{t("symptomsLabel")}</Text>
                <Text style={styles.bodyText}>{displaySymptoms}</Text>
              </>
            ) : null}

            {displayPrevention ? (
              <>
                <Text style={styles.sectionTitle}>{t("preventionLabel")}</Text>
                <Text style={styles.bodyText}>{displayPrevention}</Text>
              </>
            ) : null}

            {!isHealthy && result.medicines && result.medicines.length > 0 ? (
              <TouchableOpacity
                style={styles.medicineButton}
                onPress={() => navigation.navigate("Medicine", { result })}
              >
                <Ionicons name="medkit-outline" size={20} color="#FFF" />
                <Text style={styles.medicineButtonText}>
                  {t("viewMedicineDetails")}
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.doneButtonText}>{t("doneButton")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7F2" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  image: {
    width: "90%",
    height: 300,
    alignSelf: "center",
    borderRadius: 20,
    marginTop: 10,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  resultCard: {
    backgroundColor: "#FFF",
    margin: 20,
    padding: 25,
    borderRadius: 24,
    elevation: 4,
  },
  diseaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  diseaseName: { fontSize: 22, fontWeight: "bold", marginLeft: 10, flex: 1 },
  confidence: { fontSize: 14, color: "#666", marginBottom: 16, marginLeft: 34 },
  description: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 16,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
    marginBottom: 6,
  },
  bodyText: { fontSize: 15, color: "#555", lineHeight: 22 },
  errorText: {
    fontSize: 16,
    color: "#D32F2F",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
  },
  errorHint: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 10,
  },
  invalidIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FDF3E3",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  invalidTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  invalidMessage: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  medicineButton: {
    flexDirection: "row",
    backgroundColor: "#608151",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 8,
  },
  medicineButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  doneButton: {
    backgroundColor: "#EBEFE2",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12,
  },
  doneButtonText: { color: "#608151", fontSize: 16, fontWeight: "bold" },
});
