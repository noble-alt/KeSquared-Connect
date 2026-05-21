import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { CAMPUS_LOCATIONS, MOCK_DRIVERS } from "@/constants/locations";

export type RideType = "normal" | "drop";
export type RideStatus =
  | "idle"
  | "searching"
  | "driver_found"
  | "driver_arriving"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface RideLocation {
  name: string;
  latitude: number;
  longitude: number;
}

export interface RideRecord {
  id: string;
  pickup: RideLocation;
  destination: RideLocation;
  rideType: RideType;
  fare: number;
  status: RideStatus;
  timestamp: number;
  studentId?: string;
  driverName?: string;
  driverPlate?: string;
  driverRating?: number;
  studentName?: string;
  studentPhone?: string;
  earning?: number;
  passengerCount?: number;
  passengers?: Array<{ name: string; phone: string }>;
}

export interface DriverEarnings {
  today: number;
  week: number;
  total: number;
  tripsToday: number;
}

interface RideContextType {
  currentRide: RideRecord | null;
  rideStatus: RideStatus;
  driverAvailable: boolean;
  pendingRequest: RideRecord | null;
  driverEta: number;
  requestRide: (pickup: RideLocation, destination: RideLocation, type: RideType, studentId?: string) => void;
  cancelRide: () => void;
  acceptRequest: () => void;
  rejectRequest: () => void;
  completeRide: (driverId: string) => Promise<void>;
  setDriverAvailable: (available: boolean) => void;
  getRideHistory: (userId: string) => Promise<RideRecord[]>;
  getDriverHistory: (driverId: string) => Promise<RideRecord[]>;
  getDriverEarnings: (driverId: string) => Promise<DriverEarnings>;
}

const RideContext = createContext<RideContextType | null>(null);

const RIDE_HISTORY_KEY = "@campusdrop:rideHistory";
const DRIVER_HISTORY_KEY = "@campusdrop:driverHistory";
const DRIVER_AVAILABLE_KEY = "@campusdrop:driverAvailable";
const DRIVER_EARNINGS_KEY = "@campusdrop:driverEarnings";
const USER_KEY = "@campusdrop:currentUser";
const USERS_KEY = "@campusdrop:users";

const STUDENT_NAMES = ["Adaeze Obi", "Chukwudi Eze", "Fatima Bello", "Kehinde Adeyemi", "Ngozi Okonkwo", "Taiwo Badmus"];
const STUDENT_PHONES = ["08012345678", "08098765432", "08145678901", "08067891234", "08056789012", "08034567890"];

