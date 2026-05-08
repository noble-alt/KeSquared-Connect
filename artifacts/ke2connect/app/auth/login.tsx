import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing fields", "Please enter your email and password");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/");
    } catch (e: any) {
      Alert.alert("Login Failed", e.message ?? "Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#003D1F", "#00A651"]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <MaterialCommunityIcons name="rickshaw" size={36} color="#FFB700" />
        <Text style={styles.headerTitle}>Welcome back</Text>
        <Text style={styles.headerSub}>Sign in to your Ke²Connect account</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.form, { paddingBottom: bottomPad + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View style={styles.passwordRow}>
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            style={{ flex: 1 }}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <Button label="Sign In" onPress={handleLogin} loading={loading} />

        <View style={styles.divider}>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>or</Text>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        </View>

        <Pressable
          style={[styles.registerBtn, { borderColor: colors.border, borderRadius: colors.radius }]}
          onPress={() => router.push("/auth/welcome")}
        >
          <Text style={[styles.registerText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
            Don't have an account?{" "}
            <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Create one</Text>
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
  back: {
    marginBottom: 16,
    width: 36,
  },
  headerTitle: {
    fontSize: 28,
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  headerSub: {
    fontSize: 14,
    color: "#ffffffaa",
    fontFamily: "Inter_400Regular",
  },
  form: {
    padding: 24,
    gap: 16,
  },
  passwordRow: {
    position: "relative",
  },
  eyeBtn: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 4,
  },
  line: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
  },
  registerBtn: {
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
  },
});
