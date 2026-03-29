import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { getDonations, updateDonation, addMealsSaved } from "../store";
import { colors, typography } from "../theme";

const STATUS_FLOW = ["Available", "Accepted", "Picked", "Delivered"];

function getTimeLeft(expiresAt) {
  const diff = expiresAt - Date.now();
  if (diff <= 0) return null;
  const totalSecs = Math.floor(diff / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}m ${secs}s`;
}

function getStatusColor(status) {
  switch (status) {
    case "Available": return colors.success;
    case "Accepted": return colors.warning;
    case "Picked": return colors.accent;
    case "Delivered": return colors.primary;
    case "Expired": return colors.error;
    default: return colors.textSecondary;
  }
}

function getCardBg(status) {
  switch (status) {
    case "Expired": return colors.expired;
    case "Delivered": return colors.active;
    case "Accepted":
    case "Picked": return colors.pending;
    default: return colors.surface;
  }
}

function DonationCard({ item, onStatusUpdate, tick }) {
  const timeLeft = item.status !== "Expired" && item.status !== "Delivered"
    ? getTimeLeft(item.expiresAt)
    : null;

  const isExpired = item.status !== "Delivered" && item.status !== "Expired" && !timeLeft;
  const currentStatusIndex = STATUS_FLOW.indexOf(item.status);
  const nextStatus = STATUS_FLOW[currentStatusIndex + 1];
  const canAct = item.status !== "Delivered" && item.status !== "Expired" && !isExpired;

  return (
    <View style={[styles.card, { backgroundColor: getCardBg(isExpired ? "Expired" : item.status) }]}>
      {/* Status Badge */}
      <View style={styles.cardHeader}>
        <Text style={styles.foodType}>{item.foodType}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(isExpired ? "Expired" : item.status) + "22" }]}>
          <Text style={[styles.statusText, { color: getStatusColor(isExpired ? "Expired" : item.status) }]}>
            {isExpired ? "Expired" : item.status}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Qty</Text>
          <Text style={styles.detailValue}>{item.quantity}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Location</Text>
          <Text style={styles.detailValue} numberOfLines={1}>{item.location}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Expiry</Text>
          <Text style={styles.detailValue}>{item.expiryMinutes}m</Text>
        </View>
      </View>

      {/* Countdown Timer */}
      {canAct && (
        <View style={[styles.timerRow, timeLeft && parseInt(timeLeft) < 5 && styles.timerUrgent]}>
          <Text style={styles.timerLabel}>Time Remaining: </Text>
          <Text style={[styles.timerValue, !timeLeft && { color: colors.error }]}>
            {timeLeft || "Expiring..."}
          </Text>
        </View>
      )}

      {isExpired && (
        <View style={styles.expiredBanner}>
          <Text style={styles.expiredText}>This donation has expired</Text>
        </View>
      )}

      {item.status === "Delivered" && (
        <View style={styles.deliveredBanner}>
          <Text style={styles.deliveredText}>Delivered successfully</Text>
        </View>
      )}

      {/* Action Button */}
      {canAct && nextStatus && (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: getStatusColor(nextStatus) }]}
          onPress={() => onStatusUpdate(item, nextStatus)}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnText}>
            {item.status === "Available" ? "Accept Request" :
             item.status === "Accepted" ? "Mark as Picked" :
             "Mark as Delivered"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function ViewRequestsScreen({ navigation }) {
  const [donations, setDonations] = useState([]);
  const [tick, setTick] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadDonations();
    }, [])
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      checkExpired();
    }, 1000);
    return () => clearInterval(interval);
  }, [donations]);

  async function loadDonations() {
    const data = await getDonations();
    setDonations(data);
  }

  async function checkExpired() {
    const data = await getDonations();
    let changed = false;
    for (const d of data) {
      if (d.status === "Available" && d.expiresAt <= Date.now()) {
        await updateDonation(d.id, { status: "Expired" });
        changed = true;
        Alert.alert("Food Expired", `"${d.foodType}" at ${d.location} has expired.`);
      }
    }
    if (changed) loadDonations();
  }

  async function handleStatusUpdate(item, nextStatus) {
    const actionLabel =
      nextStatus === "Accepted" ? "Accept this request?" :
      nextStatus === "Picked" ? "Mark as picked up?" :
      "Mark as delivered?";

    Alert.alert("Confirm", actionLabel, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          await updateDonation(item.id, { status: nextStatus });
          if (nextStatus === "Delivered") {
            const qty = parseInt(item.quantity) || 1;
            await addMealsSaved(qty);
            Alert.alert("Delivered!", `${qty} meal(s) saved. Thank you!`);
          } else {
            Alert.alert("Updated!", `Status changed to ${nextStatus}.`);
          }
          loadDonations();
        },
      },
    ]);
  }

  const active = donations.filter((d) => d.status !== "Delivered" && d.status !== "Expired");
  const done = donations.filter((d) => d.status === "Delivered" || d.status === "Expired");

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{"< Back"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Food Requests</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{active.length}</Text>
        </View>
      </View>

      <FlatList
        data={[...active, ...done]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DonationCard item={item} onStatusUpdate={handleStatusUpdate} tick={tick} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No donations yet.</Text>
            <Text style={styles.emptySubText}>Go back and donate food to get started!</Text>
          </View>
        }
        ListHeaderComponent={
          donations.length > 0 ? (
            <Text style={styles.listHeader}>{active.length} active request(s)</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.accent,
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: { paddingVertical: 4 },
  backText: { color: colors.textLight, fontSize: 14, fontWeight: "600" },
  headerTitle: { ...typography.h3, color: colors.textLight },
  countBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center", alignItems: "center",
  },
  countText: { color: colors.textLight, fontWeight: "700", fontSize: 14 },
  list: { padding: 16, paddingBottom: 40 },
  listHeader: { ...typography.caption, color: colors.textSecondary, marginBottom: 12 },
  card: {
    borderRadius: 16, padding: 16, marginBottom: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  foodType: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "700" },
  detailsRow: { flexDirection: "row", marginBottom: 10 },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 10, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 },
  detailValue: { fontSize: 13, fontWeight: "600", color: colors.textPrimary, marginTop: 2 },
  timerRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 8, padding: 8, marginBottom: 10,
  },
  timerUrgent: { backgroundColor: "#FFEBEE" },
  timerLabel: { fontSize: 12, color: colors.textSecondary },
  timerValue: { fontSize: 13, fontWeight: "700", color: colors.success },
  expiredBanner: {
    backgroundColor: colors.error + "22", borderRadius: 8,
    padding: 8, marginBottom: 8, alignItems: "center",
  },
  expiredText: { color: colors.error, fontWeight: "700", fontSize: 13 },
  deliveredBanner: {
    backgroundColor: colors.success + "22", borderRadius: 8,
    padding: 8, marginBottom: 8, alignItems: "center",
  },
  deliveredText: { color: colors.success, fontWeight: "700", fontSize: 13 },
  actionBtn: {
    borderRadius: 10, paddingVertical: 11,
    alignItems: "center", marginTop: 4,
  },
  actionBtnText: { color: colors.textLight, fontWeight: "700", fontSize: 14 },
  emptyBox: { alignItems: "center", paddingTop: 60 },
  emptyText: { fontSize: 18, fontWeight: "700", color: colors.textSecondary },
  emptySubText: { fontSize: 13, color: colors.textSecondary, marginTop: 8, textAlign: "center" },
});
