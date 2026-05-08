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
  driverName?: string;
  driverPlate?: string;
  driverRating?: number;
  studentName?: string;
  studentPhone?: string;
  earning?: number;
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
  requestRide: (pickup: RideLocation, destination: RideLocation, type: RideType) => void;
  cancelRide: () => void;
  acceptRequest: () => void;
  rejectRequest: () => void;
  completeRide: (userId: string) => Promise<void>;
  setDriverAvailable: (available: boolean) => void;
  getRideHistory: (userId: string) => Promise<RideRecord[]>;
  getDriverHistory: (driverId: string) => Promise<RideRecord[]>;
  getDriverEarnings: (driverId: string) => Promise<DriverEarnings>;
}

const RideContext = createContext<RideContextType | null>(null);

const RIDE_HISTORY_KEY = "@ke2connect:rideHistory";
const DRIVER_HISTORY_KEY = "@ke2connect:driverHistory";
const DRIVER_AVAILABLE_KEY = "@ke2connect:driverAvailable";
const DRIVER_EARNINGS_KEY = "@ke2connect:driverEarnings";

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

  useEffect(() => {
    AsyncStorage.getItem(DRIVER_AVAILABLE_KEY).then((val) => {
      if (val) setDriverAvailableState(val === "true");
    });
    return () => {
      if (etaIntervalRef.current) clearInterval(etaIntervalRef.current);
      if (requestTimerRef.current) clearTimeout(requestTimerRef.current);
    };
  }, []);

  const setDriverAvailable = useCallback((available: boolean) => {
    setDriverAvailableState(available);
    AsyncStorage.setItem(DRIVER_AVAILABLE_KEY, String(available));
    if (!available) setPendingRequest(null);
  }, []);

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
      const sIdx = Math.floor(Math.random() * STUDENT_NAMES.length);
      const req: RideRecord = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        pickup: locs[pickupIdx],
        destination: locs[destIdx],
        rideType: type,
        fare: type === "normal" ? 200 : 500,
        status: "searching",
        timestamp: Date.now(),
        studentName: STUDENT_NAMES[sIdx],
        studentPhone: STUDENT_PHONES[sIdx],
      };
      setPendingRequest(req);
    }, delay);
    return () => { if (requestTimerRef.current) clearTimeout(requestTimerRef.current); };
  }, [driverAvailable, currentRide, pendingRequest]);

  const requestRide = useCallback((pickup: RideLocation, destination: RideLocation, type: RideType) => {
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
    };
    setCurrentRide(ride);
    setRideStatus("searching");

    setTimeout(() => {
      const etaMinutes = Math.floor(Math.random() * 4) + 2;
      const updated: RideRecord = {
        ...ride,
        status: "driver_arriving",
        driverName: driver.name,
        driverPlate: driver.plate,
        driverRating: driver.rating,
      };
      setCurrentRide(updated);
      setRideStatus("driver_arriving");
      setDriverEta(etaMinutes);

      let eta = etaMinutes * 60;
      etaIntervalRef.current = setInterval(() => {
        eta -= 5;
        setDriverEta(Math.max(0, Math.ceil(eta / 60)));
        if (eta <= 0) {
          if (etaIntervalRef.current) clearInterval(etaIntervalRef.current);
          setRideStatus("in_progress");
          setCurrentRide((prev) => prev ? { ...prev, status: "in_progress" } : prev);
        }
      }, 5000);
    }, 3500);
  }, []);

  const cancelRide = useCallback(() => {
    if (etaIntervalRef.current) clearInterval(etaIntervalRef.current);
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

    const histKey = `${DRIVER_HISTORY_KEY}:${driverId}`;
    const stored = await AsyncStorage.getItem(histKey);
    const hist: RideRecord[] = stored ? JSON.parse(stored) : [];
    await AsyncStorage.setItem(histKey, JSON.stringify([completed, ...hist]));

    const earnKey = `${DRIVER_EARNINGS_KEY}:${driverId}`;
    const earnStored = await AsyncStorage.getItem(earnKey);
    const earn: DriverEarnings = earnStored ? JSON.parse(earnStored) : { today: 0, week: 0, total: 0, tripsToday: 0 };
    const updatedEarn: DriverEarnings = {
      today: earn.today + earning,
      week: earn.week + earning,
      total: earn.total + earning,
      tripsToday: earn.tripsToday + 1,
    };
    await AsyncStorage.setItem(earnKey, JSON.stringify(updatedEarn));
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
    return stored ? (JSON.parse(stored) as DriverEarnings) : { today: 0, week: 0, total: 0, tripsToday: 0 };
  }, []);

  return (
    <RideContext.Provider
      value={{
        currentRide, rideStatus, driverAvailable, pendingRequest, driverEta,
        requestRide, cancelRide, acceptRequest, rejectRequest, completeRide,
        setDriverAvailable, getRideHistory, getDriverHistory, getDriverEarnings,
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
