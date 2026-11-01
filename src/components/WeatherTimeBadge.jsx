import React, { useState, useEffect } from 'react';

/**
 * WeatherTimeBadge
 * Floating neo-brutalist badge displaying real-time WIB clock and live temperature:
 * Format: "HH:mm WIB | O 22°C"
 * - Live clock synchronized with Asia/Jakarta (WIB, UTC+7)
 * - Weather fetched live from Open-Meteo API (Karanganyar, Central Java) with wttr.in fallback
 */
export default function WeatherTimeBadge() {
  const [timeStr, setTimeStr] = useState(() => {
    return new Date().toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  });

  const [temp, setTemp] = useState(24);

  // Live Clock (Asia/Jakarta - WIB)
  useEffect(() => {
    const updateTime = () => {
      setTimeStr(
        new Date().toLocaleTimeString('en-GB', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Weather API Fetch (Open-Meteo with fallback)
  useEffect(() => {
    let isMounted = true;
    const LAT = -7.5966; // Karanganyar, Central Java
    const LON = 110.9515;

    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code&timezone=Asia%2FJakarta`
        );
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.current && typeof data.current.temperature_2m === 'number') {
            setTemp(Math.round(data.current.temperature_2m));
            return;
          }
        }
      } catch (err) {
        // Fallback silently to secondary source or retain current
      }

      try {
        const res2 = await fetch('https://wttr.in/Karanganyar?format=j1');
        if (res2.ok) {
          const data2 = await res2.json();
          const currentTemp = data2?.current_condition?.[0]?.temp_C;
          if (isMounted && currentTemp) {
            setTemp(Math.round(parseFloat(currentTemp)));
          }
        }
      } catch (_) {}
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000); // refresh every 10 min
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="absolute bottom-6 left-2 sm:-left-3 md:-left-6 bg-white text-on-surface px-3 sm:px-4 py-2 sm:py-2.5 border-3 sm:border-4 border-on-surface brick-shadow flex items-center gap-2 sm:gap-2.5 font-mono font-bold text-[12px] sm:text-[14px] animate-float-badge-2 hover:scale-105 transition-transform duration-200 cursor-default z-30 select-none tracking-wide"
      title={`Zona Waktu: WIB (Asia/Jakarta) • Suhu: ${temp}°C (Karanganyar, Jawa Tengah)`}
    >
      {/* Top 3 Lego Studs */}
      <div className="absolute -top-2 left-0 w-full flex justify-around px-2 pointer-events-none">
        <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white border-2 border-on-surface" />
        <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white border-2 border-on-surface" />
        <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white border-2 border-on-surface" />
      </div>

      {/* Time Display */}
      <span className="tabular-nums font-bold text-on-surface">
        {timeStr} WIB
      </span>

      {/* Divider */}
      <span className="font-black text-on-surface text-[14px] sm:text-[16px] leading-none select-none">
        |
      </span>

      {/* Weather Indicator Circle */}
      <span
        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 sm:border-[2.5px] border-on-surface bg-[#c8cdd3] inline-block flex-shrink-0"
        aria-hidden="true"
      />

      {/* Temperature Display */}
      <span className="tabular-nums font-bold text-on-surface">
        {temp !== null ? temp : '--'}°C
      </span>
    </div>
  );
}

