import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { saveDonation } from "../store";
import { colors, typography } from "../theme";

export default function DonateFoodScreen({ navigation }) {
  const [foodType, setFoodType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [expiryMinutes, setExpiryMinutes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!foodType.trim() || !quantity.trim() || !location.trim() || !expiryMinutes.trim()) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }
    const mins = parseInt(expiryMinutes);
    if (isNaN(mins) || mins <= 0) {
      Alert.alert("Invalid Expiry", "Please enter a valid number of minutes.");
      return;
    }

    setSubmitting(true);
    const donation = {
      id: Date.now().toString(),
      foodType: foodType.trim(),
      quantity: quantity.trim(),
      location: location.trim(),
      expiryMinutes: mins,
      expiresAt: Date.now() + mins * 60 * 1000,
      status: "Available",
      createdAt: Date.now(),
    };

    await saveDonation(donation);
    setSubmitting(false);

    Alert.alert(
      "Donation Submitted!",
      "Your food donation has been listed. Thank you for your generosity!",
      [{ text: "Back to Home", onPress: () => navigation.navigate("Home") }]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{"< Back"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Donate Food</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.infoBanner}>
            <Text style={styles.infoText}>Fill in the details below to list your food donation.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>FOOD TYPE *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Rice, Bread, Cooked Meals"
              placeholderTextColor={colors.textSecondary}
              value={foodType}
              onChangeText={setFoodType}
            />

            <Text style={styles.label}>QUANTITY *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5 kg, 10 servings"
              placeholderTextColor={colors.textSecondary}
              value={quantity}
              onChangeText={setQuantity}
            />

            <Text style={styles.label}>PICKUP LOCATION *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full address"
              placeholderTextColor={colors.textSecondary}
              value={location}
              onChangeText={setLocation}
            />

            <Text style={styles.label}>EXPIRY TIME (MINUTES) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 60 for 1 hour"
              placeholderTextColor={colors.textSecondary}
              value={expiryMinutes}
              onChangeText={setExpiryMinutes}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.submitBtnText}>
                {submitting ? "Submitting..." : "Submit Donation"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: { paddingVertical: 4 },
  backText: { color: colors.textLight, fontSize: 14, fontWeight: "600" },
  headerTitle: { ...typography.h3, color: colors.textLight },
  scroll: { padding: 16, paddingBottom: 40 },
  infoBanner: {
    backgroundColor: colors.active, borderRadius: 12, padding: 14,
    borderLeftWidth: 4, borderLeftColor: colors.primaryLight, marginBottom: 16,
  },
  infoText: { fontSize: 13, color: colors.primaryDark },
  card: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  label: { fontSize: 11, fontWeight: "700", color: colors.textSecondary, letterSpacing: 1, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    color: colors.textPrimary, backgroundColor: colors.background, marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: colors.primary, borderRadius: 12,
    paddingVertical: 15, alignItems: "center", marginTop: 4,
  },
  submitBtnText: { color: colors.textLight, fontSize: 16, fontWeight: "700" },
});
