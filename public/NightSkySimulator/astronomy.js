export const KOLKATA = {
  lat: 22.5726,
  lon: 88.3639
};

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

export function julianDate(date) {
  const time = date.getTime();
  return time / 86400000 + 2440587.5;
}

function gmstFromJulian(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0)
    + 0.000387933 * T * T - (T * T * T) / 38710000;
  gmst = ((gmst % 360) + 360) % 360;
  return gmst;
}

export function localSiderealTime(date, lonDeg) {
  const jd = julianDate(date);
  const gmst = gmstFromJulian(jd);
  return ((gmst + lonDeg) % 360 + 360) % 360;
}

export function raDecToAltAz(raDeg, decDeg, date, latDeg, lonDeg) {
  const lst = localSiderealTime(date, lonDeg);
  const ha = ((lst - raDeg + 360) % 360) * DEG2RAD;
  const lat = latDeg * DEG2RAD;
  const dec = decDeg * DEG2RAD;

  const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(ha);
  const alt = Math.asin(sinAlt);

  const cosAz = (Math.sin(dec) - Math.sin(alt) * Math.sin(lat)) / (Math.cos(alt) * Math.cos(lat));
  let az = Math.acos(Math.min(1, Math.max(-1, cosAz)));

  if (Math.sin(ha) > 0) {
    az = 2 * Math.PI - az;
  }

  return {
    altDeg: alt * RAD2DEG,
    azDeg: az * RAD2DEG
  };
}

export function altAzToVector(altDeg, azDeg) {
  const alt = altDeg * DEG2RAD;
  const az = azDeg * DEG2RAD;
  const x = Math.cos(alt) * Math.sin(az);
  const y = Math.sin(alt);
  const z = Math.cos(alt) * Math.cos(az);
  return { x, y, z };
}

export function formatLocalTime(date) {
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}
