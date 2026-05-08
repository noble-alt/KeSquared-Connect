import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SOSButton } from "@/components/SOSButton";
import { CAMPUS_LOCATIONS, UI_REGION, type CampusLocation } from "@/constants/locations";
import { useAuth } from "@/contexts/AuthContext";
import { type RideLocation, type RideType, useRide } from "@/contexts/RideContext";
import { useColors } from "@/hooks/useColors";

const { height } = Dimensions.get("window");
const SHEET_HEIGHT = height * 0.52;

type Step = "destination" | "ride_type" | "searching" | "driver_found" | "in_progress";

export default function StudentHomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { requestRide, cancelRide, rideStatus, currentRide, driverEta } = useRide();

  const [step, setStep] = useState<Step>("destination");
  const [selectedDest, setSelectedDest] = useState<CampusLocation | null>(null);
  const [selectedType, setSelectedType] = useState<RideType | null>(null);
  const [locationName, setLocationName] = useState("Detecting location...");
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [mapReady, setMapReady] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          const [place] = await Location.reverseGeocodeAsync(loc.coords);
          if (place) setLocationName(place.name ?? place.street ?? "Current Location");
          else setLocationName("University of Ibadan");
        } else {
          setLocationName("University of Ibadan");
        }
      } else {
        setLocationName("University of Ibadan");
      }
    })();
  }, []);

  useEffect(() => {
    if (rideStatus === "searching") setStep("searching");
    else if (rideStatus === "driver_arriving" || rideStatus === "driver_found") setStep("driver_found");
    else if (rideStatus === "in_progress") setStep("in_progress");
    else if (rideStatus === "idle" && step !== "destination" && step !== "ride_type") {
      setStep("destination");
      setSelectedDest(null);
      setSelectedType(null);
    }
  }, [rideStatus]);

  useEffect(() => {
    if (step === "searching") {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
    pulseAnim.setValue(1);
  }, [step]);

  const handleSelectDest = (loc: CampusLocation) => {
    Haptics.selectionAsync();
    setSelectedDest(loc);
    setStep("ride_type");
  };

  const handleConfirmRide = () => {
    if (!selectedDest || !selectedType) return;
    const pickup: RideLocation = { name: locationName, latitude: UI_REGION.latitude, longitude: UI_REGION.longitude };
    const dest: RideLocation = { name: selectedDest.name, latitude: selectedDest.latitude, longitude: selectedDest.longitude };
    requestRide(pickup, dest, selectedType);
  };

  const handleCancel = () => {
    cancelRide();
    setStep("destination");
    setSelectedDest(null);
    setSelectedType(null);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#003D1F", "#00A651"]}
        style={[styles.mapArea, { paddingTop: topPad }]}
      >
        <View style={styles.mapHeader}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.userName}>{user?.name?.split(" ")[0] ?? "Student"} 👋</Text>
          </View>
          <SOSButton />
        </View>

        <View style={styles.mapPlaceholder}>
          <MaterialCommunityIcons name="map-marker-path" size={60} color="#ffffff33" />
          <Text style={styles.mapText}>University of Ibadan</Text>
          <Text style={styles.mapSubText}>📍 {locationName}</Text>
        </View>
      </LinearGradient>

      <View style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: bottomPad }]}>
        {step === "destination" && (
          <>
            <View style={styles.sheetHandle}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </View>
            <Text style={[styles.sheetTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Where to?
            </Text>
            <FlatList
              data={CAMPUS_LOCATIONS}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.locationList}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelectDest(item)}
                  style={({ pressed }) => [
                    styles.locationItem,
                    { backgroundColor: pressed ? colors.muted : "transparent", borderRadius: colors.radius - 4 },
                  ]}
                >
                  <View style={[styles.locationIcon, { backgroundColor: colors.secondary }]}>
                    <Feather name="map-pin" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.locationInfo}>
                    <Text style={[styles.locationName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.locationSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {item.subtitle}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                </Pressable>
              )}
            />
          </>
        )}

        {step === "ride_type" && selectedDest && (
          <View style={styles.rideTypeContainer}>
            <View style={styles.sheetHandle}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </View>
            <View style={styles.rideTypeHeader}>
              <Pressable onPress={() => setStep("destination")}>
                <Ionicons name="chevron-back" size={22} color={colors.foreground} />
              </Pressable>
              <Text style={[styles.sheetTitle, { color: colors.foreground, fontFamily: "Inter_700Bold", flex: 1 }]}>
                Choose ride type
              </Text>
            </View>

            <View style={[styles.destCard, { backgroundColor: colors.secondary, borderRadius: colors.radius - 4 }]}>
              <Feather name="navigation" size={16} color={colors.primary} />
              <Text style={[styles.destText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
                {selectedDest.name}
              </Text>
            </View>

            <View style={styles.rideOptions}>
              <Pressable
                onPress={() => setSelectedType("normal")}
                style={[
                  styles.rideOption,
                  {
                    backgroundColor: selectedType === "normal" ? colors.primary : colors.muted,
                    borderRadius: colors.radius,
                    borderWidth: 2,
                    borderColor: selectedType === "normal" ? colors.primary : "transparent",
                  },
                ]}
              >
                <Ionicons name="people" size={26} color={selectedType === "normal" ? "#fff" : colors.mutedForeground} />
                <Text style={[styles.rideOptionTitle, { color: selectedType === "normal" ? "#fff" : colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  Normal Ride
                </Text>
                <Text style={[styles.rideOptionPrice, { color: selectedType === "normal" ? "#ffffffcc" : colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                  ₦200
                </Text>
                <Text style={[styles.rideOptionDesc, { color: selectedType === "normal" ? "#ffffff99" : colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Shared · Up to 3 riders
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setSelectedType("drop")}
                style={[
                  styles.rideOption,
                  {
                    backgroundColor: selectedType === "drop" ? colors.accent : colors.muted,
                    borderRadius: colors.radius,
                    borderWidth: 2,
                    borderColor: selectedType === "drop" ? colors.accent : "transparent",
                  },
                ]}
              >
                <MaterialCommunityIcons name="rickshaw" size={26} color={selectedType === "drop" ? colors.accentForeground : colors.mutedForeground} />
                <Text style={[styles.rideOptionTitle, { color: selectedType === "drop" ? colors.accentForeground : colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  Drop Ride
                </Text>
                <Text style={[styles.rideOptionPrice, { color: selectedType === "drop" ? "#0A0E1Acc" : colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                  ₦500
                </Text>
                <Text style={[styles.rideOptionDesc, { color: selectedType === "drop" ? "#0A0E1A88" : colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Private · Just you
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={handleConfirmRide}
              disabled={!selectedType}
              style={[
                styles.confirmBtn,
                {
                  backgroundColor: selectedType ? colors.primary : colors.muted,
                  borderRadius: colors.radius,
                  opacity: selectedType ? 1 : 0.5,
                },
              ]}
            >
              <Text style={[styles.confirmBtnText, { color: selectedType ? "#fff" : colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                Request Ride — ₦{selectedType === "drop" ? "500" : selectedType === "normal" ? "200" : "—"}
              </Text>
            </Pressable>
          </View>
        )}

        {step === "searching" && (
          <View style={styles.statusContainer}>
            <Animated.View style={[styles.pulseCircle, { backgroundColor: colors.primary + "22", transform: [{ scale: pulseAnim }] }]}>
              <View style={[styles.innerCircle, { backgroundColor: colors.primary }]}>
                <MaterialCommunityIcons name="rickshaw" size={28} color="#fff" />
              </View>
            </Animated.View>
            <Text style={[styles.statusTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Finding a driver...
            </Text>
            <Text style={[styles.statusSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Looking for nearby drivers going to{"\n"}{selectedDest?.name}
            </Text>
            <Pressable onPress={handleCancel} style={[styles.cancelBtn, { borderColor: colors.border, borderRadius: colors.radius }]}>
              <Text style={[styles.cancelText, { color: colors.destructive, fontFamily: "Inter_500Medium" }]}>Cancel Ride</Text>
            </Pressable>
          </View>
        )}

        {(step === "driver_found") && currentRide && (
          <View style={styles.driverFoundContainer}>
            <View style={[styles.driverCard, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}>
              <View style={styles.driverAvatarRow}>
                <View style={[styles.driverAvatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.driverAvatarText}>
                    {currentRide.driverName?.charAt(0) ?? "D"}
                  </Text>
                </View>
                <View style={styles.driverInfo}>
                  <Text style={[styles.driverName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                    {currentRide.driverName}
                  </Text>
                  <Text style={[styles.driverPlate, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                    {currentRide.driverPlate}
                  </Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={13} color={colors.accent} />
                    <Text style={[styles.rating, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                      {currentRide.driverRating?.toFixed(1)}
                    </Text>
                  </View>
                </View>
                <View style={styles.etaContainer}>
                  <Text style={[styles.etaNum, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                    {driverEta}
                  </Text>
                  <Text style={[styles.etaUnit, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>min away</Text>
                </View>
              </View>
            </View>

            <View style={[styles.fareRow, { backgroundColor: colors.muted, borderRadius: colors.radius - 4 }]}>
              <Ionicons name="cash-outline" size={16} color={colors.primary} />
              <Text style={[styles.fareLabel, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                Fare: <Text style={{ fontFamily: "Inter_700Bold", color: colors.primary }}>₦{currentRide.fare}</Text>
                {"  "}·{"  "}{currentRide.rideType === "drop" ? "Drop Ride" : "Normal Ride"}
              </Text>
            </View>

            <Pressable onPress={handleCancel} style={[styles.cancelBtnSm, { borderColor: colors.border, borderRadius: colors.radius - 4 }]}>
              <Text style={[styles.cancelTextSm, { color: colors.destructive, fontFamily: "Inter_500Medium" }]}>Cancel</Text>
            </Pressable>
          </View>
        )}

        {step === "in_progress" && currentRide && (
          <View style={styles.inProgressContainer}>
            <View style={[styles.inProgressBadge, { backgroundColor: colors.primary + "22", borderRadius: 30 }]}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.inProgressText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                Ride in progress
              </Text>
            </View>
            <View style={styles.inProgressRoute}>
              <Feather name="map-pin" size={14} color={colors.primary} />
              <Text style={[styles.routeText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {currentRide.pickup.name}
              </Text>
            </View>
            <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
            <View style={styles.inProgressRoute}>
              <Feather name="navigation" size={14} color={colors.destructive} />
              <Text style={[styles.routeText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {currentRide.destination.name}
              </Text>
            </View>
            <Text style={[styles.fareText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Enjoy your ride · ₦{currentRide.fare} cash on arrival
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapArea: {
    height: height * 0.42,
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  greeting: { fontSize: 14, color: "#ffffffaa", fontFamily: "Inter_400Regular" },
  userName: { fontSize: 22, color: "#fff", fontFamily: "Inter_700Bold" },
  mapPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  mapText: { fontSize: 18, color: "#ffffff88", fontFamily: "Inter_600SemiBold" },
  mapSubText: { fontSize: 13, color: "#ffffff66", fontFamily: "Inter_400Regular" },
  sheet: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
  sheetHandle: { alignItems: "center", paddingVertical: 10 },
  handle: { width: 36, height: 4, borderRadius: 2 },
  sheetTitle: { fontSize: 20, paddingHorizontal: 20, marginBottom: 8 },
  locationList: { flex: 1, paddingHorizontal: 12 },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 12,
  },
  locationIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  locationInfo: { flex: 1 },
  locationName: { fontSize: 15 },
  locationSub: { fontSize: 12, marginTop: 1 },
  rideTypeContainer: { flex: 1, paddingBottom: 8 },
  rideTypeHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  destCard: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, padding: 12, gap: 10, marginBottom: 16 },
  destText: { flex: 1, fontSize: 14 },
  rideOptions: { flexDirection: "row", gap: 12, paddingHorizontal: 16, marginBottom: 16 },
  rideOption: { flex: 1, padding: 16, alignItems: "center", gap: 4 },
  rideOptionTitle: { fontSize: 15, marginTop: 4 },
  rideOptionPrice: { fontSize: 20 },
  rideOptionDesc: { fontSize: 11, textAlign: "center" },
  confirmBtn: { marginHorizontal: 16, paddingVertical: 16, alignItems: "center" },
  confirmBtnText: { fontSize: 16 },
  statusContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 24 },
  pulseCircle: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  innerCircle: { width: 68, height: 68, borderRadius: 34, alignItems: "center", justifyContent: "center" },
  statusTitle: { fontSize: 20 },
  statusSub: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  cancelBtn: { borderWidth: 1, paddingHorizontal: 28, paddingVertical: 12, marginTop: 8 },
  cancelText: { fontSize: 15 },
  driverFoundContainer: { padding: 16, gap: 12 },
  driverCard: { padding: 14 },
  driverAvatarRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  driverAvatar: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center" },
  driverAvatarText: { fontSize: 22, color: "#fff", fontFamily: "Inter_700Bold" },
  driverInfo: { flex: 1, gap: 2 },
  driverName: { fontSize: 16 },
  driverPlate: { fontSize: 13 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  rating: { fontSize: 13 },
  etaContainer: { alignItems: "center" },
  etaNum: { fontSize: 28 },
  etaUnit: { fontSize: 11 },
  fareRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  fareLabel: { fontSize: 14 },
  cancelBtnSm: { borderWidth: 1, paddingVertical: 12, alignItems: "center" },
  cancelTextSm: { fontSize: 14 },
  inProgressContainer: { padding: 20, alignItems: "center", gap: 14 },
  inProgressBadge: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  inProgressText: { fontSize: 15 },
  inProgressRoute: { flexDirection: "row", alignItems: "center", gap: 10, alignSelf: "stretch" },
  routeLine: { width: 2, height: 20, marginLeft: 7 },
  routeText: { fontSize: 15 },
  fareText: { fontSize: 13, textAlign: "center", marginTop: 8 },
});
