import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AdBanner } from "@/components/AdBanner";
import { RideCard } from "@/components/RideCard";
import { useAuth } from "@/contexts/AuthContext";
import { type RideRecord, useRide } from "@/contexts/RideContext";
import { useColors } from "@/hooks/useColors";

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getRideHistory } = useRide();
  const [rides, setRides] = useState<RideRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      setLoading(true);
      getRideHistory(user.id).then((data) => {
        setRides(data);
        setLoading(false);
      });
    }, [user, getRideHistory])
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Ride History</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {rides.length} ride{rides.length !== 1 ? "s" : ""} total
        </Text>
      </View>

      <AdBanner style={styles.adBanner} />

      {rides.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="clock" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            No rides yet
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Your completed rides will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <RideCard ride={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 26 },
  subtitle: { fontSize: 14, marginTop: 4 },
  adBanner: { marginHorizontal: 16, marginBottom: 4 },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  emptyTitle: { fontSize: 18 },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 22 },
});
