import * as Location from "expo-location";

const API_KEY = "e0a99716236dab38b9c664116f8ed59e";

export async function getWeather(language = "en") {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return { error: "Location permission denied" };
    }

    const loc = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = loc.coords;

    // OpenWeatherMap uses "ne" for Nepali in its lang parameter
    const owmLang = language === "ne" ? "ne" : "en";

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=${owmLang}&appid=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return { error: "Weather unavailable" };
    const data = await res.json();

    const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
    const geoRes = await fetch(geoUrl);
    const geo = geoRes.ok ? await geoRes.json() : null;

    let placeName = geo?.[0]?.name || data.name;
    placeName = placeName
      .replace(/ Metropolitan City$/i, "")
      .replace(/ Sub-Metropolitan City$/i, "")
      .replace(/ Municipality$/i, "")
      .replace(/ Rural Municipality$/i, "");

    const fUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&lang=${owmLang}&appid=${API_KEY}`;
    const fRes = await fetch(fUrl);
    const fData = fRes.ok ? await fRes.json() : null;

    let rainSoon = false;
    if (fData?.list) {
      rainSoon = fData.list
        .slice(0, 3)
        .some((x) =>
          ["Rain", "Drizzle", "Thunderstorm"].includes(x.weather[0].main),
        );
    }

    const condition = data.weather[0].main;

    return {
      city: placeName,
      temp: Math.round(data.main.temp),
      condition,
      description: data.weather[0].description,
      isRaining: ["Rain", "Drizzle", "Thunderstorm"].includes(condition),
      rainSoon,
      humidity: data.main.humidity,
    };
  } catch {
    return { error: "Weather unavailable" };
  }
}
