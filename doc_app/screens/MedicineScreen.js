import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "../context/LanguageContext";

export default function MedicineScreen({ route }) {
  const { result } = route.params;
  const medicines = result.medicines || [];
  const { t, language } = useLanguage();
  const isNepali = language === "ne";

  const pick = (en, ne) => (isNepali && ne ? ne : en);

  const displayDisease = pick(result.disease, result.disease_ne);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <View style={styles.diseaseBanner}>
          <Ionicons name="leaf" size={22} color="#608151" />
          <Text style={styles.diseaseText}>{displayDisease}</Text>
        </View>

        {medicines.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardText}>{t("noMedicineInfo")}</Text>
          </View>
        ) : (
          medicines.map((med, index) => {
            const medName = pick(med.name, med.name_ne);
            const medDosage = pick(med.dosage, med.dosage_ne);
            const medApplication = pick(med.application, med.application_ne);
            const medFrequency = pick(med.frequency, med.frequency_ne);
            const medPrecautions = pick(med.precautions, med.precautions_ne);

            return (
              <View key={index} style={styles.medicineBlock}>
                <Text style={styles.sectionLabel}>
                  {medicines.length > 1
                    ? `${t("option")} ${index + 1}`
                    : t("recommendedMedicine")}
                </Text>

                <View style={styles.card}>
                  <View style={styles.row}>
                    <Ionicons name="medkit" size={22} color="#608151" />
                    <Text style={styles.medicineName}>{medName}</Text>
                  </View>
                </View>

                {medDosage && medDosage !== "-" ? (
                  <>
                    <Text style={styles.subLabel}>{t("dosage")}</Text>
                    <View style={styles.card}>
                      <Text style={styles.cardText}>{medDosage}</Text>
                    </View>
                  </>
                ) : null}

                {(medApplication && medApplication !== "-") ||
                (medFrequency && medFrequency !== "-") ? (
                  <>
                    <Text style={styles.subLabel}>{t("howToApply")}</Text>
                    <View style={styles.card}>
                      {medApplication && medApplication !== "-" ? (
                        <View style={styles.infoRow}>
                          <Ionicons
                            name="water-outline"
                            size={18}
                            color="#608151"
                          />
                          <Text style={styles.cardText}>{medApplication}</Text>
                        </View>
                      ) : null}
                      {medFrequency && medFrequency !== "-" ? (
                        <View style={styles.infoRow}>
                          <Ionicons
                            name="time-outline"
                            size={18}
                            color="#608151"
                          />
                          <Text style={styles.cardText}>{medFrequency}</Text>
                        </View>
                      ) : null}
                    </View>
                  </>
                ) : null}

                {medPrecautions ? (
                  <>
                    <Text style={styles.subLabel}>{t("precautions")}</Text>
                    <View style={[styles.card, styles.warningCard]}>
                      <View style={styles.infoRow}>
                        <Ionicons
                          name="warning-outline"
                          size={20}
                          color="#D32F2F"
                        />
                        <Text style={styles.warningText}>{medPrecautions}</Text>
                      </View>
                    </View>
                  </>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7F2" },
  diseaseBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBEFE2",
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    gap: 10,
  },
  diseaseText: { fontSize: 18, fontWeight: "bold", color: "#2E4620" },
  medicineBlock: { marginBottom: 8 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#608151",
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
  },
  subLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    marginBottom: 6,
    marginLeft: 4,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 2,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  medicineName: { fontSize: 17, fontWeight: "600", color: "#333" },
  cardText: { fontSize: 15, color: "#444", lineHeight: 22, flex: 1 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  warningCard: { backgroundColor: "#FDEDED" },
  warningText: { fontSize: 14, color: "#8B2020", lineHeight: 21, flex: 1 },
});
