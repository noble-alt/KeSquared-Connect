import { Feather, Ionicons } from "@expo/vector-icons";
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

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { settings, updateSetting } = useSettings();

  const [showSupport, setShowSupport] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

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
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#003D1F", "#00A651"]}
        style={[styles.headerGradient, { paddingTop: topPad + 20 }]}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
            <Text style={[styles.avatarText, { color: colors.accentForeground }]}>{initials}</Text>
          </View>
        </View>
        <Text style={styles.name}>{user?.name ?? "Student"}</Text>
        <Text style={styles.role}>Student · UI Campus</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{user?.totalRides ?? 0}</Text>
            <Text style={styles.statLabel}>Rides</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>★ {user?.rating?.toFixed(1) ?? "5.0"}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>UI</Text>
            <Text style={styles.statLabel}>Campus</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Account info */}
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          <SectionLabel label="Account" colors={colors} />
          <InfoRow icon="mail" label="Email" value={user?.email ?? ""} colors={colors} />
          <Divider colors={colors} />
          <InfoRow icon="phone" label="Phone" value={user?.phone ?? ""} colors={colors} />
        </View>

        {/* Notifications */}
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          <SectionLabel label="Notifications" colors={colors} />
          <ToggleRow
            icon="bell"
            label="Push Notifications"
            desc="Receive alerts for ride status updates"
            value={settings.notificationsEnabled}
            onToggle={(v) => handleToggle("notificationsEnabled", v)}
            colors={colors}
          />
          <Divider colors={colors} indent />
          <ToggleRow
            icon="volume-2"
            label="Sound"
            desc="Play sounds for alerts and confirmations"
            value={settings.soundEnabled}
            onToggle={(v) => handleToggle("soundEnabled", v)}
            colors={colors}
          />
          <Divider colors={colors} indent />
          <ToggleRow
            icon="smartphone"
            label="Vibration"
            desc="Vibrate for incoming ride notifications"
            value={settings.vibrationEnabled}
            onToggle={(v) => handleToggle("vibrationEnabled", v)}
            colors={colors}
          />
        </View>

        {/* Privacy */}
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          <SectionLabel label="Privacy & Safety" colors={colors} />
          <ToggleRow
            icon="eye"
            label="Share Ride History"
            desc="Allow drivers to see your ride count and rating"
            value={settings.shareRideHistory}
            onToggle={(v) => handleToggle("shareRideHistory", v)}
            colors={colors}
          />
        </View>

        {/* Appearance */}
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          <SectionLabel label="Appearance" colors={colors} />
          <Pressable
            onPress={cycleTheme}
            style={({ pressed }) => [styles.rowBase, { backgroundColor: pressed ? colors.muted : "transparent" }]}
          >
            <View style={[styles.rowIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="moon" size={17} color={colors.primary} />
            </View>
            <View style={styles.rowBody}>
              <Text style={[styles.rowLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>Dark Mode</Text>
              <Text style={[styles.rowDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Currently: {themeLabel}
              </Text>
            </View>
            <View style={[styles.themePill, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.themePillText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                {themeLabel}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* More */}
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          <SectionLabel label="More" colors={colors} />
          <LinkRow icon="help-circle" label="Help & Support" onPress={() => setShowSupport(true)} colors={colors} />
          <Divider colors={colors} indent />
          <LinkRow icon="info" label="About Ke²Connect" onPress={() => setShowAbout(true)} colors={colors} />
        </View>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "40", borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive, fontFamily: "Inter_600SemiBold" }]}>
            Sign Out
          </Text>
        </Pressable>
      </ScrollView>

      {/* Help & Support modal */}
      <InfoModal
        visible={showSupport}
        onClose={() => setShowSupport(false)}
        title="Help & Support"
        icon="help-circle"
        iconColor={colors.primary}
      >
        <ModalGradientBanner
          gradient={["#003D1F", "#00A651"]}
          lines={["Ke²Connect Support", "We're here to help you get around campus safely and quickly."]}
        />
        <ModalSection title="Contact Us" colors={colors}>
          <ContactRow
            icon="mail"
            label="Email support"
            value="support@ke2connect.ng"
            href="mailto:support@ke2connect.ng"
            accentColor={colors.primary}
          />
          <ContactRow
            icon="phone"
            label="Phone (Mon–Fri, 8am–6pm WAT)"
            value="+234 800 KE2 CONN"
            href="tel:+2348005320666"
            accentColor={colors.primary}
          />
        </ModalSection>
        <ModalSection title="Common Questions" colors={colors}>
          <ModalBulletList
            accentColor={colors.primary}
            colors={colors}
            items={[
              "Use the SOS button during a ride to alert emergency contacts.",
              "Normal rides (₦200) are shared with up to 3 passengers.",
              "Drop rides (₦500) are private — just you and the driver.",
              "Ride history is saved automatically after each completed trip.",
              "If a driver doesn't arrive, cancel and request a new ride.",
            ]}
          />
        </ModalSection>
      </InfoModal>

      {/* About modal */}
      <InfoModal
        visible={showAbout}
        onClose={() => setShowAbout(false)}
        title="About Ke²Connect"
        icon="info"
        iconColor={colors.primary}
      >
        <ModalGradientBanner
          gradient={["#003D1F", "#005C2E"]}
          lines={["Ke²Connect", "Version 1.0.0", "Campus ride-hailing for the University of Ibadan"]}
        />
        <ModalSection title="Our Mission" colors={colors}>
          <ModalBulletList
            accentColor={colors.primary}
            colors={colors}
            items={[
              "Safe, affordable keke rides across the UI campus.",
              "Connecting students to verified campus drivers instantly.",
              "Supporting the UI community with campus-first transport.",
            ]}
          />
        </ModalSection>
        <ModalSection title="Ride Types" colors={colors}>
          <ModalBulletList
            accentColor={colors.accent}
            colors={colors}
            items={[
              "Normal Ride (₦200) — shared, up to 3 students per keke.",
              "Drop Ride (₦500) — private, direct to your destination.",
              "All drivers are university-verified and rated by students.",
            ]}
          />
        </ModalSection>
        <ModalSection title="Contact" colors={colors}>
          <ContactRow
            icon="globe"
            label="Website"
            value="ke2connect.ng"
            href="https://ke2connect.ng"
            accentColor={colors.primary}
          />
          <ContactRow
            icon="mail"
            label="General enquiries"
            value="hello@ke2connect.ng"
            href="mailto:hello@ke2connect.ng"
            accentColor={colors.primary}
          />
        </ModalSection>
      </InfoModal>
    </View>
  );
}

function SectionLabel({ label, colors }: { label: string; colors: any }) {
  return (
    <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
      {label.toUpperCase()}
    </Text>
  );
}

function Divider({ colors, indent }: { colors: any; indent?: boolean }) {
  return <View style={[styles.divider, { backgroundColor: colors.border, marginLeft: indent ? 62 : 0 }]} />;
}

function InfoRow({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: any }) {
  return (
    <View style={styles.rowBase}>
      <View style={[styles.rowIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={icon as any} size={17} color={colors.primary} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{label}</Text>
        <Text style={[styles.rowLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{value}</Text>
      </View>
    </View>
  );
}

function ToggleRow({
  icon, label, desc, value, onToggle, colors,
}: {
  icon: string; label: string; desc: string; value: boolean;
  onToggle: (v: boolean) => void; colors: any;
}) {
  return (
    <View style={styles.rowBase}>
      <View style={[styles.rowIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={icon as any} size={17} color={colors.primary} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{label}</Text>
        <Text style={[styles.rowDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}

function LinkRow({ icon, label, onPress, colors }: { icon: string; label: string; onPress: () => void; colors: any }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.rowBase, { backgroundColor: pressed ? colors.muted : "transparent" }]}
    >
      <View style={[styles.rowIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={icon as any} size={17} color={colors.primary} />
      </View>
      <Text style={[styles.rowLabel, { color: colors.foreground, fontFamily: "Inter_500Medium", flex: 1 }]}>{label}</Text>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: { paddingHorizontal: 20, paddingBottom: 28, alignItems: "center", gap: 6 },
  avatarContainer: { marginBottom: 4 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 30, fontFamily: "Inter_700Bold" },
  name: { fontSize: 22, color: "#fff", fontFamily: "Inter_700Bold" },
  role: { fontSize: 13, color: "#ffffffaa", fontFamily: "Inter_400Regular" },
  statsRow: { flexDirection: "row", alignItems: "center", marginTop: 12, gap: 28 },
  stat: { alignItems: "center", gap: 2 },
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
