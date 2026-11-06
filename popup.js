import {
  CalculationMethod,
  Coordinates,
  Madhab,
  PolarCircleResolution,
  PrayerTimes,
  Qibla,
} from "adhan";

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
const placeResults = document.querySelector("#place-results");
const qiblaSection = document.querySelector("#qibla");
const qiblaBearing = document.querySelector("#qibla-bearing");
const qiblaArrow = document.querySelector("#qibla-arrow");
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

const hijriFormatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
});
const hijriDateLabel = new Intl.DateTimeFormat("ar-u-ca-islamic-umalqura", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const monthNames = [
  "مُحرَّم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
  "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة",
];
const fixedEvents = {
  "1-9": "بداية شهر رمضان",
  "1-10": "عيد الفطر",
  "9-12": "يوم عرفة",
  "10-12": "عيد الأضحى",
};

function getHijriParts(date) {
  const parts = Object.fromEntries(
    hijriFormatter.formatToParts(date)
      .filter(({ type }) => ["day", "month", "year"].includes(type))
      .map(({ type, value }) => [type, Number(value)]),
  );
  return parts;
}

function renderHijriCalendar() {
  const now = new Date();
  document.querySelector("#hijri-date").textContent = hijriDateLabel.format(now);

  const events = [];
  const foundEvents = new Set();
  for (let offset = 0; offset <= 370; offset += 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const { day, month } = getHijriParts(date);
    if (day === 13 && !foundEvents.has("white-days")) {
      events.push({ date, label: `الأيام البيض (13–15 ${monthNames[month - 1]})` });
      foundEvents.add("white-days");
    }
    const eventKey = `${day}-${month}`;
    const label = fixedEvents[eventKey];
    if (label && !foundEvents.has(eventKey)) {
      events.push({ date, label });
      foundEvents.add(eventKey);
    }
  }

  const eventList = document.querySelector("#islamic-events");
  eventList.replaceChildren(...events.map(({ date, label }) => {
    const item = document.createElement("li");
    const name = document.createElement("span");
    name.textContent = label;
    const value = document.createElement("time");
    value.dateTime = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
    value.textContent = new Intl.DateTimeFormat("ar", {
      day: "numeric",
      month: "short",
    }).format(date);
    item.append(name, value);
    return item;
  }));
}

try {
  const saved = JSON.parse(localStorage.getItem("prayer-settings") || "{}");
  for (const [key, field] of Object.entries(fields)) {
    if (typeof saved[key] !== "string") continue;
    if (key === "method" && !Object.hasOwn(methods, saved[key])) continue;
    if (key === "madhab" && !["shafi", "hanafi"].includes(saved[key])) continue;
    field.value = saved[key];
  }
} catch {
  localStorage.removeItem("prayer-settings");
}

function renderPrayerTimes() {
  const latitude = Number(fields.latitude.value);
  const longitude = Number(fields.longitude.value);
  if (!fields.latitude.value || !fields.longitude.value) {
    qiblaSection.hidden = true;
    list.hidden = true;
    empty.hidden = false;
    status.textContent = "أدخل إحداثيات موقعك لعرض المواقيت.";
    status.classList.remove("error");
    return;
  }

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    qiblaSection.hidden = true;
    list.hidden = true;
    empty.hidden = false;
    empty.textContent = "تحقق من أن خط العرض بين -90 و90 والطول بين -180 و180.";
    status.textContent = "الإحداثيات المدخلة غير صالحة.";
    status.classList.add("error");
    return;
  }

  const params = methods[fields.method.value]();
  params.madhab = fields.madhab.value === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;
  params.polarCircleResolution = PolarCircleResolution.AqrabBalad;
  const coordinates = new Coordinates(latitude, longitude);
  const qiblaDegrees = (Qibla(coordinates) + 360) % 360;
  qiblaBearing.textContent = `${new Intl.NumberFormat("ar", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(qiblaDegrees)}°`;
  qiblaArrow.style.transform = `translate(-50%, -50%) rotate(${qiblaDegrees}deg)`;
  qiblaSection.hidden = false;

  const prayers = new PrayerTimes(coordinates, new Date(), params);
  const times = [
    ["الفجر", prayers.fajr],
    ["الشروق", prayers.sunrise, true],
    ["الظهر", prayers.dhuhr],
    ["العصر", prayers.asr],
    ["المغرب", prayers.maghrib],
    ["العشاء", prayers.isha],
  ];

  if (times.some(([, time]) => !Number.isFinite(time.getTime()))) {
    list.hidden = true;
    empty.hidden = false;
    empty.textContent = "تعذّر حساب المواقيت لهذا الموقع والتاريخ.";
    status.textContent = "تعذّر حساب المواقيت. جرّب طريقة حساب أخرى.";
    status.classList.add("error");
    return;
  }

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
    renderHijriCalendar();
  }, () => {
    status.textContent = "تعذّر تحديد الموقع. أدخل الإحداثيات يدويًا.";
    status.classList.add("error");
  }, { enableHighAccuracy: true, timeout: 10000 });
});

document.querySelector("#place-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = placeQuery.value.trim();
  if (!query || geocodeInProgress) return;
  placeResults.replaceChildren();
  placeResults.hidden = true;

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
      limit: "5",
      "accept-language": "ar",
      q: query,
    });
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const results = await response.json();
    if (!Array.isArray(results)) throw new Error("Invalid geocoding response");
    const validResults = results.filter((result) => {
      const latitude = Number(result.lat);
      const longitude = Number(result.lon);
      return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 &&
        Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
    });
    if (validResults.length === 0) {
      status.textContent = "لم يُعثر على موقع مطابق. جرّب كتابة المدينة مع اسم الدولة.";
      status.classList.remove("error");
      return;
    }

    placeResults.replaceChildren(...validResults.map((result) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "place-result";
      button.textContent = result.display_name || query;
      button.addEventListener("click", () => {
        fields.latitude.value = Number(result.lat).toFixed(6);
        fields.longitude.value = Number(result.lon).toFixed(6);
        renderPrayerTimes();
        status.textContent = `تم اختيار: ${result.display_name || query} (OpenStreetMap)`;
        placeResults.hidden = true;
      });
      item.append(button);
      return item;
    }));
    placeResults.hidden = false;
    status.textContent = "اختر النتيجة الأقرب إلى موقعك لتحسين دقة المواقيت.";
    status.classList.remove("error");
  } catch {
    status.textContent = "تعذّر الاتصال بخدمة البحث. تحقق من الإنترنت وحاول لاحقًا.";
    status.classList.add("error");
  } finally {
    geocodeInProgress = false;
    searchButton.disabled = false;
  }
});

renderPrayerTimes();