import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { getMealsSaved, getDonations } from "../store";
import { colors, typography } from "../theme";

export default function HomeScreen({ navigation, route }) {
  const username = route?.params?.username || "Friend";
  const [mealsSaved, setMealsSaved] = useState(0);
  const [totalDonations, setTotalDonations] = useState(0);
  const [activeRequests, setActiveRequests] = useState(0);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const meals = await getMealsSaved();
        setMealsSaved(meals);
        const donations = await getDonations();
        setTotalDonations(donations.length);
        setActiveRequests(donations.filter((d) => d.status === "Available").length);
      }
      load();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {username}</Text>
          <Text style={styles.headerSub}>Make a difference today</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => navigation.replace("Login")}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.mealsBanner}>
          <Text style={styles.mealsLabel}>TOTAL MEALS SAVED</Text>
          <Text style={styles.mealsCount}>{mealsSaved}</Text>
          <Text style={styles.mealsSubLabel}>meals delivered to those in need</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalDonations}</Text>
            <Text style={styles.statLabel}>Total Donations</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeRequests}</Text>
            <Text style={styles.statLabel}>Active Requests</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>What would you like to do?</Text>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("DonateFood")}
          activeOpacity={0.88}
        >
          <View style={styles.actionIcon}>
            <Text style={styles.actionIconText}>+</Text>
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Donate Food</Text>
            <Text style={styles.actionSubtitle}>Share surplus food with those in need</Text>
          </View>
          <Text style={styles.actionArrow}>{">"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.accent }]}
          onPress={() => navigation.navigate("ViewRequests")}
          activeOpacity={0.88}
        >
          <View style={[styles.actionIcon, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
            <Text style={styles.actionIconText}>*</Text>
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>View Requests</Text>
            <Text style={styles.actionSubtitle}>See and accept food donation requests</Text>
          </View>
          <Text style={styles.actionArrow}>{">"}</Text>
        </TouchableOpacity>

        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            Every donation counts. Together we can achieve zero hunger.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 20,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  greeting: { ...typography.h2, color: colors.textLight },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 2 },
  logoutBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
  },
  logoutText: { color: colors.textLight, fontSize: 13, fontWeight: "600" },
  scroll: { padding: 16, paddingBottom: 40 },
  mealsBanner: {
    backgroundColor: colors.primaryDark,
    borderRadius: 16, padding: 20, alignItems: "center", marginBottom: 16,
  },
  mealsLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  mealsCount: { fontSize: 52, fontWeight: "800", color: colors.textLight, lineHeight: 64 },
  mealsSubLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 14,
    padding: 16, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  statValue: { fontSize: 28, fontWeight: "800", color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4, textAlign: "center" },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: 12 },
  actionBtn: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 16, padding: 18, marginBottom: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  actionIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center", marginRight: 14,
  },
  actionIconText: { fontSize: 22, color: colors.textLight, fontWeight: "700" },
  actionText: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: "700", color: colors.textLight },
  actionSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  actionArrow: { fontSize: 20, color: "rgba(255,255,255,0.7)", fontWeight: "700" },
  infoBanner: {
    backgroundColor: colors.active, borderRadius: 12, padding: 14,
    borderLeftWidth: 4, borderLeftColor: colors.primaryLight, marginTop: 4,
  },
  infoText: { fontSize: 13, color: colors.primaryDark, lineHeight: 19 },
});
