import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <LinearGradient
      colors={["#003D1F", "#00A651", "#00C85A"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={[styles.content, { paddingTop: topPad + 40, paddingBottom: bottomPad + 30 }]}>
        <View style={styles.hero}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="rickshaw" size={48} color="#fff" />
          </View>
          <Text style={styles.appName}>Ke²Connect</Text>
          <Text style={styles.tagline}>Campus rides, made simple</Text>
          <Text style={styles.subtitle}>University of Ibadan's smartest{"\n"}transportation platform</Text>
        </View>

        <View style={styles.roleSection}>
          <Text style={styles.roleQuestion}>How will you use Ke²Connect?</Text>

          <Pressable
            style={({ pressed }) => [styles.roleCard, { opacity: pressed ? 0.9 : 1 }]}
            onPress={() => router.push({ pathname: "/auth/register", params: { role: "student" } })}
          >
            <LinearGradient colors={["#ffffff18", "#ffffff08"]} style={styles.roleCardGradient}>
              <View style={[styles.roleIcon, { backgroundColor: "#FFB700" }]}>
                <Ionicons name="school" size={26} color="#0A0E1A" />
              </View>
              <View style={styles.roleInfo}>
                <Text style={styles.roleName}>I'm a Student</Text>
                <Text style={styles.roleDesc}>Book rides across campus instantly</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#ffffff88" />
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.roleCard, { opacity: pressed ? 0.9 : 1 }]}
            onPress={() => router.push({ pathname: "/auth/register", params: { role: "driver" } })}
          >
            <LinearGradient colors={["#ffffff18", "#ffffff08"]} style={styles.roleCardGradient}>
              <View style={[styles.roleIcon, { backgroundColor: "#00A651" }]}>
                <MaterialCommunityIcons name="rickshaw" size={26} color="#fff" />
              </View>
              <View style={styles.roleInfo}>
                <Text style={styles.roleName}>I'm a Driver</Text>
                <Text style={styles.roleDesc}>Earn by giving rides on campus</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#ffffff88" />
            </LinearGradient>
          </Pressable>
        </View>

        <Pressable onPress={() => router.push("/auth/login")}>
          <Text style={styles.loginLink}>
            Already have an account?{" "}
            <Text style={styles.loginLinkBold}>Sign In</Text>
          </Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  hero: {
    alignItems: "center",
    gap: 10,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#ffffff22",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#ffffff44",
  },
  appName: {
    fontSize: 38,
    color: "#fff",
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: "#ffffffcc",
    fontFamily: "Inter_500Medium",
  },
  subtitle: {
    fontSize: 14,
    color: "#ffffff88",
    textAlign: "center",
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  roleSection: {
    gap: 14,
  },
  roleQuestion: {
    color: "#ffffffbb",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    marginBottom: 4,
  },
  roleCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ffffff22",
  },
  roleCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 14,
  },
  roleIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  roleDesc: {
    color: "#ffffffaa",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  loginLink: {
    textAlign: "center",
    color: "#ffffffaa",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  loginLinkBold: {
    color: "#FFB700",
    fontFamily: "Inter_600SemiBold",
  },
});
