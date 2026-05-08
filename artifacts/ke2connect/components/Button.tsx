import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

import { useColors } from "@/hooks/useColors";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "accent";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  fullWidth = true,
}: ButtonProps) {
  const colors = useColors();

  const bg =
    variant === "primary"
      ? colors.primary
      : variant === "danger"
        ? colors.destructive
        : variant === "accent"
          ? colors.accent
          : variant === "secondary"
            ? colors.secondary
            : "transparent";

  const fg =
    variant === "primary"
      ? colors.primaryForeground
      : variant === "danger"
        ? colors.destructiveForeground
        : variant === "accent"
          ? colors.accentForeground
          : colors.foreground;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderRadius: colors.radius, opacity: pressed || disabled ? 0.7 : 1 },
        variant === "ghost" && { borderWidth: 1.5, borderColor: colors.border },
        variant === "secondary" && { borderWidth: 0 },
        fullWidth && { width: "100%" },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <Text style={[styles.label, { color: fg, fontFamily: "Inter_600SemiBold" }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  label: {
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
