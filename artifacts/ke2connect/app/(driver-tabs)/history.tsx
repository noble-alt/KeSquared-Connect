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

import { RideCard } from "@/components/RideCard";
import { useAuth } from "@/contexts/AuthContext";
import { type RideRecord, useRide } from "@/contexts/RideContext";
import { useColors } from "@/hooks/useColors";

export default function DriverHistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getDriverHistory } = useRide();
  const [trips, setTrips] = useState<RideRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      setLoading(true);
      getDriverHistory(user.id).then((data) => {
        setTrips(data);
        setLoading(false);
      });
    }, [user, getDriverHistory])
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const totalEarned = trips.reduce((sum, t) => sum + (t.earning ?? 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Trip History</Text>
        <View style={styles.statsRow}>
          <View>
            <Text style={[styles.statNum, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {trips.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Total Trips</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View>
            <Text style={[styles.statNum, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
              ₦{totalEarned.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Total Earned</Text>
          </View>
        </View>
      </View>

      {trips.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="list" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>No trips yet</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Your completed trips will appear here. Go online to start accepting requests!
          </Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <RideCard ride={item} isDriver />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 26, marginBottom: 12 },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 24 },
  statNum: { fontSize: 22 },
  statLabel: { fontSize: 12, marginTop: 2 },
  divider: { width: 1, height: 36 },
  list: { paddingHorizontal: 16, paddingTop: 14 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  emptyTitle: { fontSize: 18 },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 22 },
});
