import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { type RideRecord } from "@/contexts/RideContext";
import { useColors } from "@/hooks/useColors";

interface RideRequestBannerProps {
  request: RideRecord | null;
  onAccept: () => void;
  onReject: () => void;
}

const VIBRATION_PATTERN = [0, 300, 150, 300, 150, 500];
const GROUP_VIBRATION_PATTERN = [0, 400, 100, 400, 100, 400, 100, 600];

export function RideRequestBanner({ request, onAccept, onReject }: RideRequestBannerProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-300)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const groupPulse = useRef(new Animated.Value(1)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const isGroup = (request?.passengerCount ?? 1) >= 2;
  const passengerCount = request?.passengerCount ?? 1;
  const driverEarning = request
    ? request.fare - (request.rideType === "normal" ? 20 : 50) * passengerCount
    : 0;

  useEffect(() => {
    if (request) {
      if (Platform.OS !== "web") {
        Vibration.vibrate(isGroup ? GROUP_VIBRATION_PATTERN : VIBRATION_PATTERN);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }

      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.04, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();

      if (isGroup) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(groupPulse, { toValue: 1.08, duration: 500, useNativeDriver: true }),
            Animated.timing(groupPulse, { toValue: 1, duration: 500, useNativeDriver: true }),
          ])
        ).start();
      }
    } else {
      Vibration.cancel();
      Animated.timing(translateY, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start();
      glowOpacity.setValue(0);
      pulseScale.setValue(1);
      groupPulse.setValue(1);
    }
  }, [request]);

  if (!request) return null;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { paddingTop: topPad + 10, transform: [{ translateY }] },
      ]}
    >
      {/* Glow */}
      <Animated.View
        style={[
          styles.glow,
          {
            opacity: glowOpacity,
            backgroundColor: isGroup ? "#FFB700" : "#00A651",
            shadowColor: isGroup ? "#FFB700" : "#00A651",
          },
        ]}
      />

      <LinearGradient
        colors={isGroup ? ["#2D1A00", "#5C3600"] : ["#003D1F", "#005C2E"]}
        style={[styles.banner, { borderRadius: colors.radius + 4 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={[styles.pingDot, { backgroundColor: isGroup ? "#FFB70033" : "#4ADE8033" }]}>
              <View style={[styles.pingInner, { backgroundColor: isGroup ? "#FFB700" : "#4ADE80" }]} />
            </View>
            <Text style={styles.headerLabel}>
              {isGroup ? "Group Ride Request" : "New Ride Request"}
            </Text>
          </View>
          <View style={[styles.fareBadge, { backgroundColor: isGroup ? "#FFB700" : "#FFB700" }]}>
            <Text style={styles.fareText}>₦{driverEarning}</Text>
          </View>
        </View>

        {/* Group badge — only when 2+ passengers */}
        {isGroup && (
          <Animated.View style={[styles.groupBadge, { transform: [{ scale: groupPulse }] }]}>
            <LinearGradient
              colors={["#FFB700", "#FF8C00"]}
              style={styles.groupBadgeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="people" size={14} color="#0A0E1A" />
              <Text style={styles.groupBadgeText}>
                {passengerCount} students — same pickup & destination
              </Text>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Passengers list */}
        <View style={styles.passengersBlock}>
          {(request.passengers ?? [{ name: request.studentName ?? "Student", phone: request.studentPhone ?? "" }]).map((p, i) => (
            <View key={i} style={styles.passengerRow}>
              <View style={[styles.passengerAvatar, { backgroundColor: isGroup ? "#FFB70022" : "#ffffff18" }]}>
                <Ionicons name="person" size={13} color={isGroup ? "#FFB700" : "#00A651"} />
              </View>
              <View style={styles.passengerInfo}>
                <Text style={styles.passengerName}>{p.name}</Text>
                {isGroup && (
                  <Text style={styles.passengerPhone}>{p.phone}</Text>
                )}
              </View>
              {i === 0 && !isGroup && (
                <View style={[styles.typeBadge, { backgroundColor: request.rideType === "drop" ? "#FFB70033" : "#ffffff18" }]}>
                  <Text style={[styles.typeText, { color: request.rideType === "drop" ? "#FFB700" : "#ffffffcc" }]}>
                    {request.rideType === "drop" ? "Drop · ₦500" : "Normal · ₦200"}
                  </Text>
                </View>
              )}
            </View>
          ))}
          {isGroup && (
            <View style={[styles.rideSummaryRow, { backgroundColor: "#ffffff0D" }]}>
              <Ionicons name="car" size={13} color="#FFB700" />
              <Text style={styles.rideSummaryText}>
                {request.rideType === "drop" ? "Drop Ride" : "Normal Ride"} · ₦{request.fare} total · You earn ₦{driverEarning}
              </Text>
            </View>
          )}
        </View>

        {/* Route */}
        <View style={styles.route}>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: "#4ADE80" }]} />
            <Text style={styles.routeText} numberOfLines={1}>{request.pickup.name}</Text>
          </View>
          <View style={styles.routeConnector}>
            <View style={styles.connectorLine} />
          </View>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: "#EF4444" }]} />
            <Text style={styles.routeText} numberOfLines={1}>{request.destination.name}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onReject();
            }}
            style={({ pressed }) => [
              styles.rejectBtn,
              { borderRadius: colors.radius, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="x" size={20} color="#ffffff88" />
            <Text style={styles.rejectText}>Decline</Text>
          </Pressable>

          <Animated.View style={[styles.acceptFlex, { transform: [{ scale: pulseScale }] }]}>
            <Pressable
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onAccept();
              }}
              style={({ pressed }) => [
                styles.acceptBtn,
                {
                  borderRadius: colors.radius,
                  backgroundColor: isGroup ? "#FFB700" : "#FFB700",
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <MaterialCommunityIcons name="rickshaw" size={18} color="#0A0E1A" />
              <Text style={styles.acceptText}>
                {isGroup ? `Accept ${passengerCount} Riders` : "Accept Ride"}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 12,
    right: 12,
    zIndex: 9999,
  },
  glow: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    height: 200,
    borderRadius: 20,
    shadowOpacity: 1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  banner: {
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 20,
    borderWidth: 1,
    borderColor: "#ffffff18",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  pingInner: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  headerLabel: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.2,
  },
  fareBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  fareText: {
    color: "#0A0E1A",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  groupBadge: {
    alignSelf: "flex-start",
  },
  groupBadgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  groupBadgeText: {
    color: "#0A0E1A",
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  passengersBlock: {
    gap: 6,
  },
  passengerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  passengerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  passengerInfo: {
    flex: 1,
  },
  passengerName: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  passengerPhone: {
    color: "#ffffffaa",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  typeText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  rideSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    borderRadius: 8,
    marginTop: 2,
  },
  rideSummaryText: {
    color: "#FFB700",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  route: {
    backgroundColor: "#ffffff0D",
    borderRadius: 10,
    padding: 12,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  routeConnector: {
    paddingLeft: 6,
    paddingVertical: 3,
  },
  connectorLine: {
    width: 1.5,
    height: 10,
    backgroundColor: "#ffffff33",
  },
  routeDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  routeText: {
    color: "#ffffffcc",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
  },
  rejectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff12",
  },
  rejectText: {
    color: "#ffffff88",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  acceptFlex: {
    flex: 1,
  },
  acceptBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
  },
  acceptText: {
    color: "#0A0E1A",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
