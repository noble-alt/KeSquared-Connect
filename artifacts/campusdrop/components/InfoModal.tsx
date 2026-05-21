import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  icon: string;
  iconColor: string;
  children: React.ReactNode;
}

export function InfoModal({ visible, onClose, title, icon, iconColor, children }: InfoModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.card,
            paddingBottom: Platform.OS === "web" ? 24 : insets.bottom + 16,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Drag handle */}
        <View style={styles.handleRow}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: iconColor + "18" }]}>
            <Feather name={icon as any} size={22} color={iconColor} />
          </View>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {title}
          </Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Feather name="x" size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.body}
        >
          {children}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Pre-built content blocks ─────────────────────────────────────────────────

interface ContactRowProps {
  icon: string;
  label: string;
  value: string;
  href?: string;
  accentColor: string;
}

export function ContactRow({ icon, label, value, href, accentColor }: ContactRowProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={() => {
        if (href) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Linking.openURL(href);
        }
      }}
      style={({ pressed }) => [
        styles.contactRow,
        { backgroundColor: pressed && href ? colors.muted : colors.muted, borderRadius: colors.radius - 4 },
      ]}
    >
      <View style={[styles.contactIcon, { backgroundColor: accentColor + "18" }]}>
        <Feather name={icon as any} size={18} color={accentColor} />
      </View>
      <View style={styles.contactBody}>
        <Text style={[styles.contactLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {label}
        </Text>
        <Text style={[styles.contactValue, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          {value}
        </Text>
      </View>
      {href && <Feather name="external-link" size={14} color={colors.mutedForeground} />}
    </Pressable>
  );
}

export function ModalSection({ title, children, colors }: { title: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
        {title.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}

export function ModalGradientBanner({ lines, gradient }: { lines: string[]; gradient: string[] }) {
  return (
    <LinearGradient colors={gradient as any} style={styles.banner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      {lines.map((line, i) => (
        <Text key={i} style={[styles.bannerText, i === 0 && styles.bannerMain]}>
          {line}
        </Text>
      ))}
    </LinearGradient>
  );
}

export function ModalBulletList({ items, accentColor, colors }: { items: string[]; accentColor: string; colors: any }) {
  return (
    <View style={styles.bulletList}>
      {items.map((item) => (
        <View key={item} style={styles.bulletRow}>
          <View style={[styles.bullet, { backgroundColor: accentColor }]} />
          <Text style={[styles.bulletText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#00000055",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 20,
  },
  handleRow: { alignItems: "center", paddingTop: 10, paddingBottom: 4 },
  handle: { width: 36, height: 4, borderRadius: 2 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { flex: 1, fontSize: 18 },
  body: { paddingHorizontal: 20, paddingBottom: 20, gap: 16 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 11, letterSpacing: 0.8 },
  contactRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  contactIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  contactBody: { flex: 1 },
  contactLabel: { fontSize: 12 },
  contactValue: { fontSize: 15, marginTop: 1 },
  banner: {
    borderRadius: 14,
    padding: 18,
    gap: 4,
  },
  bannerText: { fontSize: 13, color: "#ffffffcc", fontFamily: "Inter_400Regular" },
  bannerMain: { fontSize: 22, color: "#fff", fontFamily: "Inter_700Bold", marginBottom: 4 },
  bulletList: { gap: 10 },
  bulletRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 7, flexShrink: 0 },
  bulletText: { flex: 1, fontSize: 14, lineHeight: 21 },
});
