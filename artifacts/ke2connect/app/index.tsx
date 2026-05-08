import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { user, isLoading } = useAuth();
  const colors = useColors();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) return <Redirect href="/auth/welcome" />;
  if (user.role === "driver") return <Redirect href="/(driver-tabs)" />;
  return <Redirect href="/(tabs)" />;
}
