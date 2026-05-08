import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function DriverProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); logout(); },
      },
    ]);
  };

  const initials = user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "D";

  const menuItems = [
    { icon: "bell", label: "Notifications", onPress: () => Alert.alert("Coming soon", "Notification settings will be available soon") },
    { icon: "map", label: "Navigation Preferences", onPress: () => Alert.alert("Coming soon", "Navigation settings will be available soon") },
    { icon: "help-circle", label: "Driver Support", onPress: () => Alert.alert("Support", "Driver support:\ndrivers@ke2connect.ng\n+234 800 KE2 DRIV") },
    { icon: "file-text", label: "Terms & Conditions", onPress: () => Alert.alert("Coming soon", "Terms will be available soon") },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#1A0A00", "#FF8C00", "#FFB700"]}
        style={[styles.headerGradient, { paddingTop: topPad + 20 }]}
      >
        <View style={styles.headerTop}>
          <View style={[styles.approvedBadge, { backgroundColor: "#ffffff22" }]}>
            <Ionicons name="checkmark-circle" size={14} color="#4ADE80" />
            <Text style={styles.approvedText}>Verified Driver</Text>
          </View>
        </View>

        <View style={styles.avatarRow}>
          <View style={[styles.avatar, { backgroundColor: "#fff" }]}>
            <Text style={[styles.avatarText, { color: "#FF8C00" }]}>{initials}</Text>
          </View>
        </View>

        <Text style={styles.name}>{user?.name ?? "Driver"}</Text>
        <Text style={styles.plate}>{user?.plateNumber ?? "—"}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{user?.totalRides ?? 0}</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>★ {user?.rating?.toFixed(1) ?? "5.0"}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <MaterialCommunityIcons name="rickshaw" size={22} color="#fff" />
            <Text style={styles.statLabel}>Tricycle</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          <InfoRow icon="mail" label="Email" value={user?.email ?? ""} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow icon="phone" label="Phone" value={user?.phone ?? ""} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow icon="tag" label="Plate Number" value={user?.plateNumber ?? "—"} colors={colors} />
        </View>

        <View style={[styles.menuCard, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          {menuItems.map((item, idx) => (
            <View key={item.label}>
              <Pressable
                onPress={item.onPress}
                style={({ pressed }) => [styles.menuItem, { backgroundColor: pressed ? colors.muted : "transparent" }]}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.accent + "22" }]}>
                  <Feather name={item.icon as any} size={18} color={colors.accent} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{item.label}</Text>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </Pressable>
              {idx < menuItems.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border, marginLeft: 64 }]} />}
            </View>
          ))}
        </View>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "40", borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive, fontFamily: "Inter_600SemiBold" }]}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: any }) {
  return (
    <View style={styles.infoRow}>
      <Feather name={icon as any} size={16} color={colors.mutedForeground} />
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: { paddingHorizontal: 20, paddingBottom: 24, alignItems: "center", gap: 6 },
  headerTop: { width: "100%", alignItems: "flex-end", marginBottom: 8 },
  approvedBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  approvedText: { fontSize: 12, color: "#4ADE80", fontFamily: "Inter_500Medium" },
  avatarRow: { marginBottom: 4 },
  avatar: { width: 82, height: 82, borderRadius: 41, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 32, fontFamily: "Inter_700Bold" },
  name: { fontSize: 22, color: "#fff", fontFamily: "Inter_700Bold" },
  plate: { fontSize: 13, color: "#ffffff99", fontFamily: "Inter_500Medium" },
  statsRow: { flexDirection: "row", alignItems: "center", marginTop: 12, gap: 24 },
  stat: { alignItems: "center", gap: 3 },
  statNum: { fontSize: 16, color: "#fff", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, color: "#ffffff88", fontFamily: "Inter_400Regular" },
  statDivider: { width: 1, height: 28, backgroundColor: "#ffffff33" },
  content: { padding: 16, gap: 14 },
  infoCard: { borderWidth: 1, overflow: "hidden" },
  infoRow: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12 },
  infoValue: { fontSize: 15, marginTop: 1 },
  divider: { height: 1 },
  menuCard: { borderWidth: 1, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  menuIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 15 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderWidth: 1 },
  logoutText: { fontSize: 16 },
});
