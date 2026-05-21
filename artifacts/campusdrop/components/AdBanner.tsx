import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface Ad {
  id: string;
  sponsor: string;
  tagline: string;
  cta: string;
  icon: string;
  accentColor: string;
}

const CAMPUS_ADS: Ad[] = [
  {
    id: "1",
    sponsor: "UI Bookshop",
    tagline: "New semester, new textbooks. 10% off all course materials this week.",
    cta: "Shop Now",
    icon: "book-open",
    accentColor: "#00A651",
  },
  {
    id: "2",
    sponsor: "UI Health Centre",
    tagline: "Walk-in consultations available Mon–Fri, 8am–4pm. No appointment needed.",
    cta: "Learn More",
    icon: "heart",
    accentColor: "#EF4444",
  },
  {
    id: "3",
    sponsor: "UI Cafeteria",
    tagline: "Today's special: Jollof Rice & Grilled Chicken — ₦800 only. Dine in or take away.",
    cta: "View Menu",
    icon: "coffee",
    accentColor: "#F97316",
  },
  {
    id: "4",
    sponsor: "Campus Print Hub",
    tagline: "Fast & affordable printing. A4 colour pages from ₦25. Open till 9pm daily.",
    cta: "Visit Us",
    icon: "printer",
    accentColor: "#8B5CF6",
  },
  {
    id: "5",
    sponsor: "UI Alumni Connect",
    tagline: "Build your network early. Join 10,000+ UI alumni on the official platform.",
    cta: "Join Free",
    icon: "users",
    accentColor: "#0EA5E9",
  },
];

interface AdBannerProps {
  style?: object;
}

export function AdBanner({ style }: AdBannerProps) {
  const colors = useColors();
  const [adIndex, setAdIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setAdIndex((i) => (i + 1) % CAMPUS_ADS.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 7000);
    return () => clearInterval(interval);
  }, [fadeAnim]);

  const ad = CAMPUS_ADS[adIndex];

  return (
    <Pressable
      onPress={() => Alert.alert(ad.sponsor, `${ad.tagline}\n\nThis is a sponsored placement on CampusDrop.`)}
      style={({ pressed }) => [styles.container, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius, opacity: pressed ? 0.92 : 1 }, style]}
    >
      <View style={[styles.accentBar, { backgroundColor: ad.accentColor }]} />
      <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
        <View style={[styles.iconWrap, { backgroundColor: ad.accentColor + "1A" }]}>
          <Feather name={ad.icon as any} size={18} color={ad.accentColor} />
        </View>
        <View style={styles.textBlock}>
          <View style={styles.topRow}>
            <Text style={[styles.sponsor, { color: ad.accentColor, fontFamily: "Inter_600SemiBold" }]}>
              {ad.sponsor}
            </Text>
            <View style={[styles.sponsoredBadge, { backgroundColor: colors.muted }]}>
              <Text style={[styles.sponsoredText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Sponsored
              </Text>
            </View>
          </View>
          <Text style={[styles.tagline, { color: colors.foreground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>
            {ad.tagline}
          </Text>
        </View>
        <View style={[styles.ctaBtn, { backgroundColor: ad.accentColor + "1A", borderColor: ad.accentColor + "40" }]}>
          <Text style={[styles.ctaText, { color: ad.accentColor, fontFamily: "Inter_600SemiBold" }]}>
            {ad.cta}
          </Text>
        </View>
      </Animated.View>

      {/* Dot indicators */}
      <View style={styles.dots}>
        {CAMPUS_ADS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === adIndex ? ad.accentColor : colors.border },
            ]}
          />
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: "hidden",
  },
  accentBar: {
    height: 3,
    width: "100%",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    gap: 3,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sponsor: {
    fontSize: 13,
  },
  sponsoredBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  sponsoredText: {
    fontSize: 10,
  },
  tagline: {
    fontSize: 12,
    lineHeight: 17,
  },
  ctaBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    flexShrink: 0,
  },
  ctaText: {
    fontSize: 11,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    paddingBottom: 8,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});
