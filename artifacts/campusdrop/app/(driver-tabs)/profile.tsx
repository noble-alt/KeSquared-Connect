import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ContactRow,
  InfoModal,
  ModalBulletList,
  ModalGradientBanner,
  ModalSection,
} from "@/components/InfoModal";
import { useAuth } from "@/contexts/AuthContext";
import { type Settings, useSettings } from "@/contexts/SettingsContext";
import { useColors } from "@/hooks/useColors";

export default function DriverProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { settings, updateSetting } = useSettings();

  const [showSupport, setShowSupport] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          logout();
        },
      },
    ]);
  };

  const handleToggle = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    Haptics.selectionAsync();
    updateSetting(key, value);
  };

  const cycleTheme = () => {
    Haptics.selectionAsync();
    const next =
      settings.themePreference === "system"
        ? "light"
        : settings.themePreference === "light"
        ? "dark"
        : "system";
    updateSetting("themePreference", next);
  };

  const themeLabel =
    settings.themePreference === "dark"
      ? "Dark"
      : settings.themePreference === "light"
      ? "Light"
      : "System";

  const initials =
    user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "D";

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
        {/* Account info */}
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          <SectionLabel label="Account" colors={colors} accentColor={colors.accent} />
          <InfoRow icon="mail" label="Email" value={user?.email ?? ""} accentColor={colors.accent} colors={colors} />
          <Divider colors={colors} />
          <InfoRow icon="phone" label="Phone" value={user?.phone ?? ""} accentColor={colors.accent} colors={colors} />
          <Divider colors={colors} />
          <InfoRow icon="tag" label="Plate Number" value={user?.plateNumber ?? "—"} accentColor={colors.accent} colors={colors} />
        </View>

        {/* Notifications */}
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          <SectionLabel label="Notifications" colors={colors} accentColor={colors.accent} />
          <ToggleRow
            icon="bell"
            label="Ride Request Alerts"
            desc="Get notified when a student books a ride"
            value={settings.notificationsEnabled}
            onToggle={(v) => handleToggle("notificationsEnabled", v)}
            accentColor={colors.accent}
            colors={colors}
          />
          <Divider colors={colors} indent />
          <ToggleRow
            icon="volume-2"
            label="Sound Alerts"
            desc="Play a sound when a request arrives"
            value={settings.soundEnabled}
            onToggle={(v) => handleToggle("soundEnabled", v)}
            accentColor={colors.accent}
            colors={colors}
          />
          <Divider colors={colors} indent />
          <ToggleRow
            icon="smartphone"
            label="Vibration"
            desc="Vibrate device for new ride requests"
            value={settings.vibrationEnabled}
            onToggle={(v) => handleToggle("vibrationEnabled", v)}
            accentColor={colors.accent}
            colors={colors}
          />
        </View>

        {/* Privacy */}
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          <SectionLabel label="Privacy" colors={colors} accentColor={colors.accent} />
          <ToggleRow
            icon="bar-chart-2"
            label="Show Earnings on Profile"
            desc="Display your earnings summary on your public profile"
            value={settings.showEarningsOnProfile}
            onToggle={(v) => handleToggle("showEarningsOnProfile", v)}
            accentColor={colors.accent}
            colors={colors}
          />
        </View>

        {/* Appearance */}
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          <SectionLabel label="Appearance" colors={colors} accentColor={colors.accent} />
          <Pressable
            onPress={cycleTheme}
            style={({ pressed }) => [styles.rowBase, { backgroundColor: pressed ? colors.muted : "transparent" }]}
          >
            <View style={[styles.rowIcon, { backgroundColor: colors.accent + "22" }]}>
              <Feather name="moon" size={17} color={colors.accent} />
            </View>
            <View style={styles.rowBody}>
              <Text style={[styles.rowLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>Dark Mode</Text>
              <Text style={[styles.rowDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Currently: {themeLabel}
              </Text>
            </View>
            <View style={[styles.themePill, { backgroundColor: colors.accent + "22" }]}>
              <Text style={[styles.themePillText, { color: colors.accent, fontFamily: "Inter_600SemiBold" }]}>
                {themeLabel}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* More */}
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          <SectionLabel label="More" colors={colors} accentColor={colors.accent} />
          <LinkRow icon="help-circle" label="Driver Support" onPress={() => setShowSupport(true)} accentColor={colors.accent} colors={colors} />
          <Divider colors={colors} indent />
          <LinkRow icon="file-text" label="Terms & Conditions" onPress={() => setShowTerms(true)} accentColor={colors.accent} colors={colors} />
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

      {/* Driver Support modal */}
      <InfoModal
        visible={showSupport}
        onClose={() => setShowSupport(false)}
        title="Driver Support"
        icon="help-circle"
        iconColor={colors.accent}
      >
        <ModalGradientBanner
          gradient={["#1A0A00", "#FF8C00"]}
          lines={["Driver Support Line", "Available Mon–Fri, 7am–8pm WAT. We're on your side."]}
        />
        <ModalSection title="Contact Us" colors={colors}>
          <ContactRow
            icon="mail"
            label="Driver email support"
            value="drivers@campusdrop.ng"
            href="mailto:drivers@campusdrop.ng"
            accentColor={colors.accent}
          />
          <ContactRow
            icon="phone"
            label="Emergency on-road line"
            value="+234 800 KE2 DRIV"
            href="tel:+2348005320348"
            accentColor={colors.accent}
          />
        </ModalSection>
        <ModalSection title="Driver Tips" colors={colors}>
          <ModalBulletList
            accentColor={colors.accent}
            colors={colors}
            items={[
              "Go online only when you're ready to take rides.",
              "Accept requests promptly — students see your ETA.",
              "Collect fares in cash at the end of each trip.",
              "Your ₦20 / ₦50 commission is automatically tracked.",
              "Maintain a 4.0+ rating to stay on the platform.",
            ]}
          />
        </ModalSection>
      </InfoModal>

      {/* Terms & Conditions modal */}
      <InfoModal
        visible={showTerms}
        onClose={() => setShowTerms(false)}
        title="Terms & Conditions"
        icon="file-text"
        iconColor={colors.accent}
      >
        <ModalGradientBanner
          gradient={["#1A0A00", "#B36200"]}
          lines={["Driver Agreement", "Last updated: May 2026"]}
        />
        <ModalSection title="Driver Obligations" colors={colors}>
          <ModalBulletList
            accentColor={colors.accent}
            colors={colors}
            items={[
              "Maintain a valid tricycle permit and roadworthiness certificate.",
              "Treat all students with respect and professionalism.",
              "Collect only the stated fares — ₦200 (Normal) or ₦500 (Drop).",
              "Keep your vehicle clean and mechanically sound.",
              "Do not share your CampusDrop account credentials.",
            ]}
          />
        </ModalSection>
        <ModalSection title="Commission Structure" colors={colors}>
          <ModalBulletList
            accentColor={colors.primary}
            colors={colors}
            items={[
              "Normal Ride: Student pays ₦200 · You earn ₦180 (₦20 fee).",
              "Drop Ride: Student pays ₦500 · You earn ₦450 (₦50 fee).",
              "Commission covers platform maintenance and student safety features.",
            ]}
          />
        </ModalSection>
        <ModalSection title="Account & Safety" colors={colors}>
          <ModalBulletList
            accentColor={colors.destructive}
            colors={colors}
            items={[
              "Accounts with ratings below 3.5 may be suspended.",
              "Student SOS reports are reviewed within 24 hours.",
              "CampusDrop reserves the right to deactivate accounts for misconduct.",
              "Full terms available at campusdrop.ng/driver-terms",
            ]}
          />
        </ModalSection>
      </InfoModal>
    </View>
  );
}

function SectionLabel({ label, colors, accentColor }: { label: string; colors: any; accentColor: string }) {
  return (
    <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
      {label.toUpperCase()}
    </Text>
  );
}

function Divider({ colors, indent }: { colors: any; indent?: boolean }) {
  return <View style={[styles.divider, { backgroundColor: colors.border, marginLeft: indent ? 62 : 0 }]} />;
}

function InfoRow({ icon, label, value, accentColor, colors }: { icon: string; label: string; value: string; accentColor: string; colors: any }) {
  return (
    <View style={styles.rowBase}>
      <View style={[styles.rowIcon, { backgroundColor: accentColor + "22" }]}>
        <Feather name={icon as any} size={17} color={accentColor} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{label}</Text>
        <Text style={[styles.rowLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{value}</Text>
      </View>
    </View>
  );
}

function ToggleRow({
  icon, label, desc, value, onToggle, accentColor, colors,
}: {
  icon: string; label: string; desc: string; value: boolean;
  onToggle: (v: boolean) => void; accentColor: string; colors: any;
}) {
  return (
    <View style={styles.rowBase}>
      <View style={[styles.rowIcon, { backgroundColor: accentColor + "22" }]}>
        <Feather name={icon as any} size={17} color={accentColor} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{label}</Text>
        <Text style={[styles.rowDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: accentColor }}
        thumbColor="#fff"
      />
    </View>
  );
}

function LinkRow({ icon, label, onPress, accentColor, colors }: { icon: string; label: string; onPress: () => void; accentColor: string; colors: any }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.rowBase, { backgroundColor: pressed ? colors.muted : "transparent" }]}
    >
      <View style={[styles.rowIcon, { backgroundColor: accentColor + "22" }]}>
        <Feather name={icon as any} size={17} color={accentColor} />
      </View>
      <Text style={[styles.rowLabel, { color: colors.foreground, fontFamily: "Inter_500Medium", flex: 1 }]}>{label}</Text>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
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
  content: { padding: 16, gap: 12 },
  card: { borderWidth: 1, overflow: "hidden", paddingTop: 4 },
  sectionLabel: { fontSize: 11, letterSpacing: 0.8, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  rowBase: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 14, minHeight: 56 },
  rowIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  rowBody: { flex: 1 },
  rowLabel: { fontSize: 15 },
  rowDesc: { fontSize: 12, marginTop: 1 },
  divider: { height: 1 },
  themePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  themePillText: { fontSize: 13 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderWidth: 1 },
  logoutText: { fontSize: 16 },
});
