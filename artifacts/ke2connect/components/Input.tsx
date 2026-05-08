import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const colors = useColors();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
          {label}
        </Text>
      )}
      <TextInput
        {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        placeholderTextColor={colors.mutedForeground}
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: focused ? colors.primary : error ? colors.destructive : colors.border,
            borderRadius: colors.radius - 2,
            color: colors.foreground,
            fontFamily: "Inter_400Regular",
          },
          style,
        ]}
      />
      {error && (
        <Text style={[styles.error, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    marginBottom: 2,
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
  },
});
