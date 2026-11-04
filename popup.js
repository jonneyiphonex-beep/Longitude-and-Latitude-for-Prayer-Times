import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from "adhan";

const fields = {
  latitude: document.querySelector("#latitude"),
  longitude: document.querySelector("#longitude"),
  method: document.querySelector("#method"),
  madhab: document.querySelector("#madhab"),
};
const status = document.querySelector("#status");
const list = document.querySelector("#prayer-list");
const empty = document.querySelector("#empty");
const placeQuery = document.querySelector("#place-query");
const searchButton = document.querySelector("#search-place");
let geocodeInProgress = false;

const methods = {
  MuslimWorldLeague: CalculationMethod.MuslimWorldLeague,
  UmmAlQura: CalculationMethod.UmmAlQura,
  Egyptian: CalculationMethod.Egyptian,
  Karachi: CalculationMethod.Karachi,
  NorthAmerica: CalculationMethod.NorthAmerica,
  Dubai: CalculationMethod.Dubai,
  Kuwait: CalculationMethod.Kuwait,
  Qatar: CalculationMethod.Qatar,
  Singapore: CalculationMethod.Singapore,
  Turkey: CalculationMethod.Turkey,
};

document.querySelector("#today").textContent = new Intl.DateTimeFormat("ar", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date());

try {
  const saved = JSON.parse(localStorage.getItem("prayer-settings") || "{}");
  for (const [key, field] of Object.entries(fields)) {
    if (saved[key] !== undefined) field.value = saved[key];
  }
} catch {
  localStorage.removeItem("prayer-settings");
}

function renderPrayerTimes() {
  const latitude = Number(fields.latitude.value);
  const longitude = Number(fields.longitude.value);
  if (!fields.latitude.value || !fields.longitude.value) {
    list.hidden = true;
    empty.hidden = false;
    status.textContent = "أدخل إحداثيات موقعك لعرض المواقيت.";
    status.classList.remove("error");
    return;
  }

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    list.hidden = true;
    empty.hidden = false;
    empty.textContent = "تحقق من أن خط العرض بين -90 و90 والطول بين -180 و180.";
    status.textContent = "الإحداثيات المدخلة غير صالحة.";
    status.classList.add("error");
    return;
  }

  const params = methods[fields.method.value]();
  params.madhab = fields.madhab.value === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;
  const prayers = new PrayerTimes(new Coordinates(latitude, longitude), new Date(), params);
  const times = [
    ["الفجر", prayers.fajr],
    ["الشروق", prayers.sunrise, true],
    ["الظهر", prayers.dhuhr],
    ["العصر", prayers.asr],
    ["المغرب", prayers.maghrib],
    ["العشاء", prayers.isha],
  ];

  list.replaceChildren(...times.map(([name, time, isSunrise]) => {
    const row = document.createElement("li");
    row.className = `prayer-row${isSunrise ? " sunrise" : ""}`;
    const label = document.createElement("span");
    label.textContent = name;
    const value = document.createElement("time");
    value.dateTime = time.toISOString();
    value.textContent = new Intl.DateTimeFormat("ar", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(time);
    row.append(label, value);
    return row;
  }));

  empty.hidden = true;
  list.hidden = false;
  status.textContent = `خط العرض ${latitude.toFixed(6)}، خط الطول ${longitude.toFixed(6)}`;
  status.classList.remove("error");
  localStorage.setItem("prayer-settings", JSON.stringify({
    latitude: fields.latitude.value,
    longitude: fields.longitude.value,
    method: fields.method.value,
    madhab: fields.madhab.value,
  }));
  empty.textContent = "أدخل خطي الطول والعرض لبدء الحساب.";
}

for (const field of Object.values(fields)) {
  field.addEventListener("input", renderPrayerTimes);
  field.addEventListener("change", renderPrayerTimes);
}

document.querySelector("#locate").addEventListener("click", () => {
  if (!navigator.geolocation) {
    status.textContent = "تحديد الموقع غير متاح في هذا المتصفح.";
    status.classList.add("error");
    return;
  }
  status.textContent = "جارٍ تحديد موقعك...";
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    fields.latitude.value = coords.latitude.toFixed(6);
    fields.longitude.value = coords.longitude.toFixed(6);
    renderPrayerTimes();
  }, () => {
    status.textContent = "تعذّر تحديد الموقع. أدخل الإحداثيات يدويًا.";
    status.classList.add("error");
  }, { enableHighAccuracy: true, timeout: 10000 });
});

document.querySelector("#place-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = placeQuery.value.trim();
  if (!query || geocodeInProgress) return;

  const lastRequestAt = Number(localStorage.getItem("nominatim-last-request") || 0);
  if (Date.now() - lastRequestAt < 1000) {
    status.textContent = "انتظر لحظة قبل إجراء بحث جديد.";
    status.classList.remove("error");
    return;
  }

  geocodeInProgress = true;
  searchButton.disabled = true;
  status.textContent = "جارٍ البحث عن الموقع...";
  status.classList.remove("error");
  localStorage.setItem("nominatim-last-request", String(Date.now()));

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.search = new URLSearchParams({
      format: "jsonv2",
      limit: "1",
      "accept-language": "ar",
      q: query,
    });
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const results = await response.json();
    const result = results[0];
    const latitude = Number(result?.lat);
    const longitude = Number(result?.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
        latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      status.textContent = "لم يُعثر على موقع مطابق. جرّب كتابة المدينة مع اسم الدولة.";
      status.classList.remove("error");
      return;
    }

    fields.latitude.value = latitude.toFixed(6);
    fields.longitude.value = longitude.toFixed(6);
    renderPrayerTimes();
    status.textContent = `تم تحديد: ${result.display_name || query} (OpenStreetMap)`;
  } catch {
    status.textContent = "تعذّر الاتصال بخدمة البحث. تحقق من الإنترنت وحاول لاحقًا.";
    status.classList.add("error");
  } finally {
    geocodeInProgress = false;
    searchButton.disabled = false;
  }
});

renderPrayerTimes();