import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { RideRecord } from "@/contexts/RideContext";
import { useColors } from "@/hooks/useColors";

interface RideCardProps {
  ride: RideRecord;
  isDriver?: boolean;
}

function formatDate(timestamp: number) {
  const d = new Date(timestamp);
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(timestamp: number) {
  const d = new Date(timestamp);
  return d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
}

export function RideCard({ ride, isDriver = false }: RideCardProps) {
  const colors = useColors();

  const statusColor =
    ride.status === "completed"
      ? colors.primary
      : ride.status === "cancelled"
        ? colors.destructive
        : colors.accent;

  const statusLabel =
    ride.status === "completed" ? "Completed" : ride.status === "cancelled" ? "Cancelled" : "In Progress";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.rideTypeBadge, { backgroundColor: ride.rideType === "drop" ? colors.accent + "22" : colors.secondary }]}>
          <Text style={[styles.rideTypeText, { color: ride.rideType === "drop" ? colors.accent : colors.primary, fontFamily: "Inter_600SemiBold" }]}>
            {ride.rideType === "drop" ? "Drop Ride" : "Normal Ride"}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
          <Text style={[styles.statusText, { color: statusColor, fontFamily: "Inter_500Medium" }]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.route}>
        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.locationText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
            {ride.pickup.name}
          </Text>
        </View>
        <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: colors.destructive }]} />
          <Text style={[styles.locationText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
            {ride.destination.name}
          </Text>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.footerItem}>
          <Feather name="clock" size={13} color={colors.mutedForeground} />
          <Text style={[styles.footerText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {formatDate(ride.timestamp)} · {formatTime(ride.timestamp)}
          </Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="cash-outline" size={13} color={isDriver ? colors.primary : colors.foreground} />
          <Text style={[styles.footerText, { color: isDriver ? colors.primary : colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            ₦{isDriver && ride.earning != null ? ride.earning : ride.fare}
          </Text>
        </View>
      </View>

      {isDriver && ride.studentName && (
        <View style={[styles.extra, { borderTopColor: colors.border }]}>
          <Text style={[styles.extraText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Student: {ride.studentName}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    paddingBottom: 10,
  },
  rideTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  rideTypeText: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
  },
  route: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 4,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  routeLine: {
    width: 1.5,
    height: 12,
    marginLeft: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  footerText: {
    fontSize: 13,
  },
  extra: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  extraText: {
    fontSize: 12,
  },
});
