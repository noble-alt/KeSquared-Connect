import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { type DriverEarnings, useRide } from "@/contexts/RideContext";
import { useColors } from "@/hooks/useColors";

export default function EarningsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getDriverEarnings } = useRide();
  const [earnings, setEarnings] = useState<DriverEarnings | null>(null);
  const [loading, setLoading] = useState(true);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      setLoading(true);
      getDriverEarnings(user.id).then((data) => {
        setEarnings(data);
        setLoading(false);
      });
    }, [user, getDriverEarnings])
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const commission = { normal: 20, drop: 50 };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#003D1F", "#00A651"]}
        style={[styles.headerGradient, { paddingTop: topPad + 16 }]}
      >
        <Text style={styles.headerTitle}>Earnings</Text>
        <View style={styles.todayCard}>
          <Text style={styles.todayLabel}>Today's Earnings</Text>
          <Text style={styles.todayAmount}>₦{(earnings?.today ?? 0).toLocaleString()}</Text>
          <Text style={styles.todayTrips}>{earnings?.tripsToday ?? 0} trip{(earnings?.tripsToday ?? 0) !== 1 ? "s" : ""} completed</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsGrid}>
          <StatCard label="This Week" value={`₦${(earnings?.week ?? 0).toLocaleString()}`} icon="calendar" colors={colors} />
          <StatCard label="All Time" value={`₦${(earnings?.total ?? 0).toLocaleString()}`} icon="trending-up" colors={colors} />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Commission Structure
          </Text>
          <Text style={[styles.sectionDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            A small platform fee is deducted from each ride to maintain the CampusDrop service.
          </Text>

          <View style={styles.commissionRows}>
            <View style={[styles.commissionRow, { backgroundColor: colors.secondary, borderRadius: colors.radius - 4 }]}>
              <View style={styles.commissionLeft}>
                <Ionicons name="people" size={18} color={colors.primary} />
                <View>
                  <Text style={[styles.commissionType, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Normal Ride</Text>
                  <Text style={[styles.commissionFare, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Student pays ₦200</Text>
                </View>
              </View>
              <View style={styles.commissionRight}>
                <Text style={[styles.commissionFee, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Fee: ₦{commission.normal}</Text>
                <Text style={[styles.commissionEarn, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>You earn: ₦{200 - commission.normal}</Text>
              </View>
            </View>

            <View style={[styles.commissionRow, { backgroundColor: colors.accent + "18", borderRadius: colors.radius - 4 }]}>
              <View style={styles.commissionLeft}>
                <Ionicons name="car" size={18} color={colors.accent} />
                <View>
                  <Text style={[styles.commissionType, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Drop Ride</Text>
                  <Text style={[styles.commissionFare, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Student pays ₦500</Text>
                </View>
              </View>
              <View style={styles.commissionRight}>
                <Text style={[styles.commissionFee, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Fee: ₦{commission.drop}</Text>
                <Text style={[styles.commissionEarn, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>You earn: ₦{500 - commission.drop}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Payment Info
          </Text>
          {[
            { icon: "dollar-sign", text: "All fares are collected in cash from students" },
            { icon: "shield", text: "Commission is deducted from your trip earnings" },
            { icon: "clock", text: "Future wallet & bank transfer coming soon" },
          ].map((item) => (
            <View key={item.text} style={styles.paymentRow}>
              <View style={[styles.payIcon, { backgroundColor: colors.secondary }]}>
                <Feather name={item.icon as any} size={14} color={colors.primary} />
              </View>
              <Text style={[styles.payText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {item.text}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ label, value, icon, colors }: { label: string; value: string; icon: string; colors: any }) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={icon as any} size={18} color={colors.primary} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerGradient: { paddingHorizontal: 20, paddingBottom: 28 },
  headerTitle: { fontSize: 24, color: "#fff", fontFamily: "Inter_700Bold", marginBottom: 16 },
  todayCard: { backgroundColor: "#ffffff18", borderRadius: 16, padding: 20, alignItems: "center", gap: 4 },
  todayLabel: { fontSize: 13, color: "#ffffffaa", fontFamily: "Inter_400Regular" },
  todayAmount: { fontSize: 40, color: "#fff", fontFamily: "Inter_700Bold" },
  todayTrips: { fontSize: 13, color: "#FFB700", fontFamily: "Inter_500Medium" },
  content: { padding: 16, gap: 14 },
  statsGrid: { flexDirection: "row", gap: 12 },
  statCard: { flex: 1, padding: 16, alignItems: "center", gap: 8, borderWidth: 1 },
  statIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 20 },
  statLabel: { fontSize: 12 },
  section: { padding: 16, gap: 14, borderWidth: 1 },
  sectionTitle: { fontSize: 16 },
  sectionDesc: { fontSize: 13, lineHeight: 20 },
  commissionRows: { gap: 10 },
  commissionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, gap: 12 },
  commissionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  commissionRight: { alignItems: "flex-end", gap: 2 },
  commissionType: { fontSize: 15 },
  commissionFare: { fontSize: 12, marginTop: 1 },
  commissionFee: { fontSize: 12 },
  commissionEarn: { fontSize: 15 },
  paymentRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  payIcon: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", marginTop: 1 },
  payText: { flex: 1, fontSize: 13, lineHeight: 19 },
});
