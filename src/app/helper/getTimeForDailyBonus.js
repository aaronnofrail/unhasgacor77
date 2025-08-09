function getNextEligibleISOFromBonus(nextEligibleAtISO) {
  if (!nextEligibleAtISO) return null;
  const t = new Date(nextEligibleAtISO);
  return isNaN(t.getTime()) ? null : t.toISOString();
}

function formatNextEligibleLabel(nextISO, locale) {
  if (!nextISO) return "";
  const loc = locale || "id-ID";

  const now = new Date();
  const target = new Date(nextISO);
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "";

  // < 1 jam -> "xx menit lagi"
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.ceil(diff / (60 * 1000));
    return minutes + " menit lagi";
  }

  // Cek besok vs bukan besok
  const dNow = new Date(now);
  dNow.setHours(0, 0, 0, 0);
  const dTarget = new Date(target);
  dTarget.setHours(0, 0, 0, 0);
  const dayDiff = Math.round((dTarget.getTime() - dNow.getTime()) / 86400000);

  const timeStr = target.toLocaleTimeString(loc, {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (dayDiff === 1) {
    return "Bisa klaim lagi besok pukul " + timeStr;
  }

  const dateStr = target.toLocaleDateString(loc, {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return dateStr + " pukul " + timeStr;
}

export { getNextEligibleISOFromBonus, formatNextEligibleLabel };
