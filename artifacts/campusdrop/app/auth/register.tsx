import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
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

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuth } from "@/contexts/AuthContext";
import { type UserRole } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const params = useLocalSearchParams<{ role?: string }>();
  const role = (params.role ?? "student") as UserRole;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const isDriver = role === "driver";

  const validate = () => {
    if (!name.trim()) return "Full name is required";
    if (!email.trim() || !email.includes("@")) return "Valid email is required";
    if (!phone.trim() || phone.length < 10) return "Valid phone number is required";
    if (!password || password.length < 6) return "Password must be at least 6 characters";
    if (isDriver && !plateNumber.trim()) return "Plate number is required for drivers";
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) { Alert.alert("Validation Error", err); return; }
    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), phone: phone.trim(), password, role, plateNumber: plateNumber.trim() || undefined });
      router.replace("/");
    } catch (e: any) {
      Alert.alert("Registration Failed", e.message ?? "Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDriver ? ["#1A0A00", "#FF8C00"] : ["#003D1F", "#00A651"]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        {isDriver ? (
          <MaterialCommunityIcons name="rickshaw" size={36} color="#FFB700" />
        ) : (
          <Ionicons name="school" size={36} color="#FFB700" />
        )}
        <Text style={styles.headerTitle}>{isDriver ? "Become a Driver" : "Student Sign Up"}</Text>
        <Text style={styles.headerSub}>
          {isDriver ? "Join the CampusDrop driver network" : "Get rides across UI campus instantly"}
        </Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.form, { paddingBottom: bottomPad + 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input label="Full Name" value={name} onChangeText={setName} placeholder="e.g. Adaeze Obi" autoCapitalize="words" />
        <Input label="Email Address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
        <Input label="Phone Number" value={phone} onChangeText={setPhone} placeholder="e.g. 08012345678" keyboardType="phone-pad" />
        {isDriver && (
          <Input
            label="Tricycle Plate Number"
            value={plateNumber}
            onChangeText={setPlateNumber}
            placeholder="e.g. ABC-123KY"
            autoCapitalize="characters"
          />
        )}
        <View>
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry={!showPass}
          />
          <Pressable onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
            <Ionicons name={showPass ? "eye-off" : "eye"} size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {isDriver && (
          <View style={[styles.notice, { backgroundColor: colors.secondary, borderRadius: colors.radius - 4 }]}>
            <Ionicons name="information-circle" size={18} color={colors.primary} />
            <Text style={[styles.noticeText, { color: colors.secondaryForeground, fontFamily: "Inter_400Regular" }]}>
              Driver accounts are reviewed and approved before you can go online. This usually takes less than 24 hours.
            </Text>
          </View>
        )}

        <Button
          label={isDriver ? "Create Driver Account" : "Create Account"}
          onPress={handleRegister}
          loading={loading}
          variant={isDriver ? "accent" : "primary"}
        />

        <Pressable onPress={() => router.push("/auth/login")}>
          <Text style={[styles.loginLink, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Already have an account?{" "}
            <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Sign In</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    gap: 8,
  },
  back: { marginBottom: 16, width: 36 },
  headerTitle: { fontSize: 26, color: "#fff", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 14, color: "#ffffffaa", fontFamily: "Inter_400Regular" },
  form: { padding: 24, gap: 16 },
  eyeBtn: { position: "absolute", right: 16, bottom: 16 },
  notice: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    alignItems: "flex-start",
  },
  noticeText: { flex: 1, fontSize: 13, lineHeight: 20 },
  loginLink: { textAlign: "center", fontSize: 14 },
});
