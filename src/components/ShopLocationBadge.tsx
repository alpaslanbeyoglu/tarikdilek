import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Car,
  Footprints,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  calculateDistanceKm,
  formatDistance,
  estimateTravelTime,
  getGoogleMapsDirectionsUrl,
  getAppleMapsDirectionsUrl,
  getDirectionsUrl,
  SHOP_COORDINATES,
} from '../utils/location';

interface ShopLocationBadgeProps {
  compact?: boolean;
}

export const ShopLocationBadge: React.FC<ShopLocationBadgeProps> = ({ compact = false }) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Request user location automatically on mount or when requested
  const detectLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationError('Cihazınız konum servisini desteklemiyor.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setUserLocation({ lat: userLat, lng: userLng });
        const dist = calculateDistanceKm(userLat, userLng);
        setDistanceKm(dist);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Konum izni verilmedi. Yine de haritada yol tarifi alabilirsiniz.');
        } else {
          setLocationError('Mesafe hesaplanamadı.');
        }
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  };

  useEffect(() => {
    // Attempt non-blocking location detection
    detectLocation();
  }, []);

  const estimates = distanceKm !== null ? estimateTravelTime(distanceKm) : null;
  const directionsUrl = getDirectionsUrl(userLocation?.lat, userLocation?.lng);
  const googleMapsUrl = getGoogleMapsDirectionsUrl(userLocation?.lat, userLocation?.lng);
  const appleMapsUrl = getAppleMapsDirectionsUrl(userLocation?.lat, userLocation?.lng);

  if (compact) {
    return (
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition-colors"
        title="Yol Tarifi Al (Haritalar)"
      >
        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="truncate">{SHOP_COORDINATES.address}</span>
        {distanceKm !== null && (
          <span className="font-mono text-amber-400 font-semibold shrink-0">
            · {formatDistance(distanceKm)}
          </span>
        )}
        <Navigation className="w-3 h-3 text-amber-400 shrink-0 ml-0.5" />
      </a>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl backdrop-blur relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Address Info */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>Salon Konumu</span>
            </span>

            {/* Distance Pill if available */}
            {distanceKm !== null ? (
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                <Compass className="w-3 h-3 text-emerald-400 animate-spin-slow" />
                <span>Size {formatDistance(distanceKm)} mesafede</span>
              </span>
            ) : isLocating ? (
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Mesafe hesaplanıyor...
              </span>
            ) : (
              <button
                onClick={detectLocation}
                className="text-[11px] text-amber-400/90 hover:text-amber-300 underline font-medium"
              >
                Mesafemi Hesapla
              </button>
            )}
          </div>

          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>{SHOP_COORDINATES.address}</span>
          </h3>

          <p className="text-xs text-slate-400">
            Göktürk merkezde, kolay otopark ve merkezi ulaşım lokasyonunda
          </p>

          {/* Travel time estimates if distance detected */}
          {estimates && (
            <div className="flex items-center gap-3 pt-1 text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-1 text-amber-300">
                <Car className="w-3.5 h-3.5" />
                <span>~{estimates.driveMinutes} dk sürüş</span>
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Footprints className="w-3.5 h-3.5" />
                <span>~{estimates.walkMinutes} dk yürüyüş</span>
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons: Direct Directions & Map App Selection */}
        <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/10 whitespace-nowrap"
          >
            <Navigation className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Yol Tarifi Al</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>

          <div className="flex items-center gap-1.5 text-[11px]">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-950/70 border border-slate-800 transition-colors"
            >
              Google Harita
            </a>
            <a
              href={appleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-950/70 border border-slate-800 transition-colors"
            >
              Apple Harita
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
