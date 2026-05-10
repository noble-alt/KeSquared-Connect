import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Alert,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RideRequestBanner } from "@/components/RideRequestBanner";
import { useAuth } from "@/contexts/AuthContext";
import { useRide } from "@/contexts/RideContext";
import { useColors } from "@/hooks/useColors";

const { height } = Dimensions.get("window");

export default function DriverHomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    driverAvailable,
    setDriverAvailable,
    pendingRequest,
    currentRide,
    acceptRequest,
    rejectRequest,
    completeRide,
  } = useRide();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 64;

  const handleToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDriverAvailable(value);
  };

  const handleCompleteRide = () => {
    Alert.alert("Complete Trip?", "Confirm that you have completed this trip and collected the fare.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Complete",
        onPress: () => {
          completeRide(user?.id ?? "");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const initials = user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "D";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={driverAvailable ? ["#003D1F", "#00A651"] : ["#1A1A2E", "#2D2D4E"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerTop}>
          <View style={styles.driverBadge}>
            <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
              <Text style={[styles.avatarText, { color: colors.accentForeground }]}>{initials}</Text>
            </View>
            <View>
              <Text style={styles.headerName}>{user?.name?.split(" ")[0] ?? "Driver"}</Text>
              <View style={styles.plateRow}>
                <Feather name="tag" size={11} color="#ffffffaa" />
                <Text style={styles.plateText}>{user?.plateNumber ?? "—"}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.ratingBadge, { backgroundColor: "#ffffff22" }]}>
            <Ionicons name="star" size={13} color={colors.accent} />
            <Text style={styles.ratingText}>{user?.rating?.toFixed(1) ?? "5.0"}</Text>
          </View>
        </View>

        {/* Online toggle */}
        <View style={[styles.toggleCard, { backgroundColor: driverAvailable ? "#ffffff18" : "#ffffff0E" }]}>
          <View style={styles.toggleLeft}>
            <View style={[styles.statusDot, { backgroundColor: driverAvailable ? "#4ADE80" : "#6B7280" }]} />
            <View>
              <Text style={styles.toggleTitle}>{driverAvailable ? "You're Online" : "You're Offline"}</Text>
              <Text style={styles.toggleSub} numberOfLines={2}>
                {driverAvailable
                  ? "Accepting ride requests from students"
                  : "Go online to start receiving ride requests"}
              </Text>
            </View>
          </View>
          <Switch
            value={driverAvailable}
            onValueChange={handleToggle}
            trackColor={{ false: "#ffffff33", true: colors.accent }}
            thumbColor="#fff"
          />
        </View>
      </LinearGradient>

      {/* Body */}
      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {currentRide ? (
          /* Active trip card */
          <View style={[styles.activeRideCard, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
            <LinearGradient
              colors={[colors.primary + "22", colors.primary + "06"]}
              style={[styles.activeRideHeader, { borderRadius: colors.radius - 2 }]}
            >
              <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.activeRideTitle, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                Active Trip
              </Text>
            </LinearGradient>

            <View style={styles.studentRow}>
              <View style={[styles.studentAvatar, { backgroundColor: colors.secondary }]}>
                <Ionicons name="person" size={20} color={colors.primary} />
              </View>
              <View style={styles.studentInfo}>
                <Text style={[styles.studentName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {currentRide.studentName ?? "Student"}
                </Text>
                <Text style={[styles.studentPhone, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {currentRide.studentPhone}
                </Text>
              </View>
              <View style={[styles.fareBadge, { backgroundColor: colors.accent }]}>
                <Text style={[styles.fareLabel, { color: colors.accentForeground, fontFamily: "Inter_700Bold" }]}>
                  ₦{currentRide.fare - (currentRide.rideType === "normal" ? 20 : 50)}
                </Text>
              </View>
            </View>

            <View style={[styles.routeSection, { backgroundColor: colors.muted, borderRadius: colors.radius - 4 }]}>
              <View style={styles.routeRow}>
                <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.routeText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
                  {currentRide.pickup.name}
                </Text>
              </View>
              <View style={[styles.routeConnector, { backgroundColor: colors.border }]} />
              <View style={styles.routeRow}>
                <View style={[styles.routeDot, { backgroundColor: colors.destructive }]} />
                <Text style={[styles.routeText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
                  {currentRide.destination.name}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleCompleteRide}
              style={({ pressed }) => [
                styles.completeBtn,
                { backgroundColor: colors.primary, borderRadius: colors.radius - 4, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Feather name="check-circle" size={18} color="#fff" />
              <Text style={[styles.completeBtnText, { fontFamily: "Inter_600SemiBold" }]}>Mark as Completed</Text>
            </Pressable>
          </View>
        ) : driverAvailable ? (
          /* Waiting state */
          <View style={[styles.waitingCard, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="rickshaw" size={44} color={colors.primary} />
            <Text style={[styles.waitingTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Waiting for requests
            </Text>
            <Text style={[styles.waitingDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              A notification will appear when a student nearby needs a ride. Stay close to campus!
            </Text>
          </View>
        ) : (
          /* Offline state */
          <View style={[styles.offlineCard, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
            <View style={[styles.offlineIcon, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
              <MaterialCommunityIcons name="rickshaw" size={42} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.offlineTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              You're offline
            </Text>
            <Text style={[styles.offlineDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Toggle the switch above to go online and start receiving ride requests from students on campus.
            </Text>
          </View>
        )}

        {/* How it works */}
        {!currentRide && (
          <View style={[styles.tipsCard, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
            <Text style={[styles.tipsTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              How ride requests work
            </Text>
            {[
              { icon: "wifi", text: "Go online when you're ready to drive" },
              { icon: "bell", text: "A banner drops down when a student books a ride" },
              { icon: "check-circle", text: "Accept, pick up the student, and collect cash on arrival" },
              { icon: "dollar-sign", text: "Normal ride: earn ₦180 · Drop ride: earn ₦450" },
            ].map((tip) => (
              <View key={tip.text} style={styles.tipRow}>
                <View style={[styles.tipIcon, { backgroundColor: colors.secondary }]}>
                  <Feather name={tip.icon as any} size={14} color={colors.primary} />
                </View>
                <Text style={[styles.tipText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {tip.text}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Ride request banner — slides down from top */}
      <RideRequestBanner
        request={pendingRequest}
        onAccept={acceptRequest}
        onReject={rejectRequest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  driverBadge: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  headerName: { fontSize: 17, color: "#fff", fontFamily: "Inter_600SemiBold" },
  plateRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1 },
  plateText: { fontSize: 12, color: "#ffffffaa", fontFamily: "Inter_400Regular" },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: { fontSize: 14, color: "#fff", fontFamily: "Inter_600SemiBold" },
  toggleCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  toggleLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  toggleTitle: { fontSize: 16, color: "#fff", fontFamily: "Inter_700Bold" },
  toggleSub: { fontSize: 12, color: "#ffffffaa", fontFamily: "Inter_400Regular", marginTop: 2 },
  body: { padding: 16, gap: 14 },
  activeRideCard: { borderWidth: 1, overflow: "hidden", gap: 14, padding: 14 },
  activeRideHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
  },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  activeRideTitle: { fontSize: 15 },
  studentRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  studentAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 16 },
  studentPhone: { fontSize: 13, marginTop: 2 },
  fareBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  fareLabel: { fontSize: 16 },
  routeSection: { padding: 12, gap: 0 },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  routeConnector: { width: 2, height: 14, marginLeft: 4, marginVertical: 2 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeText: { fontSize: 14, flex: 1 },
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
  },
  completeBtnText: { fontSize: 16, color: "#fff" },
  waitingCard: {
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    gap: 12,
  },
  waitingTitle: { fontSize: 17 },
  waitingDesc: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  offlineCard: {
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    gap: 14,
  },
  offlineIcon: { width: 80, height: 80, alignItems: "center", justifyContent: "center" },
  offlineTitle: { fontSize: 17 },
  offlineDesc: { fontSize: 14, textAlign: "center", lineHeight: 22, maxWidth: 280 },
  tipsCard: { borderWidth: 1, padding: 16, gap: 12 },
  tipsTitle: { fontSize: 15, marginBottom: 4 },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  tipIcon: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", marginTop: 1 },
  tipText: { flex: 1, fontSize: 13, lineHeight: 20 },
});
