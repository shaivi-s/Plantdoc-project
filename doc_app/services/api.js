// services/api.js
import * as ImageManipulator from "expo-image-manipulator";
import { Platform } from "react-native";

const API_URL = "http://172.16.200.58:8000";

// ---- helper: fetch with a timeout so a slow/stuck request fails cleanly ----
async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export async function registerUser(fullName, email, password, phone, location) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      full_name: fullName,
      email: email,
      password: password,
      phone: phone,
      location: location,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Registration failed");
  return data;
}

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Login failed");
  return data;
}

export async function detectDisease(imageUri) {
  const processed = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 800 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
  );

  const formData = new FormData();

  if (Platform.OS === "web") {
    // On web, convert the image URI into a real Blob (browsers require this)
    const imgResponse = await fetch(processed.uri);
    const blob = await imgResponse.blob();
    formData.append("file", blob, "leaf.jpg");
  } else {
    // On mobile, the { uri, name, type } object works
    formData.append("file", {
      uri: processed.uri,
      name: "leaf.jpg",
      type: "image/jpeg",
    });
  }

  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetchWithTimeout(
        `${API_URL}/api/predict`,
        {
          method: "POST",
          body: formData,
        },
        40000,
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Detection failed");
      return data;
    } catch (err) {
      lastErr = err;
      const isTransient =
        err.name === "AbortError" ||
        (err.message && err.message.toLowerCase().includes("network"));
      if (!isTransient || attempt === 3) break;
      await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }
  throw new Error(
    lastErr?.message ||
      "Could not reach the server. Please check your connection and try again.",
  );
}

export async function uploadProfilePhoto(base64Image, token) {
  const response = await fetch(`${API_URL}/api/auth/upload-photo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ image: base64Image }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Upload failed");
  return data;
}

export async function updateProfile(fields, token) {
  const response = await fetch(`${API_URL}/api/auth/update-profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(fields),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Update failed");
  return data;
}

export async function changePassword(currentPassword, newPassword, token) {
  const response = await fetch(`${API_URL}/api/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Password change failed");
  return data;
}

export async function deleteAccount(password, token) {
  const response = await fetch(`${API_URL}/api/auth/delete-account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password: password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Delete failed");
  return data;
}

export async function requestReset(email) {
  const response = await fetch(`${API_URL}/api/auth/request-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Could not send code");
  return data;
}

export async function verifyReset(email, code, newPassword) {
  const response = await fetch(`${API_URL}/api/auth/verify-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email,
      code: code,
      new_password: newPassword,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Reset failed");
  return data;
}

export async function saveScan(predictedClass, confidence, isHealthy, token) {
  const response = await fetch(`${API_URL}/api/scans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      predicted_class: predictedClass,
      confidence: confidence,
      is_healthy: isHealthy,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Could not save scan");
  return data;
}

export async function getScans(token) {
  const response = await fetch(`${API_URL}/api/scans`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Could not load scans");
  return data;
}
