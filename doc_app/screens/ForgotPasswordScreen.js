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
import { requestReset, verifyReset } from "../services/api";

export default function ForgotPasswordScreen({ navigation }) {
  const [stage, setStage] = useState(1); // 1 = enter email, 2 = enter code + password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert("Missing Info", "Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      await requestReset(email.trim());
      Alert.alert("Code Sent", "Check your email for the 6-digit code.");
      setStage(2);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code || !newPassword || !confirmPassword) {
      Alert.alert("Missing Info", "Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Password Mismatch", "The passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await verifyReset(email.trim(), code.trim(), newPassword);
      Alert.alert("Success", "Your password has been updated. Please log in.", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (error) {
      Alert.alert("Reset Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.back}
        >
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>

        <View style={styles.logoRow}>
          <Ionicons name="leaf" size={36} color="#608151" />
          <Text style={styles.logoText}>PlantDoc</Text>
        </View>

        <Text style={styles.title}>Reset Password</Text>

        {stage === 1 ? (
          <>
            <Text style={styles.subtitle}>
              Enter your email and we'll send you a code.
            </Text>

            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#999"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Your registered email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Send Code</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Enter the code sent to {email} and your new password.
            </Text>

            <Text style={styles.label}>Reset Code</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="key-outline"
                size={20}
                color="#999"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="6-digit code"
                placeholderTextColor="#999"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#999"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor="#999"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.hint}>
              Must be 8+ characters with a letter, number, and symbol.
            </Text>

            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#999"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Re-enter new password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleVerify}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Update Password</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSendCode} style={styles.resend}>
              <Text style={styles.resendText}>Resend code</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.footerWrapper}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.footerText}>
            Remember your password? <Text style={styles.link}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { padding: 24, paddingTop: 60, flexGrow: 1 },
  back: { marginBottom: 10 },
  logoRow: { flexDirection: "row", alignItems: "center", marginBottom: 30 },
  logoText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2E4620",
    marginLeft: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E4620",
    marginBottom: 6,
  },
  subtitle: { fontSize: 15, color: "#888", marginBottom: 30 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F4F1",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 15, color: "#333" },
  hint: {
    fontSize: 12,
    color: "#999",
    marginTop: -10,
    marginBottom: 16,
    marginLeft: 4,
  },
  button: {
    backgroundColor: "#608151",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  resend: { alignItems: "center", marginTop: 16 },
  resendText: { color: "#608151", fontWeight: "600", fontSize: 14 },
  footerWrapper: { marginTop: 24, alignItems: "center" },
  footerText: { color: "#666", fontSize: 14 },
  link: { color: "#608151", fontWeight: "bold" },
});
