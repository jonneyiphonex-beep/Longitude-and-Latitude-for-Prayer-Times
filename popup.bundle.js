(() => {
  // node_modules/adhan/lib/esm/Madhab.js
  var Madhab = {
    Shafi: "shafi",
    Hanafi: "hanafi"
  };
  function shadowLength(madhab) {
    switch (madhab) {
      case Madhab.Shafi:
        return 1;
      case Madhab.Hanafi:
        return 2;
      default:
        throw "Invalid Madhab";
    }
  }

  // node_modules/adhan/lib/esm/HighLatitudeRule.js
  var HighLatitudeRule = {
    MiddleOfTheNight: "middleofthenight",
    SeventhOfTheNight: "seventhofthenight",
    TwilightAngle: "twilightangle",
    recommended(coordinates) {
      if (coordinates.latitude > 48) {
        return HighLatitudeRule.SeventhOfTheNight;
      } else {
        return HighLatitudeRule.MiddleOfTheNight;
      }
    }
  };
  var HighLatitudeRule_default = HighLatitudeRule;

  // node_modules/adhan/lib/esm/Coordinates.js
  var Coordinates = class {
    constructor(latitude, longitude) {
      this.latitude = latitude;
      this.longitude = longitude;
    }
  };

  // node_modules/adhan/lib/esm/Rounding.js
  var Rounding = {
    Nearest: "nearest",
    Up: "up",
    None: "none"
  };

  // node_modules/adhan/lib/esm/DateUtils.js
  function dateByAddingDays(date, days) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate() + days;
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return new Date(year, month, day, hours, minutes, seconds);
  }
  function dateByAddingMinutes(date, minutes) {
    return dateByAddingSeconds(date, minutes * 60);
  }
  function dateByAddingSeconds(date, seconds) {
    return new Date(date.getTime() + seconds * 1e3);
  }
  function roundedMinute(date, rounding = Rounding.Nearest) {
    const seconds = date.getUTCSeconds();
    let offset = seconds >= 30 ? 60 - seconds : -1 * seconds;
    if (rounding === Rounding.Up) {
      offset = 60 - seconds;
    } else if (rounding === Rounding.None) {
      offset = 0;
    }
    return dateByAddingSeconds(date, offset);
  }
  function isLeapYear(year) {
    if (year % 4 !== 0) {
      return false;
    }
    if (year % 100 === 0 && year % 400 !== 0) {
      return false;
    }
    return true;
  }
  function dayOfYear(date) {
    let returnedDayOfYear = 0;
    const feb = isLeapYear(date.getFullYear()) ? 29 : 28;
    const months = [31, feb, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    for (let i = 0; i < date.getMonth(); i++) {
      returnedDayOfYear += months[i];
    }
    returnedDayOfYear += date.getDate();
    return returnedDayOfYear;
  }
  function isValidDate(date) {
    return date instanceof Date && !isNaN(date.valueOf());
  }

  // node_modules/adhan/lib/esm/MathUtils.js
  function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }
  function radiansToDegrees(radians) {
    return radians * 180 / Math.PI;
  }
  function normalizeToScale(num, max) {
    return num - max * Math.floor(num / max);
  }
  function unwindAngle(angle) {
    return normalizeToScale(angle, 360);
  }
  function quadrantShiftAngle(angle) {
    if (angle >= -180 && angle <= 180) {
      return angle;
    }
    return angle - 360 * Math.round(angle / 360);
  }

  // node_modules/adhan/lib/esm/Shafaq.js
  var Shafaq = {
    // General is a combination of Ahmer and Abyad.
    General: "general",
    // Ahmer means the twilight is the red glow in the sky. Used by the Shafi, Maliki, and Hanbali madhabs.
    Ahmer: "ahmer",
    // Abyad means the twilight is the white glow in the sky. Used by the Hanafi madhab.
    Abyad: "abyad"
  };

  // node_modules/adhan/lib/esm/Astronomical.js
  var Astronomical = {
    /* The geometric mean longitude of the sun in degrees. */
    meanSolarLongitude(julianCentury) {
      const T = julianCentury;
      const term1 = 280.4664567;
      const term2 = 36000.76983 * T;
      const term3 = 3032e-7 * Math.pow(T, 2);
      const L0 = term1 + term2 + term3;
      return unwindAngle(L0);
    },
    /* The geometric mean longitude of the moon in degrees. */
    meanLunarLongitude(julianCentury) {
      const T = julianCentury;
      const term1 = 218.3165;
      const term2 = 481267.8813 * T;
      const Lp = term1 + term2;
      return unwindAngle(Lp);
    },
    ascendingLunarNodeLongitude(julianCentury) {
      const T = julianCentury;
      const term1 = 125.04452;
      const term2 = 1934.136261 * T;
      const term3 = 20708e-7 * Math.pow(T, 2);
      const term4 = Math.pow(T, 3) / 45e4;
      const Omega = term1 - term2 + term3 + term4;
      return unwindAngle(Omega);
    },
    /* The mean anomaly of the sun. */
    meanSolarAnomaly(julianCentury) {
      const T = julianCentury;
      const term1 = 357.52911;
      const term2 = 35999.05029 * T;
      const term3 = 1537e-7 * Math.pow(T, 2);
      const M = term1 + term2 - term3;
      return unwindAngle(M);
    },
    /* The Sun's equation of the center in degrees. */
    solarEquationOfTheCenter(julianCentury, meanAnomaly) {
      const T = julianCentury;
      const Mrad = degreesToRadians(meanAnomaly);
      const term1 = (1.914602 - 4817e-6 * T - 14e-6 * Math.pow(T, 2)) * Math.sin(Mrad);
      const term2 = (0.019993 - 101e-6 * T) * Math.sin(2 * Mrad);
      const term3 = 289e-6 * Math.sin(3 * Mrad);
      return term1 + term2 + term3;
    },
    /* The apparent longitude of the Sun, referred to the
          true equinox of the date. */
    apparentSolarLongitude(julianCentury, meanLongitude) {
      const T = julianCentury;
      const L0 = meanLongitude;
      const longitude = L0 + Astronomical.solarEquationOfTheCenter(T, Astronomical.meanSolarAnomaly(T));
      const Omega = 125.04 - 1934.136 * T;
      const Lambda = longitude - 569e-5 - 478e-5 * Math.sin(degreesToRadians(Omega));
      return unwindAngle(Lambda);
    },
    /* The mean obliquity of the ecliptic, formula
          adopted by the International Astronomical Union.
          Represented in degrees. */
    meanObliquityOfTheEcliptic(julianCentury) {
      const T = julianCentury;
      const term1 = 23.439291;
      const term2 = 0.013004167 * T;
      const term3 = 1639e-10 * Math.pow(T, 2);
      const term4 = 5036e-10 * Math.pow(T, 3);
      return term1 - term2 - term3 + term4;
    },
    /* The mean obliquity of the ecliptic, corrected for
          calculating the apparent position of the sun, in degrees. */
    apparentObliquityOfTheEcliptic(julianCentury, meanObliquityOfTheEcliptic) {
      const T = julianCentury;
      const Epsilon0 = meanObliquityOfTheEcliptic;
      const O = 125.04 - 1934.136 * T;
      return Epsilon0 + 256e-5 * Math.cos(degreesToRadians(O));
    },
    /* Mean sidereal time, the hour angle of the vernal equinox, in degrees. */
    meanSiderealTime(julianCentury) {
      const T = julianCentury;
      const JD = T * 36525 + 2451545;
      const term1 = 280.46061837;
      const term2 = 360.98564736629 * (JD - 2451545);
      const term3 = 387933e-9 * Math.pow(T, 2);
      const term4 = Math.pow(T, 3) / 3871e4;
      const Theta = term1 + term2 + term3 - term4;
      return unwindAngle(Theta);
    },
    nutationInLongitude(julianCentury, solarLongitude, lunarLongitude, ascendingNode) {
      const L0 = solarLongitude;
      const Lp = lunarLongitude;
      const Omega = ascendingNode;
      const term1 = -17.2 / 3600 * Math.sin(degreesToRadians(Omega));
      const term2 = 1.32 / 3600 * Math.sin(2 * degreesToRadians(L0));
      const term3 = 0.23 / 3600 * Math.sin(2 * degreesToRadians(Lp));
      const term4 = 0.21 / 3600 * Math.sin(2 * degreesToRadians(Omega));
      return term1 - term2 - term3 + term4;
    },
    nutationInObliquity(julianCentury, solarLongitude, lunarLongitude, ascendingNode) {
      const L0 = solarLongitude;
      const Lp = lunarLongitude;
      const Omega = ascendingNode;
      const term1 = 9.2 / 3600 * Math.cos(degreesToRadians(Omega));
      const term2 = 0.57 / 3600 * Math.cos(2 * degreesToRadians(L0));
      const term3 = 0.1 / 3600 * Math.cos(2 * degreesToRadians(Lp));
      const term4 = 0.09 / 3600 * Math.cos(2 * degreesToRadians(Omega));
      return term1 + term2 + term3 - term4;
    },
    altitudeOfCelestialBody(observerLatitude, declination, localHourAngle) {
      const Phi = observerLatitude;
      const delta = declination;
      const H = localHourAngle;
      const term1 = Math.sin(degreesToRadians(Phi)) * Math.sin(degreesToRadians(delta));
      const term2 = Math.cos(degreesToRadians(Phi)) * Math.cos(degreesToRadians(delta)) * Math.cos(degreesToRadians(H));
      return radiansToDegrees(Math.asin(term1 + term2));
    },
    approximateTransit(longitude, siderealTime, rightAscension) {
      const L = longitude;
      const Theta0 = siderealTime;
      const a2 = rightAscension;
      const Lw = L * -1;
      const m0 = normalizeToScale((a2 + Lw - Theta0) / 360, 1);
      const expectedTransit = normalizeToScale((12 - L / 15) / 24, 1);
      if (m0 - expectedTransit > 0.5) {
        return m0 - 1;
      } else if (expectedTransit - m0 > 0.5) {
        return m0 + 1;
      } else {
        return m0;
      }
    },
    /* The time at which the sun is at its highest point in the sky (in universal time) */
    correctedTransit(approximateTransit, longitude, siderealTime, rightAscension, previousRightAscension, nextRightAscension) {
      const m0 = approximateTransit;
      const L = longitude;
      const Theta0 = siderealTime;
      const a2 = rightAscension;
      const a1 = previousRightAscension;
      const a3 = nextRightAscension;
      const Lw = L * -1;
      const Theta = unwindAngle(Theta0 + 360.985647 * m0);
      const a = unwindAngle(Astronomical.interpolateAngles(a2, a1, a3, m0));
      const H = quadrantShiftAngle(Theta - Lw - a);
      const dm = H / -360;
      return (m0 + dm) * 24;
    },
    correctedHourAngle(approximateTransit, angle, coordinates, afterTransit, siderealTime, rightAscension, previousRightAscension, nextRightAscension, declination, previousDeclination, nextDeclination) {
      const m0 = approximateTransit;
      const h0 = angle;
      const Theta0 = siderealTime;
      const a2 = rightAscension;
      const a1 = previousRightAscension;
      const a3 = nextRightAscension;
      const d2 = declination;
      const d1 = previousDeclination;
      const d3 = nextDeclination;
      const Lw = coordinates.longitude * -1;
      const term1 = Math.sin(degreesToRadians(h0)) - Math.sin(degreesToRadians(coordinates.latitude)) * Math.sin(degreesToRadians(d2));
      const term2 = Math.cos(degreesToRadians(coordinates.latitude)) * Math.cos(degreesToRadians(d2));
      const H0 = radiansToDegrees(Math.acos(term1 / term2));
      const m = afterTransit ? m0 + H0 / 360 : m0 - H0 / 360;
      const Theta = unwindAngle(Theta0 + 360.985647 * m);
      const a = unwindAngle(Astronomical.interpolateAngles(a2, a1, a3, m));
      const delta = Astronomical.interpolate(d2, d1, d3, m);
      const H = Theta - Lw - a;
      const h = Astronomical.altitudeOfCelestialBody(coordinates.latitude, delta, H);
      const term3 = h - h0;
      const term4 = 360 * Math.cos(degreesToRadians(delta)) * Math.cos(degreesToRadians(coordinates.latitude)) * Math.sin(degreesToRadians(H));
      const dm = term3 / term4;
      return (m + dm) * 24;
    },
    /* Interpolation of a value given equidistant
          previous and next values and a factor
          equal to the fraction of the interpolated
          point's time over the time between values. */
    interpolate(y2, y1, y3, n) {
      const a = y2 - y1;
      const b = y3 - y2;
      const c = b - a;
      return y2 + n / 2 * (a + b + n * c);
    },
    /* Interpolation of three angles, accounting for
          angle unwinding. */
    interpolateAngles(y2, y1, y3, n) {
      const a = unwindAngle(y2 - y1);
      const b = unwindAngle(y3 - y2);
      const c = b - a;
      return y2 + n / 2 * (a + b + n * c);
    },
    /* The Julian Day for the given Gregorian date components. */
    julianDay(year, month, day, hours = 0) {
      const trunc = Math.trunc;
      const Y = trunc(month > 2 ? year : year - 1);
      const M = trunc(month > 2 ? month : month + 12);
      const D = day + hours / 24;
      const A = trunc(Y / 100);
      const B = trunc(2 - A + trunc(A / 4));
      const i0 = trunc(365.25 * (Y + 4716));
      const i1 = trunc(30.6001 * (M + 1));
      return i0 + i1 + D + B - 1524.5;
    },
    /* Julian century from the epoch. */
    julianCentury(julianDay) {
      return (julianDay - 2451545) / 36525;
    },
    seasonAdjustedMorningTwilight(latitude, dayOfYear2, year, sunrise) {
      const a = 75 + 28.65 / 55 * Math.abs(latitude);
      const b = 75 + 19.44 / 55 * Math.abs(latitude);
      const c = 75 + 32.74 / 55 * Math.abs(latitude);
      const d = 75 + 48.1 / 55 * Math.abs(latitude);
      const adjustment = (function() {
        const dyy = Astronomical.daysSinceSolstice(dayOfYear2, year, latitude);
        if (dyy < 91) {
          return a + (b - a) / 91 * dyy;
        } else if (dyy < 137) {
          return b + (c - b) / 46 * (dyy - 91);
        } else if (dyy < 183) {
          return c + (d - c) / 46 * (dyy - 137);
        } else if (dyy < 229) {
          return d + (c - d) / 46 * (dyy - 183);
        } else if (dyy < 275) {
          return c + (b - c) / 46 * (dyy - 229);
        } else {
          return b + (a - b) / 91 * (dyy - 275);
        }
      })();
      return dateByAddingSeconds(sunrise, Math.round(adjustment * -60));
    },
    seasonAdjustedEveningTwilight(latitude, dayOfYear2, year, sunset, shafaq) {
      let a, b, c, d;
      if (shafaq === Shafaq.Ahmer) {
        a = 62 + 17.4 / 55 * Math.abs(latitude);
        b = 62 - 7.16 / 55 * Math.abs(latitude);
        c = 62 + 5.12 / 55 * Math.abs(latitude);
        d = 62 + 19.44 / 55 * Math.abs(latitude);
      } else if (shafaq === Shafaq.Abyad) {
        a = 75 + 25.6 / 55 * Math.abs(latitude);
        b = 75 + 7.16 / 55 * Math.abs(latitude);
        c = 75 + 36.84 / 55 * Math.abs(latitude);
        d = 75 + 81.84 / 55 * Math.abs(latitude);
      } else {
        a = 75 + 25.6 / 55 * Math.abs(latitude);
        b = 75 + 2.05 / 55 * Math.abs(latitude);
        c = 75 - 9.21 / 55 * Math.abs(latitude);
        d = 75 + 6.14 / 55 * Math.abs(latitude);
      }
      const adjustment = (function() {
        const dyy = Astronomical.daysSinceSolstice(dayOfYear2, year, latitude);
        if (dyy < 91) {
          return a + (b - a) / 91 * dyy;
        } else if (dyy < 137) {
          return b + (c - b) / 46 * (dyy - 91);
        } else if (dyy < 183) {
          return c + (d - c) / 46 * (dyy - 137);
        } else if (dyy < 229) {
          return d + (c - d) / 46 * (dyy - 183);
        } else if (dyy < 275) {
          return c + (b - c) / 46 * (dyy - 229);
        } else {
          return b + (a - b) / 91 * (dyy - 275);
        }
      })();
      return dateByAddingSeconds(sunset, Math.round(adjustment * 60));
    },
    daysSinceSolstice(dayOfYear2, year, latitude) {
      let daysSinceSolstice;
      const northernOffset = 10;
      const southernOffset = isLeapYear(year) ? 173 : 172;
      const daysInYear = isLeapYear(year) ? 366 : 365;
      if (latitude >= 0) {
        daysSinceSolstice = dayOfYear2 + northernOffset;
        if (daysSinceSolstice >= daysInYear) {
          daysSinceSolstice = daysSinceSolstice - daysInYear;
        }
      } else {
        daysSinceSolstice = dayOfYear2 - southernOffset;
        if (daysSinceSolstice < 0) {
          daysSinceSolstice = daysSinceSolstice + daysInYear;
        }
      }
      return daysSinceSolstice;
    }
  };
  var Astronomical_default = Astronomical;

  // node_modules/adhan/lib/esm/SolarCoordinates.js
  var SolarCoordinates = class {
    constructor(julianDay) {
      const T = Astronomical_default.julianCentury(julianDay);
      const L0 = Astronomical_default.meanSolarLongitude(T);
      const Lp = Astronomical_default.meanLunarLongitude(T);
      const Omega = Astronomical_default.ascendingLunarNodeLongitude(T);
      const Lambda = degreesToRadians(Astronomical_default.apparentSolarLongitude(T, L0));
      const Theta0 = Astronomical_default.meanSiderealTime(T);
      const dPsi = Astronomical_default.nutationInLongitude(T, L0, Lp, Omega);
      const dEpsilon = Astronomical_default.nutationInObliquity(T, L0, Lp, Omega);
      const Epsilon0 = Astronomical_default.meanObliquityOfTheEcliptic(T);
      const EpsilonApparent = degreesToRadians(Astronomical_default.apparentObliquityOfTheEcliptic(T, Epsilon0));
      this.declination = radiansToDegrees(Math.asin(Math.sin(EpsilonApparent) * Math.sin(Lambda)));
      this.rightAscension = unwindAngle(radiansToDegrees(Math.atan2(Math.cos(EpsilonApparent) * Math.sin(Lambda), Math.cos(Lambda))));
      this.apparentSiderealTime = Theta0 + dPsi * 3600 * Math.cos(degreesToRadians(Epsilon0 + dEpsilon)) / 3600;
    }
  };

  // node_modules/adhan/lib/esm/SolarTime.js
  var SolarTime = class {
    constructor(date, coordinates) {
      const julianDay = Astronomical_default.julianDay(date.getFullYear(), date.getMonth() + 1, date.getDate(), 0);
      this.observer = coordinates;
      this.solar = new SolarCoordinates(julianDay);
      this.prevSolar = new SolarCoordinates(julianDay - 1);
      this.nextSolar = new SolarCoordinates(julianDay + 1);
      const m0 = Astronomical_default.approximateTransit(coordinates.longitude, this.solar.apparentSiderealTime, this.solar.rightAscension);
      const solarAltitude = -50 / 60;
      this.approxTransit = m0;
      this.transit = Astronomical_default.correctedTransit(m0, coordinates.longitude, this.solar.apparentSiderealTime, this.solar.rightAscension, this.prevSolar.rightAscension, this.nextSolar.rightAscension);
      this.sunrise = Astronomical_default.correctedHourAngle(m0, solarAltitude, coordinates, false, this.solar.apparentSiderealTime, this.solar.rightAscension, this.prevSolar.rightAscension, this.nextSolar.rightAscension, this.solar.declination, this.prevSolar.declination, this.nextSolar.declination);
      this.sunset = Astronomical_default.correctedHourAngle(m0, solarAltitude, coordinates, true, this.solar.apparentSiderealTime, this.solar.rightAscension, this.prevSolar.rightAscension, this.nextSolar.rightAscension, this.solar.declination, this.prevSolar.declination, this.nextSolar.declination);
    }
    hourAngle(angle, afterTransit) {
      return Astronomical_default.correctedHourAngle(this.approxTransit, angle, this.observer, afterTransit, this.solar.apparentSiderealTime, this.solar.rightAscension, this.prevSolar.rightAscension, this.nextSolar.rightAscension, this.solar.declination, this.prevSolar.declination, this.nextSolar.declination);
    }
    afternoon(shadowLength2) {
      const tangent = Math.abs(this.observer.latitude - this.solar.declination);
      const inverse = shadowLength2 + Math.tan(degreesToRadians(tangent));
      const angle = radiansToDegrees(Math.atan(1 / inverse));
      return this.hourAngle(angle, true);
    }
  };

  // node_modules/adhan/lib/esm/PolarCircleResolution.js
  var PolarCircleResolution = {
    AqrabBalad: "AqrabBalad",
    AqrabYaum: "AqrabYaum",
    Unresolved: "Unresolved"
  };
  var LATITUDE_VARIATION_STEP = 0.5;
  var UNSAFE_LATITUDE = 65;
  var isValidSolarTime = (solarTime) => !isNaN(solarTime.sunrise) && !isNaN(solarTime.sunset);
  var aqrabYaumResolver = (coordinates, date, daysAdded = 1, direction = 1) => {
    if (daysAdded > Math.ceil(365 / 2)) {
      return null;
    }
    const testDate = new Date(date.getTime());
    testDate.setDate(testDate.getDate() + direction * daysAdded);
    const tomorrow = dateByAddingDays(testDate, 1);
    const solarTime = new SolarTime(testDate, coordinates);
    const tomorrowSolarTime = new SolarTime(tomorrow, coordinates);
    if (!isValidSolarTime(solarTime) || !isValidSolarTime(tomorrowSolarTime)) {
      return aqrabYaumResolver(coordinates, date, daysAdded + (direction > 0 ? 0 : 1), -direction);
    }
    return {
      date,
      tomorrow,
      coordinates,
      solarTime,
      tomorrowSolarTime
    };
  };
  var aqrabBaladResolver = (coordinates, date, latitude) => {
    const solarTime = new SolarTime(date, {
      ...coordinates,
      latitude
    });
    const tomorrow = dateByAddingDays(date, 1);
    const tomorrowSolarTime = new SolarTime(tomorrow, {
      ...coordinates,
      latitude
    });
    if (!isValidSolarTime(solarTime) || !isValidSolarTime(tomorrowSolarTime)) {
      return Math.abs(latitude) >= UNSAFE_LATITUDE ? aqrabBaladResolver(coordinates, date, latitude - Math.sign(latitude) * LATITUDE_VARIATION_STEP) : null;
    }
    return {
      date,
      tomorrow,
      coordinates: new Coordinates(latitude, coordinates.longitude),
      solarTime,
      tomorrowSolarTime
    };
  };
  var polarCircleResolvedValues = (resolver, date, coordinates) => {
    const defaultReturn = {
      date,
      tomorrow: dateByAddingDays(date, 1),
      coordinates,
      solarTime: new SolarTime(date, coordinates),
      tomorrowSolarTime: new SolarTime(dateByAddingDays(date, 1), coordinates)
    };
    switch (resolver) {
      case PolarCircleResolution.AqrabYaum: {
        return aqrabYaumResolver(coordinates, date) || defaultReturn;
      }
      case PolarCircleResolution.AqrabBalad: {
        const {
          latitude
        } = coordinates;
        return aqrabBaladResolver(coordinates, date, latitude - Math.sign(latitude) * LATITUDE_VARIATION_STEP) || defaultReturn;
      }
      default: {
        return defaultReturn;
      }
    }
  };

  // node_modules/adhan/lib/esm/CalculationParameters.js
  var CalculationParameters = class {
    // Madhab to determine how Asr is calculated.
    madhab = Madhab.Shafi;
    // Rule to determine the earliest time for Fajr and latest time for Isha
    // needed for high latitude locations where Fajr and Isha may not truly exist
    // or may present a hardship unless bound to a reasonable time.
    highLatitudeRule = HighLatitudeRule_default.MiddleOfTheNight;
    // Manual adjustments (in minutes) to be added to each prayer time.
    adjustments = {
      fajr: 0,
      sunrise: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0
    };
    // Adjustments set by a calculation method. This value should not be manually modified.
    methodAdjustments = {
      fajr: 0,
      sunrise: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0
    };
    // Rule to determine how to resolve prayer times inside the Polar Circle
    // where daylight or night may persist for more than 24 hours depending
    // on the season
    polarCircleResolution = PolarCircleResolution.Unresolved;
    // How seconds are rounded when calculating prayer times
    rounding = Rounding.Nearest;
    // Used by the MoonsightingCommittee method to determine how to calculate Isha
    shafaq = Shafaq.General;
    constructor(method, fajrAngle = 0, ishaAngle = 0, ishaInterval = 0, maghribAngle = 0) {
      this.method = method;
      this.fajrAngle = fajrAngle;
      this.ishaAngle = ishaAngle;
      this.ishaInterval = ishaInterval;
      this.maghribAngle = maghribAngle;
      if (this.method === null) {
        this.method = "Other";
      }
    }
    nightPortions() {
      switch (this.highLatitudeRule) {
        case HighLatitudeRule_default.MiddleOfTheNight:
          return {
            fajr: 1 / 2,
            isha: 1 / 2
          };
        case HighLatitudeRule_default.SeventhOfTheNight:
          return {
            fajr: 1 / 7,
            isha: 1 / 7
          };
        case HighLatitudeRule_default.TwilightAngle:
          return {
            fajr: this.fajrAngle / 60,
            isha: this.ishaAngle / 60
          };
        default:
          throw `Invalid high latitude rule found when attempting to compute night portions: ${this.highLatitudeRule}`;
      }
    }
  };

  // node_modules/adhan/lib/esm/CalculationMethod.js
  var CalculationMethod = {
    // Muslim World League
    MuslimWorldLeague() {
      const params = new CalculationParameters("MuslimWorldLeague", 18, 17);
      params.methodAdjustments.dhuhr = 1;
      return params;
    },
    // Egyptian General Authority of Survey
    Egyptian() {
      const params = new CalculationParameters("Egyptian", 19.5, 17.5);
      params.methodAdjustments.dhuhr = 1;
      return params;
    },
    // University of Islamic Sciences, Karachi
    Karachi() {
      const params = new CalculationParameters("Karachi", 18, 18);
      params.methodAdjustments.dhuhr = 1;
      return params;
    },
    // Umm al-Qura University, Makkah
    UmmAlQura() {
      return new CalculationParameters("UmmAlQura", 18.5, 0, 90);
    },
    // Dubai
    Dubai() {
      const params = new CalculationParameters("Dubai", 18.2, 18.2);
      params.methodAdjustments = {
        ...params.methodAdjustments,
        sunrise: -3,
        dhuhr: 3,
        asr: 3,
        maghrib: 3
      };
      return params;
    },
    // Moonsighting Committee
    MoonsightingCommittee() {
      const params = new CalculationParameters("MoonsightingCommittee", 18, 18);
      params.methodAdjustments = {
        ...params.methodAdjustments,
        dhuhr: 5,
        maghrib: 3
      };
      return params;
    },
    // ISNA
    NorthAmerica() {
      const params = new CalculationParameters("NorthAmerica", 15, 15);
      params.methodAdjustments.dhuhr = 1;
      return params;
    },
    // Kuwait
    Kuwait() {
      return new CalculationParameters("Kuwait", 18, 17.5);
    },
    // Qatar
    Qatar() {
      return new CalculationParameters("Qatar", 18, 0, 90);
    },
    // Singapore
    Singapore() {
      const params = new CalculationParameters("Singapore", 20, 18);
      params.methodAdjustments.dhuhr = 1;
      params.rounding = Rounding.Up;
      return params;
    },
    // Institute of Geophysics, University of Tehran
    Tehran() {
      const params = new CalculationParameters("Tehran", 17.7, 14, 0, 4.5);
      return params;
    },
    // Dianet
    Turkey() {
      const params = new CalculationParameters("Turkey", 18, 17);
      params.methodAdjustments = {
        ...params.methodAdjustments,
        sunrise: -7,
        dhuhr: 5,
        asr: 4,
        maghrib: 7
      };
      return params;
    },
    // Other
    Other() {
      return new CalculationParameters("Other", 0, 0);
    }
  };
  var CalculationMethod_default = CalculationMethod;

  // node_modules/adhan/lib/esm/Prayer.js
  var Prayer = {
    Fajr: "fajr",
    Sunrise: "sunrise",
    Dhuhr: "dhuhr",
    Asr: "asr",
    Maghrib: "maghrib",
    Isha: "isha",
    None: "none"
  };
  var Prayer_default = Prayer;

  // node_modules/adhan/lib/esm/TimeComponents.js
  var TimeComponents = class {
    constructor(num) {
      this.hours = Math.floor(num);
      this.minutes = Math.floor((num - this.hours) * 60);
      this.seconds = Math.floor((num - (this.hours + this.minutes / 60)) * 60 * 60);
      return this;
    }
    utcDate(year, month, date) {
      return new Date(Date.UTC(year, month, date, this.hours, this.minutes, this.seconds));
    }
  };

  // node_modules/adhan/lib/esm/PrayerTimes.js
  var HIGH_LATITUDE_THRESHOLD = 55;
  var PrayerTimes = class {
    constructor(coordinates, date, calculationParameters) {
      this.coordinates = coordinates;
      this.date = date;
      this.calculationParameters = calculationParameters;
      let solarTime = new SolarTime(date, coordinates);
      let fajrTime;
      let sunriseTime;
      let dhuhrTime;
      let asrTime;
      let sunsetTime;
      let maghribTime;
      let ishaTime;
      let nightFraction;
      dhuhrTime = new TimeComponents(solarTime.transit).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
      sunriseTime = new TimeComponents(solarTime.sunrise).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
      sunsetTime = new TimeComponents(solarTime.sunset).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
      const tomorrow = dateByAddingDays(date, 1);
      let tomorrowSolarTime = new SolarTime(tomorrow, coordinates);
      const polarCircleResolver = calculationParameters.polarCircleResolution;
      if ((!isValidDate(sunriseTime) || !isValidDate(sunsetTime) || isNaN(tomorrowSolarTime.sunrise)) && polarCircleResolver !== PolarCircleResolution.Unresolved) {
        const resolved = polarCircleResolvedValues(polarCircleResolver, date, coordinates);
        solarTime = resolved.solarTime;
        tomorrowSolarTime = resolved.tomorrowSolarTime;
        const dateComponents = [date.getFullYear(), date.getMonth(), date.getDate()];
        dhuhrTime = new TimeComponents(solarTime.transit).utcDate(...dateComponents);
        sunriseTime = new TimeComponents(solarTime.sunrise).utcDate(...dateComponents);
        sunsetTime = new TimeComponents(solarTime.sunset).utcDate(...dateComponents);
      }
      asrTime = new TimeComponents(solarTime.afternoon(shadowLength(calculationParameters.madhab))).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
      const tomorrowSunrise = new TimeComponents(tomorrowSolarTime.sunrise).utcDate(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
      const night = (Number(tomorrowSunrise) - Number(sunsetTime)) / 1e3;
      fajrTime = new TimeComponents(solarTime.hourAngle(-1 * calculationParameters.fajrAngle, false)).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
      if (calculationParameters.method === "MoonsightingCommittee" && coordinates.latitude >= HIGH_LATITUDE_THRESHOLD) {
        nightFraction = night / 7;
        fajrTime = dateByAddingSeconds(sunriseTime, -nightFraction);
      }
      const safeFajr = (function() {
        if (calculationParameters.method === "MoonsightingCommittee") {
          return Astronomical_default.seasonAdjustedMorningTwilight(coordinates.latitude, dayOfYear(date), date.getFullYear(), sunriseTime);
        } else {
          const portion = calculationParameters.nightPortions().fajr;
          nightFraction = portion * night;
          return dateByAddingSeconds(sunriseTime, -nightFraction);
        }
      })();
      if (isNaN(fajrTime.getTime()) || safeFajr > fajrTime) {
        fajrTime = safeFajr;
      }
      if (calculationParameters.ishaInterval > 0) {
        ishaTime = dateByAddingMinutes(sunsetTime, calculationParameters.ishaInterval);
      } else {
        ishaTime = new TimeComponents(solarTime.hourAngle(-1 * calculationParameters.ishaAngle, true)).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
        if (calculationParameters.method === "MoonsightingCommittee" && coordinates.latitude >= HIGH_LATITUDE_THRESHOLD) {
          nightFraction = night / 7;
          ishaTime = dateByAddingSeconds(sunsetTime, nightFraction);
        }
        const safeIsha = (function() {
          if (calculationParameters.method === "MoonsightingCommittee") {
            return Astronomical_default.seasonAdjustedEveningTwilight(coordinates.latitude, dayOfYear(date), date.getFullYear(), sunsetTime, calculationParameters.shafaq);
          } else {
            const portion = calculationParameters.nightPortions().isha;
            nightFraction = portion * night;
            return dateByAddingSeconds(sunsetTime, nightFraction);
          }
        })();
        if (isNaN(ishaTime.getTime()) || safeIsha < ishaTime) {
          ishaTime = safeIsha;
        }
      }
      maghribTime = sunsetTime;
      if (calculationParameters.maghribAngle) {
        const angleBasedMaghrib = new TimeComponents(solarTime.hourAngle(-1 * calculationParameters.maghribAngle, true)).utcDate(date.getFullYear(), date.getMonth(), date.getDate());
        if (sunsetTime < angleBasedMaghrib && ishaTime > angleBasedMaghrib) {
          maghribTime = angleBasedMaghrib;
        }
      }
      const fajrAdjustment = (calculationParameters.adjustments.fajr || 0) + (calculationParameters.methodAdjustments.fajr || 0);
      const sunriseAdjustment = (calculationParameters.adjustments.sunrise || 0) + (calculationParameters.methodAdjustments.sunrise || 0);
      const dhuhrAdjustment = (calculationParameters.adjustments.dhuhr || 0) + (calculationParameters.methodAdjustments.dhuhr || 0);
      const asrAdjustment = (calculationParameters.adjustments.asr || 0) + (calculationParameters.methodAdjustments.asr || 0);
      const maghribAdjustment = (calculationParameters.adjustments.maghrib || 0) + (calculationParameters.methodAdjustments.maghrib || 0);
      const ishaAdjustment = (calculationParameters.adjustments.isha || 0) + (calculationParameters.methodAdjustments.isha || 0);
      this.fajr = roundedMinute(dateByAddingMinutes(fajrTime, fajrAdjustment), calculationParameters.rounding);
      this.sunrise = roundedMinute(dateByAddingMinutes(sunriseTime, sunriseAdjustment), calculationParameters.rounding);
      this.dhuhr = roundedMinute(dateByAddingMinutes(dhuhrTime, dhuhrAdjustment), calculationParameters.rounding);
      this.asr = roundedMinute(dateByAddingMinutes(asrTime, asrAdjustment), calculationParameters.rounding);
      this.sunset = roundedMinute(sunsetTime, calculationParameters.rounding);
      this.maghrib = roundedMinute(dateByAddingMinutes(maghribTime, maghribAdjustment), calculationParameters.rounding);
      this.isha = roundedMinute(dateByAddingMinutes(ishaTime, ishaAdjustment), calculationParameters.rounding);
    }
    timeForPrayer(prayer) {
      if (prayer === Prayer_default.Fajr) {
        return this.fajr;
      } else if (prayer === Prayer_default.Sunrise) {
        return this.sunrise;
      } else if (prayer === Prayer_default.Dhuhr) {
        return this.dhuhr;
      } else if (prayer === Prayer_default.Asr) {
        return this.asr;
      } else if (prayer === Prayer_default.Maghrib) {
        return this.maghrib;
      } else if (prayer === Prayer_default.Isha) {
        return this.isha;
      } else {
        return null;
      }
    }
    currentPrayer(date = /* @__PURE__ */ new Date()) {
      if (date >= this.isha) {
        return Prayer_default.Isha;
      } else if (date >= this.maghrib) {
        return Prayer_default.Maghrib;
      } else if (date >= this.asr) {
        return Prayer_default.Asr;
      } else if (date >= this.dhuhr) {
        return Prayer_default.Dhuhr;
      } else if (date >= this.sunrise) {
        return Prayer_default.Sunrise;
      } else if (date >= this.fajr) {
        return Prayer_default.Fajr;
      } else {
        return Prayer_default.None;
      }
    }
    nextPrayer(date = /* @__PURE__ */ new Date()) {
      if (date >= this.isha) {
        return Prayer_default.None;
      } else if (date >= this.maghrib) {
        return Prayer_default.Isha;
      } else if (date >= this.asr) {
        return Prayer_default.Maghrib;
      } else if (date >= this.dhuhr) {
        return Prayer_default.Asr;
      } else if (date >= this.sunrise) {
        return Prayer_default.Dhuhr;
      } else if (date >= this.fajr) {
        return Prayer_default.Sunrise;
      } else {
        return Prayer_default.Fajr;
      }
    }
  };

  // node_modules/adhan/lib/esm/Qibla.js
  function qibla(coordinates) {
    const makkah = new Coordinates(21.4225241, 39.8261818);
    const term1 = Math.sin(degreesToRadians(makkah.longitude) - degreesToRadians(coordinates.longitude));
    const term2 = Math.cos(degreesToRadians(coordinates.latitude)) * Math.tan(degreesToRadians(makkah.latitude));
    const term3 = Math.sin(degreesToRadians(coordinates.latitude)) * Math.cos(degreesToRadians(makkah.longitude) - degreesToRadians(coordinates.longitude));
    const angle = Math.atan2(term1, term2 - term3);
    return unwindAngle(radiansToDegrees(angle));
  }

  // popup.js
  var fields = {
    latitude: document.querySelector("#latitude"),
    longitude: document.querySelector("#longitude"),
    method: document.querySelector("#method"),
    madhab: document.querySelector("#madhab")
  };
  var status = document.querySelector("#status");
  var list = document.querySelector("#prayer-list");
  var empty = document.querySelector("#empty");
  var placeQuery = document.querySelector("#place-query");
  var searchButton = document.querySelector("#search-place");
  var placeResults = document.querySelector("#place-results");
  var qiblaSection = document.querySelector("#qibla");
  var qiblaBearing = document.querySelector("#qibla-bearing");
  var qiblaArrow = document.querySelector("#qibla-arrow");
  var geocodeInProgress = false;
  var methods = {
    MuslimWorldLeague: CalculationMethod_default.MuslimWorldLeague,
    UmmAlQura: CalculationMethod_default.UmmAlQura,
    Egyptian: CalculationMethod_default.Egyptian,
    Karachi: CalculationMethod_default.Karachi,
    NorthAmerica: CalculationMethod_default.NorthAmerica,
    Dubai: CalculationMethod_default.Dubai,
    Kuwait: CalculationMethod_default.Kuwait,
    Qatar: CalculationMethod_default.Qatar,
    Singapore: CalculationMethod_default.Singapore,
    Turkey: CalculationMethod_default.Turkey
  };
  document.querySelector("#today").textContent = new Intl.DateTimeFormat("ar", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(/* @__PURE__ */ new Date());
  var hijriFormatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", {
    day: "numeric",
    month: "numeric",
    year: "numeric"
  });
  var hijriDateLabel = new Intl.DateTimeFormat("ar-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  var monthNames = [
    "\u0645\u064F\u062D\u0631\u064E\u0651\u0645",
    "\u0635\u0641\u0631",
    "\u0631\u0628\u064A\u0639 \u0627\u0644\u0623\u0648\u0644",
    "\u0631\u0628\u064A\u0639 \u0627\u0644\u0622\u062E\u0631",
    "\u062C\u0645\u0627\u062F\u0649 \u0627\u0644\u0623\u0648\u0644\u0649",
    "\u062C\u0645\u0627\u062F\u0649 \u0627\u0644\u0622\u062E\u0631\u0629",
    "\u0631\u062C\u0628",
    "\u0634\u0639\u0628\u0627\u0646",
    "\u0631\u0645\u0636\u0627\u0646",
    "\u0634\u0648\u0627\u0644",
    "\u0630\u0648 \u0627\u0644\u0642\u0639\u062F\u0629",
    "\u0630\u0648 \u0627\u0644\u062D\u062C\u0629"
  ];
  var fixedEvents = {
    "1-9": "\u0628\u062F\u0627\u064A\u0629 \u0634\u0647\u0631 \u0631\u0645\u0636\u0627\u0646",
    "1-10": "\u0639\u064A\u062F \u0627\u0644\u0641\u0637\u0631",
    "9-12": "\u064A\u0648\u0645 \u0639\u0631\u0641\u0629",
    "10-12": "\u0639\u064A\u062F \u0627\u0644\u0623\u0636\u062D\u0649"
  };
  function getHijriParts(date) {
    const parts = Object.fromEntries(
      hijriFormatter.formatToParts(date).filter(({ type }) => ["day", "month", "year"].includes(type)).map(({ type, value }) => [type, Number(value)])
    );
    return parts;
  }
  function renderHijriCalendar() {
    const now = /* @__PURE__ */ new Date();
    document.querySelector("#hijri-date").textContent = hijriDateLabel.format(now);
    const events = [];
    const foundEvents = /* @__PURE__ */ new Set();
    for (let offset = 0; offset <= 370; offset += 1) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
      const { day, month } = getHijriParts(date);
      if (day === 13 && !foundEvents.has("white-days")) {
        events.push({ date, label: `\u0627\u0644\u0623\u064A\u0627\u0645 \u0627\u0644\u0628\u064A\u0636 (13\u201315 ${monthNames[month - 1]})` });
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
        String(date.getDate()).padStart(2, "0")
      ].join("-");
      value.textContent = new Intl.DateTimeFormat("ar", {
        day: "numeric",
        month: "short"
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
      status.textContent = "\u0623\u062F\u062E\u0644 \u0625\u062D\u062F\u0627\u062B\u064A\u0627\u062A \u0645\u0648\u0642\u0639\u0643 \u0644\u0639\u0631\u0636 \u0627\u0644\u0645\u0648\u0627\u0642\u064A\u062A.";
      status.classList.remove("error");
      return;
    }
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      qiblaSection.hidden = true;
      list.hidden = true;
      empty.hidden = false;
      empty.textContent = "\u062A\u062D\u0642\u0642 \u0645\u0646 \u0623\u0646 \u062E\u0637 \u0627\u0644\u0639\u0631\u0636 \u0628\u064A\u0646 -90 \u064890 \u0648\u0627\u0644\u0637\u0648\u0644 \u0628\u064A\u0646 -180 \u0648180.";
      status.textContent = "\u0627\u0644\u0625\u062D\u062F\u0627\u062B\u064A\u0627\u062A \u0627\u0644\u0645\u062F\u062E\u0644\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629.";
      status.classList.add("error");
      return;
    }
    const params = methods[fields.method.value]();
    params.madhab = fields.madhab.value === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;
    params.polarCircleResolution = PolarCircleResolution.AqrabBalad;
    const coordinates = new Coordinates(latitude, longitude);
    const qiblaDegrees = (qibla(coordinates) + 360) % 360;
    qiblaBearing.textContent = `${new Intl.NumberFormat("ar", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(qiblaDegrees)}\xB0`;
    qiblaArrow.style.transform = `translate(-50%, -50%) rotate(${qiblaDegrees}deg)`;
    qiblaSection.hidden = false;
    const prayers = new PrayerTimes(coordinates, /* @__PURE__ */ new Date(), params);
    const times = [
      ["\u0627\u0644\u0641\u062C\u0631", prayers.fajr],
      ["\u0627\u0644\u0634\u0631\u0648\u0642", prayers.sunrise, true],
      ["\u0627\u0644\u0638\u0647\u0631", prayers.dhuhr],
      ["\u0627\u0644\u0639\u0635\u0631", prayers.asr],
      ["\u0627\u0644\u0645\u063A\u0631\u0628", prayers.maghrib],
      ["\u0627\u0644\u0639\u0634\u0627\u0621", prayers.isha]
    ];
    if (times.some(([, time]) => !Number.isFinite(time.getTime()))) {
      list.hidden = true;
      empty.hidden = false;
      empty.textContent = "\u062A\u0639\u0630\u0651\u0631 \u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u0648\u0627\u0642\u064A\u062A \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u062A\u0627\u0631\u064A\u062E.";
      status.textContent = "\u062A\u0639\u0630\u0651\u0631 \u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u0648\u0627\u0642\u064A\u062A. \u062C\u0631\u0651\u0628 \u0637\u0631\u064A\u0642\u0629 \u062D\u0633\u0627\u0628 \u0623\u062E\u0631\u0649.";
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
        hour12: true
      }).format(time);
      row.append(label, value);
      return row;
    }));
    empty.hidden = true;
    list.hidden = false;
    status.textContent = `\u062E\u0637 \u0627\u0644\u0639\u0631\u0636 ${latitude.toFixed(6)}\u060C \u062E\u0637 \u0627\u0644\u0637\u0648\u0644 ${longitude.toFixed(6)}`;
    status.classList.remove("error");
    localStorage.setItem("prayer-settings", JSON.stringify({
      latitude: fields.latitude.value,
      longitude: fields.longitude.value,
      method: fields.method.value,
      madhab: fields.madhab.value
    }));
    empty.textContent = "\u0623\u062F\u062E\u0644 \u062E\u0637\u064A \u0627\u0644\u0637\u0648\u0644 \u0648\u0627\u0644\u0639\u0631\u0636 \u0644\u0628\u062F\u0621 \u0627\u0644\u062D\u0633\u0627\u0628.";
  }
  for (const field of Object.values(fields)) {
    field.addEventListener("input", renderPrayerTimes);
    field.addEventListener("change", renderPrayerTimes);
  }
  document.querySelector("#locate").addEventListener("click", () => {
    if (!navigator.geolocation) {
      status.textContent = "\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u0648\u0642\u0639 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0645\u062A\u0635\u0641\u062D.";
      status.classList.add("error");
      return;
    }
    status.textContent = "\u062C\u0627\u0631\u064D \u062A\u062D\u062F\u064A\u062F \u0645\u0648\u0642\u0639\u0643...";
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      fields.latitude.value = coords.latitude.toFixed(6);
      fields.longitude.value = coords.longitude.toFixed(6);
      renderPrayerTimes();
      renderHijriCalendar();
    }, () => {
      status.textContent = "\u062A\u0639\u0630\u0651\u0631 \u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u0648\u0642\u0639. \u0623\u062F\u062E\u0644 \u0627\u0644\u0625\u062D\u062F\u0627\u062B\u064A\u0627\u062A \u064A\u062F\u0648\u064A\u064B\u0627.";
      status.classList.add("error");
    }, { enableHighAccuracy: true, timeout: 1e4 });
  });
  document.querySelector("#place-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const query = placeQuery.value.trim();
    if (!query || geocodeInProgress) return;
    placeResults.replaceChildren();
    placeResults.hidden = true;
    const lastRequestAt = Number(localStorage.getItem("nominatim-last-request") || 0);
    if (Date.now() - lastRequestAt < 1e3) {
      status.textContent = "\u0627\u0646\u062A\u0638\u0631 \u0644\u062D\u0638\u0629 \u0642\u0628\u0644 \u0625\u062C\u0631\u0627\u0621 \u0628\u062D\u062B \u062C\u062F\u064A\u062F.";
      status.classList.remove("error");
      return;
    }
    geocodeInProgress = true;
    searchButton.disabled = true;
    status.textContent = "\u062C\u0627\u0631\u064D \u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0627\u0644\u0645\u0648\u0642\u0639...";
    status.classList.remove("error");
    localStorage.setItem("nominatim-last-request", String(Date.now()));
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.search = new URLSearchParams({
        format: "jsonv2",
        limit: "5",
        "accept-language": "ar",
        q: query
      });
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const results = await response.json();
      if (!Array.isArray(results)) throw new Error("Invalid geocoding response");
      const validResults = results.filter((result) => {
        const latitude = Number(result.lat);
        const longitude = Number(result.lon);
        return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
      });
      if (validResults.length === 0) {
        status.textContent = "\u0644\u0645 \u064A\u064F\u0639\u062B\u0631 \u0639\u0644\u0649 \u0645\u0648\u0642\u0639 \u0645\u0637\u0627\u0628\u0642. \u062C\u0631\u0651\u0628 \u0643\u062A\u0627\u0628\u0629 \u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0645\u0639 \u0627\u0633\u0645 \u0627\u0644\u062F\u0648\u0644\u0629.";
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
          status.textContent = `\u062A\u0645 \u0627\u062E\u062A\u064A\u0627\u0631: ${result.display_name || query} (OpenStreetMap)`;
          placeResults.hidden = true;
        });
        item.append(button);
        return item;
      }));
      placeResults.hidden = false;
      status.textContent = "\u0627\u062E\u062A\u0631 \u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0627\u0644\u0623\u0642\u0631\u0628 \u0625\u0644\u0649 \u0645\u0648\u0642\u0639\u0643 \u0644\u062A\u062D\u0633\u064A\u0646 \u062F\u0642\u0629 \u0627\u0644\u0645\u0648\u0627\u0642\u064A\u062A.";
      status.classList.remove("error");
    } catch {
      status.textContent = "\u062A\u0639\u0630\u0651\u0631 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u062E\u062F\u0645\u0629 \u0627\u0644\u0628\u062D\u062B. \u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A \u0648\u062D\u0627\u0648\u0644 \u0644\u0627\u062D\u0642\u064B\u0627.";
      status.classList.add("error");
    } finally {
      geocodeInProgress = false;
      searchButton.disabled = false;
    }
  });
  renderPrayerTimes();
})();
