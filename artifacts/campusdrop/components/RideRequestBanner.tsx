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

export function RideRequestBanner({ request, onAccept, onReject }: RideRequestBannerProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-220)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    if (request) {
      // Vibrate + haptics to alert the driver
      if (Platform.OS !== "web") {
        Vibration.vibrate(VIBRATION_PATTERN);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }

      // Slide banner down
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start();

      // Pulse glow effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        ])
      ).start();

      // Pulse the accept button
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.04, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      Vibration.cancel();
      Animated.timing(translateY, {
        toValue: -220,
        duration: 300,
        useNativeDriver: true,
      }).start();
      glowOpacity.setValue(0);
      pulseScale.setValue(1);
    }
  }, [request]);

  if (!request) return null;

  const driverEarning = request.fare - (request.rideType === "normal" ? 20 : 50);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { paddingTop: topPad + 10, transform: [{ translateY }] },
      ]}
    >
      <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
      <LinearGradient
        colors={["#003D1F", "#005C2E"]}
        style={[styles.banner, { borderRadius: colors.radius + 4 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.pingDot}>
              <View style={styles.pingInner} />
            </View>
            <Text style={styles.headerLabel}>New Ride Request</Text>
          </View>
          <View style={[styles.fareBadge, { backgroundColor: "#FFB700" }]}>
            <Text style={styles.fareText}>₦{driverEarning}</Text>
          </View>
        </View>

        {/* Student row */}
        <View style={styles.studentRow}>
          <View style={styles.studentAvatar}>
            <Ionicons name="person" size={16} color="#00A651" />
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{request.studentName ?? "Student"}</Text>
            <View style={[styles.typeBadge, { backgroundColor: request.rideType === "drop" ? "#FFB70033" : "#ffffff18" }]}>
              <Text style={[styles.typeText, { color: request.rideType === "drop" ? "#FFB700" : "#ffffffcc" }]}>
                {request.rideType === "drop" ? "Drop Ride · ₦500" : "Normal Ride · ₦200"}
              </Text>
            </View>
          </View>
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
                { borderRadius: colors.radius, backgroundColor: "#FFB700", opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <MaterialCommunityIcons name="rickshaw" size={18} color="#0A0E1A" />
              <Text style={styles.acceptText}>Accept Ride</Text>
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
    height: 180,
    backgroundColor: "#00A651",
    borderRadius: 20,
    shadowColor: "#00A651",
    shadowOpacity: 1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  banner: {
    padding: 16,
    gap: 12,
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
    backgroundColor: "#4ADE8033",
    alignItems: "center",
    justifyContent: "center",
  },
  pingInner: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
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
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  studentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ffffff18",
    alignItems: "center",
    justifyContent: "center",
  },
  studentInfo: {
    flex: 1,
    gap: 4,
  },
  studentName: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  typeText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  route: {
    backgroundColor: "#ffffff0D",
    borderRadius: 10,
    padding: 12,
    gap: 0,
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