export function RideProvider({ children }: { children: React.ReactNode }) {
  const [currentRide, setCurrentRide] = useState<RideRecord | null>(null);
  const [rideStatus, setRideStatus] = useState<RideStatus>("idle");
  const [driverAvailable, setDriverAvailableState] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<RideRecord | null>(null);
  const [driverEta, setDriverEta] = useState(0);

  const etaIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const requestTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoCompleteRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(DRIVER_AVAILABLE_KEY).then((val) => {
      if (val) setDriverAvailableState(val === "true");
    });
    return () => {
      if (etaIntervalRef.current) clearInterval(etaIntervalRef.current);
      if (requestTimerRef.current) clearTimeout(requestTimerRef.current);
      if (autoCompleteRef.current) clearTimeout(autoCompleteRef.current);
    };
  }, []);

  const setDriverAvailable = useCallback((available: boolean) => {
    setDriverAvailableState(available);
    AsyncStorage.setItem(DRIVER_AVAILABLE_KEY, String(available));
    if (!available) setPendingRequest(null);
  }, []);

  // Simulate incoming ride requests for drivers
  useEffect(() => {
    if (!driverAvailable || currentRide) return;
    const delay = 6000 + Math.random() * 6000;
    requestTimerRef.current = setTimeout(() => {
      if (pendingRequest) return;
      const locs = CAMPUS_LOCATIONS;
      const pickupIdx = Math.floor(Math.random() * locs.length);
      let destIdx = Math.floor(Math.random() * locs.length);
      if (destIdx === pickupIdx) destIdx = (destIdx + 1) % locs.length;
      const type: RideType = Math.random() > 0.4 ? "normal" : "drop";

      // For normal rides, 35% chance it's a group ride (2–3 passengers)
      const isGroup = type === "normal" && Math.random() < 0.35;
      const passengerCount = isGroup ? (Math.random() < 0.55 ? 2 : 3) : 1;

      // Pick unique student names for each passenger
      const usedIndices = new Set<number>();
      const passengers: Array<{ name: string; phone: string }> = [];
      while (passengers.length < passengerCount) {
        const idx = Math.floor(Math.random() * STUDENT_NAMES.length);
        if (!usedIndices.has(idx)) {
          usedIndices.add(idx);
          passengers.push({ name: STUDENT_NAMES[idx], phone: STUDENT_PHONES[idx] });
        }
      }

      const farePerPax = type === "normal" ? 200 : 500;
      const req: RideRecord = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        pickup: locs[pickupIdx],
        destination: locs[destIdx],
        rideType: type,
        fare: farePerPax * passengerCount,
        status: "searching",
        timestamp: Date.now(),
        studentName: passengers[0].name,
        studentPhone: passengers[0].phone,
        passengerCount,
        passengers,
      };
      setPendingRequest(req);
    }, delay);
    return () => { if (requestTimerRef.current) clearTimeout(requestTimerRef.current); };
  }, [driverAvailable, currentRide, pendingRequest]);

  // Auto-complete student ride after ~40s in_progress — save to history & update totalRides
  useEffect(() => {
    if (rideStatus !== "in_progress" || !currentRide) return;
    const rideSnapshot = currentRide;

    autoCompleteRef.current = setTimeout(async () => {
      const completed: RideRecord = { ...rideSnapshot, status: "completed" };

      if (rideSnapshot.studentId) {
        const histKey = `${RIDE_HISTORY_KEY}:${rideSnapshot.studentId}`;
        const stored = await AsyncStorage.getItem(histKey);
        const hist: RideRecord[] = stored ? JSON.parse(stored) : [];
        await AsyncStorage.setItem(histKey, JSON.stringify([completed, ...hist]));

        // Increment student's totalRides in AsyncStorage
        const userStored = await AsyncStorage.getItem(USER_KEY);
        if (userStored) {
          const userData = JSON.parse(userStored);
          if (userData.id === rideSnapshot.studentId) {
            const updatedUser = { ...userData, totalRides: (userData.totalRides ?? 0) + 1 };
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
          }
        }
        const usersStored = await AsyncStorage.getItem(USERS_KEY);
        if (usersStored) {
          const users: Array<{ id: string; totalRides: number }> = JSON.parse(usersStored);
          const idx = users.findIndex((u) => u.id === rideSnapshot.studentId);
          if (idx !== -1) {
            users[idx].totalRides = (users[idx].totalRides ?? 0) + 1;
            await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
          }
        }
      }

      setCurrentRide(null);
      setRideStatus("idle");
      setDriverEta(0);
    }, 40000);

    return () => { if (autoCompleteRef.current) clearTimeout(autoCompleteRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rideStatus]);

  const requestRide = useCallback((
    pickup: RideLocation,
    destination: RideLocation,
    type: RideType,
    studentId?: string,
  ) => {
    if (etaIntervalRef.current) clearInterval(etaIntervalRef.current);
    const driver = MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)];
    const ride: RideRecord = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      pickup,
      destination,
      rideType: type,
      fare: type === "normal" ? 200 : 500,
      status: "searching",
      timestamp: Date.now(),
      studentId,
    };
    setCurrentRide(ride);
    setRideStatus("searching");

    setTimeout(() => {
      const etaMinutes = Math.floor(Math.random() * 4) + 2;
      const withDriver: RideRecord = {
        ...ride,
        status: "driver_arriving",
        driverName: driver.name,
        driverPlate: driver.plate,
        driverRating: driver.rating,
      };
      setCurrentRide(withDriver);
      setRideStatus("driver_arriving");
      setDriverEta(etaMinutes);

      let eta = etaMinutes * 60;
      etaIntervalRef.current = setInterval(() => {
        eta -= 5;
        setDriverEta(Math.max(0, Math.ceil(eta / 60)));
        if (eta <= 0) {
          if (etaIntervalRef.current) clearInterval(etaIntervalRef.current);
          setCurrentRide((prev) => prev ? { ...prev, status: "in_progress" } : prev);
          setRideStatus("in_progress");
        }
      }, 5000);
    }, 3500);
  }, []);

  const cancelRide = useCallback(() => {
    if (etaIntervalRef.current) clearInterval(etaIntervalRef.current);
    if (autoCompleteRef.current) clearTimeout(autoCompleteRef.current);
    setCurrentRide(null);
    setRideStatus("idle");
    setDriverEta(0);
  }, []);

  const acceptRequest = useCallback(() => {
    if (!pendingRequest) return;
    setCurrentRide({ ...pendingRequest, status: "driver_arriving" });
    setRideStatus("driver_arriving");
    setPendingRequest(null);
  }, [pendingRequest]);

  const rejectRequest = useCallback(() => {
    setPendingRequest(null);
  }, []);

  const completeRide = useCallback(async (driverId: string) => {
    if (!currentRide) return;
    const commission = currentRide.rideType === "normal" ? 20 : 50;
    const earning = currentRide.fare - commission;
    const completed: RideRecord = { ...currentRide, status: "completed", earning };

    // Save to driver trip history
    const histKey = `${DRIVER_HISTORY_KEY}:${driverId}`;
    const stored = await AsyncStorage.getItem(histKey);
    const hist: RideRecord[] = stored ? JSON.parse(stored) : [];
    await AsyncStorage.setItem(histKey, JSON.stringify([completed, ...hist]));

    // Update driver earnings
    const earnKey = `${DRIVER_EARNINGS_KEY}:${driverId}`;
    const earnStored = await AsyncStorage.getItem(earnKey);
    const earn: DriverEarnings = earnStored
      ? JSON.parse(earnStored)
      : { today: 0, week: 0, total: 0, tripsToday: 0 };
    const updatedEarn: DriverEarnings = {
      today: earn.today + earning,
      week: earn.week + earning,
      total: earn.total + earning,
      tripsToday: earn.tripsToday + 1,
    };
    await AsyncStorage.setItem(earnKey, JSON.stringify(updatedEarn));

    // Update driver's totalRides
    const userStored = await AsyncStorage.getItem(USER_KEY);
    if (userStored) {
      const userData = JSON.parse(userStored);
      if (userData.id === driverId) {
        const updatedUser = { ...userData, totalRides: (userData.totalRides ?? 0) + 1 };
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      }
    }
    const usersStored = await AsyncStorage.getItem(USERS_KEY);
    if (usersStored) {
      const users: Array<{ id: string; totalRides: number }> = JSON.parse(usersStored);
      const idx = users.findIndex((u) => u.id === driverId);
      if (idx !== -1) {
        users[idx].totalRides = (users[idx].totalRides ?? 0) + 1;
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
    }

    setCurrentRide(null);
    setRideStatus("idle");
    setDriverEta(0);
  }, [currentRide]);

  const getRideHistory = useCallback(async (userId: string) => {
    const stored = await AsyncStorage.getItem(`${RIDE_HISTORY_KEY}:${userId}`);
    return stored ? (JSON.parse(stored) as RideRecord[]) : [];
  }, []);

  const getDriverHistory = useCallback(async (driverId: string) => {
    const stored = await AsyncStorage.getItem(`${DRIVER_HISTORY_KEY}:${driverId}`);
    return stored ? (JSON.parse(stored) as RideRecord[]) : [];
  }, []);

  const getDriverEarnings = useCallback(async (driverId: string) => {
    const stored = await AsyncStorage.getItem(`${DRIVER_EARNINGS_KEY}:${driverId}`);
    return stored
      ? (JSON.parse(stored) as DriverEarnings)
      : { today: 0, week: 0, total: 0, tripsToday: 0 };
  }, []);

  return (
    <RideContext.Provider
      value={{
        currentRide,
        rideStatus,
        driverAvailable,
        pendingRequest,
        driverEta,
        requestRide,
        cancelRide,
        acceptRequest,
        rejectRequest,
        completeRide,
        setDriverAvailable,
        getRideHistory,
        getDriverHistory,
        getDriverEarnings,
      }}
    >
      {children}
    </RideContext.Provider>
  );
}

export function useRide() {
  const ctx = useContext(RideContext);
  if (!ctx) throw new Error("useRide must be used within RideProvider");
  return ctx;
}
