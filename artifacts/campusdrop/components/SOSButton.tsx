import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import { Alert, Animated, Pressable, StyleSheet, Text } from "react-native";

export function SOSButton() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);

  const handlePressIn = () => {
    setPressed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert(
      "SOS Emergency",
      "Are you in danger? Your location will be shared with campus security immediately.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send SOS",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("SOS Sent", "Campus security has been notified. Help is on the way.\n\nUI Security: +234 803 123 4567");
          },
        },
      ]
    );
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.button, pressed && styles.buttonPressed]}
      >
        <Ionicons name="warning" size={16} color="#fff" />
        <Text style={styles.label}>SOS</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#EF4444",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    shadowColor: "#EF4444",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  buttonPressed: {
    backgroundColor: "#DC2626",
  },
  label: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
});
