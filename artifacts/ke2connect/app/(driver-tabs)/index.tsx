import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useRide } from "@/contexts/RideContext";
import { useColors } from "@/hooks/useColors";

const { height } = Dimensions.get("window");

export default function DriverHomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { driverAvailable, setDriverAvailable, pendingRequest, currentRide, rideStatus, acceptRequest, rejectRequest, completeRide } = useRide();

  const requestSlideAnim = useRef(new Animated.Value(height)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  useEffect(() => {
    if (pendingRequest) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Animated.spring(requestSlideAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 10 }).start();
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      Animated.timing(requestSlideAnim, { toValue: height, duration: 250, useNativeDriver: true }).start();
      pulseAnim.setValue(1);
    }
  }, [pendingRequest]);

  const handleToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDriverAvailable(value);
  };

  const handleCompleteRide = () => {
    Alert.alert("Complete Trip?", "Confirm that you have completed this trip.", [
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

  const handleAccept = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    acceptRequest();
  };

  const handleReject = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    rejectRequest();
  };

  const initials = user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "D";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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

        <View style={[styles.toggleCard, { backgroundColor: driverAvailable ? "#ffffff18" : "#ffffff0E" }]}>
          <View>
            <Text style={styles.toggleTitle}>{driverAvailable ? "You're Online" : "You're Offline"}</Text>
            <Text style={styles.toggleSub}>
              {driverAvailable ? "Accepting ride requests from students" : "Go online to start receiving ride requests"}
            </Text>
          </View>
          <Switch
            value={driverAvailable}
            onValueChange={handleToggle}
            trackColor={{ false: "#ffffff33", true: colors.accent }}
            thumbColor="#fff"
          />
        </View>
      </LinearGradient>

      <View style={[styles.body, { paddingBottom: bottomPad }]}>
        {!currentRide ? (
          <View style={styles.statusArea}>
            {driverAvailable ? (
              <View style={styles.onlineStatus}>
                <Animated.View style={[styles.statusDot, { transform: [{ scale: pulseAnim }] }]}>
                  <View style={[styles.dotInner, { backgroundColor: colors.primary }]} />
                </Animated.View>
                <View>
                  <Text style={[styles.statusTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                    Waiting for requests
                  </Text>
                  <Text style={[styles.statusSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    You'll be notified when a student nearby needs a ride
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.offlineStatus}>
                <View style={[styles.offlineIcon, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
                  <MaterialCommunityIcons name="rickshaw" size={40} color={colors.mutedForeground} />
                </View>
                <Text style={[styles.offlineTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  You're offline
                </Text>
                <Text style={[styles.offlineSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Toggle the switch above to start receiving ride requests from students on campus
                </Text>
              </View>
            )}

            <View style={[styles.tips, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
              <Text style={[styles.tipsTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                How it works
              </Text>
              {[
                { icon: "wifi", text: "Go online when you're ready to accept rides" },
                { icon: "bell", text: "Get instant notifications for nearby requests" },
                { icon: "check-circle", text: "Accept requests & earn per trip" },
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
          </View>
        ) : (
          <View style={[styles.activeRideCard, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
            <LinearGradient
              colors={[colors.primary + "22", colors.primary + "08"]}
              style={[styles.activeRideHeader, { borderRadius: colors.radius }]}
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
              <View>
                <Text style={[styles.studentName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {currentRide.studentName ?? "Student"}
                </Text>
                <Text style={[styles.studentPhone, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {currentRide.studentPhone}
                </Text>
              </View>
              <View style={[styles.fareBadge, { backgroundColor: colors.accent }]}>
                <Text style={[styles.fareText, { color: colors.accentForeground, fontFamily: "Inter_700Bold" }]}>
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
              <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
              <View style={styles.routeRow}>
                <View style={[styles.routeDot, { backgroundColor: colors.destructive }]} />
                <Text style={[styles.routeText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
                  {currentRide.destination.name}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleCompleteRide}
              style={[styles.completeBtn, { backgroundColor: colors.primary, borderRadius: colors.radius - 4 }]}
            >
              <Feather name="check-circle" size={18} color="#fff" />
              <Text style={[styles.completeBtnText, { fontFamily: "Inter_600SemiBold" }]}>Mark as Completed</Text>
            </Pressable>
          </View>
        )}
      </View>

      {pendingRequest && (
        <Animated.View
          style={[
            styles.requestOverlay,
            { transform: [{ translateY: requestSlideAnim }] },
          ]}
        >
          <View style={[styles.requestCard, { backgroundColor: colors.card, borderRadius: 24, borderColor: colors.border }]}>
            <View style={styles.requestHandle}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </View>
            <View style={styles.requestHeader}>
              <View style={[styles.newBadge, { backgroundColor: colors.accent }]}>
                <Text style={[styles.newBadgeText, { fontFamily: "Inter_700Bold", color: colors.accentForeground }]}>
                  NEW REQUEST
                </Text>
              </View>
              <Text style={[styles.requestFare, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                ₦{pendingRequest.fare - (pendingRequest.rideType === "normal" ? 20 : 50)}
              </Text>
            </View>

            <View style={styles.requestStudent}>
              <View style={[styles.reqAvatar, { backgroundColor: colors.secondary }]}>
                <Ionicons name="person" size={22} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.reqName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {pendingRequest.studentName}
                </Text>
                <View style={styles.rideBadgeRow}>
                  <View style={[styles.rideBadge, { backgroundColor: pendingRequest.rideType === "drop" ? colors.accent + "22" : colors.secondary }]}>
                    <Text style={[styles.rideBadgeText, { color: pendingRequest.rideType === "drop" ? colors.accent : colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                      {pendingRequest.rideType === "drop" ? "Drop Ride" : "Normal Ride"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.reqRoute, { backgroundColor: colors.muted, borderRadius: colors.radius - 4 }]}>
              <View style={styles.reqRouteRow}>
                <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.reqRouteText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
                  {pendingRequest.pickup.name}
                </Text>
              </View>
              <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
              <View style={styles.reqRouteRow}>
                <View style={[styles.routeDot, { backgroundColor: colors.destructive }]} />
                <Text style={[styles.reqRouteText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
                  {pendingRequest.destination.name}
                </Text>
              </View>
            </View>

            <View style={styles.requestActions}>
              <Pressable
                onPress={handleReject}
                style={({ pressed }) => [styles.rejectBtn, { backgroundColor: colors.muted, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 }]}
              >
                <Feather name="x" size={22} color={colors.destructive} />
              </Pressable>
              <Animated.View style={[{ flex: 1 }, { transform: [{ scale: pulseAnim }] }]}>
                <Pressable
                  onPress={handleAccept}
                  style={({ pressed }) => [styles.acceptBtn, { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.9 : 1 }]}
                >
                  <Feather name="check" size={22} color="#fff" />
                  <Text style={[styles.acceptText, { fontFamily: "Inter_700Bold" }]}>Accept</Text>
                </Pressable>
              </Animated.View>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  driverBadge: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  headerName: { fontSize: 17, color: "#fff", fontFamily: "Inter_600SemiBold" },
  plateRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1 },
  plateText: { fontSize: 12, color: "#ffffffaa", fontFamily: "Inter_400Regular" },
  ratingBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  ratingText: { fontSize: 14, color: "#fff", fontFamily: "Inter_600SemiBold" },
  toggleCard: { borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  toggleTitle: { fontSize: 17, color: "#fff", fontFamily: "Inter_700Bold" },
  toggleSub: { fontSize: 12, color: "#ffffffaa", fontFamily: "Inter_400Regular", marginTop: 2, maxWidth: 220 },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  statusArea: { gap: 14 },
  onlineStatus: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  statusDot: { marginTop: 2 },
  dotInner: { width: 12, height: 12, borderRadius: 6 },
  statusTitle: { fontSize: 16 },
  statusSub: { fontSize: 13, marginTop: 3, lineHeight: 19 },
  offlineStatus: { alignItems: "center", gap: 12, paddingVertical: 16 },
  offlineIcon: { width: 80, height: 80, alignItems: "center", justifyContent: "center" },
  offlineTitle: { fontSize: 17 },
  offlineSub: { fontSize: 13, textAlign: "center", lineHeight: 20, maxWidth: 280 },
  tips: { padding: 16, borderWidth: 1, gap: 10 },
  tipsTitle: { fontSize: 14, marginBottom: 4 },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  tipIcon: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", marginTop: 1 },
  tipText: { flex: 1, fontSize: 13, lineHeight: 19 },
  activeRideCard: { borderWidth: 1, overflow: "hidden", gap: 14, padding: 14 },
  activeRideHeader: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10 },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  activeRideTitle: { fontSize: 15 },
  studentRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  studentAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  studentName: { fontSize: 16 },
  studentPhone: { fontSize: 13, marginTop: 2 },
  fareBadge: { marginLeft: "auto", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  fareText: { fontSize: 16 },
  routeSection: { padding: 12, gap: 6 },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeText: { fontSize: 14, flex: 1 },
  routeLine: { width: 2, height: 14, marginLeft: 4 },
  completeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 14 },
  completeBtnText: { fontSize: 16, color: "#fff" },
  requestOverlay: { position: "absolute", bottom: 0, left: 0, right: 0 },
  requestCard: { margin: 12, borderWidth: 1, padding: 16, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: -4 }, elevation: 20 },
  requestHandle: { alignItems: "center", marginBottom: 12 },
  handle: { width: 36, height: 4, borderRadius: 2 },
  requestHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  newBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  newBadgeText: { fontSize: 11, letterSpacing: 0.5 },
  requestFare: { fontSize: 24 },
  requestStudent: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  reqAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  reqName: { fontSize: 16 },
  rideBadgeRow: { marginTop: 4 },
  rideBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, alignSelf: "flex-start" },
  rideBadgeText: { fontSize: 11 },
  reqRoute: { padding: 12, gap: 6, marginBottom: 16 },
  reqRouteRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  reqRouteText: { fontSize: 14, flex: 1 },
  requestActions: { flexDirection: "row", gap: 12 },
  rejectBtn: { width: 56, height: 56, alignItems: "center", justifyContent: "center" },
  acceptBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 56 },
  acceptText: { fontSize: 17, color: "#fff" },
});
