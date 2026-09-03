import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SafetyZone, ServiceLocation } from '../types';
import { DEFAULT_LOCATION, isPointInsideZone } from '../lib/geoUtils';
import { realtimeStore } from '../lib/storage';
import { soundEngine } from '../lib/sound';
import { fetchNearbyEmergencyServices } from '../lib/overpass';

interface LocationContextType {
  currentLocation: { lat: number; lng: number };
  accuracy: number | null;
  activeZoneAlert: SafetyZone | null;
  activeZones: SafetyZone[];
  nearbyServices: ServiceLocation[];
  isLoadingServices: boolean;
  isSimulating: boolean;
  dismissZoneAlert: () => void;
  simulateLocation: (lat: number, lng: number, label?: string) => void;
  resetToDeviceLocation: () => void;
  refreshNearbyServices: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number }>(DEFAULT_LOCATION);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeZones, setActiveZones] = useState<SafetyZone[]>(() => realtimeStore.getSafetyZones());
  const [activeZoneAlert, setActiveZoneAlert] = useState<SafetyZone | null>(null);
  const [dismissedZoneIds, setDismissedZoneIds] = useState<Set<string>>(new Set());
  const [nearbyServices, setNearbyServices] = useState<ServiceLocation[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState<boolean>(false);

  // Load real-time safety zones
  useEffect(() => {
    const unsubscribe = realtimeStore.subscribe((event) => {
      if (event === 'ZONES_UPDATED') {
        setActiveZones(realtimeStore.getSafetyZones());
      }
    });
    return unsubscribe;
  }, []);

  // Try real device GPS initially
  useEffect(() => {
    if ('geolocation' in navigator && !isSimulating) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          if (!isSimulating) {
            setCurrentLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
            setAccuracy(pos.coords.accuracy);
          }
        },
        (err) => {
          console.warn('Geolocation notice (falling back to default city center):', err.message);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isSimulating]);

  // Evaluate Geofences whenever location or zones change
  useEffect(() => {
    const insideZones = activeZones.filter((zone) =>
      zone.is_active && isPointInsideZone(currentLocation, { lat: zone.center_lat, lng: zone.center_lng }, zone.radius_meters)
    );

    // Prioritize highest risk zone
    const hazardZone = insideZones.find((z) => z.risk_level === 'danger' || z.risk_level === 'warning') || insideZones[0];

    if (hazardZone) {
      if (!dismissedZoneIds.has(hazardZone.id)) {
        setActiveZoneAlert(hazardZone);
        if (hazardZone.risk_level === 'danger' || hazardZone.risk_level === 'warning') {
          soundEngine.playWarningTone();
        }
      }
    } else {
      setActiveZoneAlert(null);
    }
  }, [currentLocation, activeZones, dismissedZoneIds]);

  // Load nearby services
  const refreshNearbyServices = async () => {
    setIsLoadingServices(true);
    try {
      const services = await fetchNearbyEmergencyServices(currentLocation.lat, currentLocation.lng);
      setNearbyServices(services);
    } catch {
      //
    } finally {
      setIsLoadingServices(false);
    }
  };

  useEffect(() => {
    refreshNearbyServices();
  }, [currentLocation.lat, currentLocation.lng]);

  const simulateLocation = (lat: number, lng: number) => {
    setIsSimulating(true);
    setCurrentLocation({ lat, lng });
    setDismissedZoneIds(new Set()); // Reset dismissals on manual move
  };

  const resetToDeviceLocation = () => {
    setIsSimulating(false);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setAccuracy(pos.coords.accuracy);
        },
        () => {
          setCurrentLocation(DEFAULT_LOCATION);
        }
      );
    } else {
      setCurrentLocation(DEFAULT_LOCATION);
    }
  };

  const dismissZoneAlert = () => {
    if (activeZoneAlert) {
      setDismissedZoneIds((prev) => new Set(prev).add(activeZoneAlert.id));
      setActiveZoneAlert(null);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        accuracy,
        activeZoneAlert,
        activeZones,
        nearbyServices,
        isLoadingServices,
        isSimulating,
        dismissZoneAlert,
        simulateLocation,
        resetToDeviceLocation,
        refreshNearbyServices,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
