// ex) getKSTDate("2025-08-01", "00:00:00") -> new Date(Fri Aug 01 2025 00:00:00 GMT+0900 (한국 표준시))
const getKSTDate = (dateStr, timeStr) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const [hh, mm, ss] = timeStr.split(":").map(Number);
    return new Date(Date.UTC(y, m - 1, d, hh, mm, ss) - 9 * 60 * 60 * 1000);
};

const getKSTDateFromLocal = (date) => {
    return new Date(date.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
};

// ex) new Date(Fri Aug 01 2025 00:00:00 GMT+0900 (한국 표준시)) -> "2025-08-01"
const getDateStr = (date) => {
    const kstDate = getKSTDateFromLocal(date);  // 한국 시각 기준
    const dateStr = `${kstDate.getFullYear()}-${String(kstDate.getMonth()+1).padStart(2,'0')}-${String(kstDate.getDate()).padStart(2,'0')}`;
    return dateStr;
}

// ex-1) "2025-06-26 00:00" -> "2025-06-26T00:00:00+09:00" (한국 시각 기준으로 2025.06.26 00시)
// ex-2) "2025-06-26 00:00:27" -> "2025-06-26T00:00:27+09:00" (한국 시각 기준으로 2025.06.26 00시27초)
const getFullDatetimeStr = (dateTimeStr) => {
    let [datePart, timePart] = dateTimeStr.split(' ');
    if (timePart.split(':').length === 2) {  // 초가 없으면 추가
        timePart += ':00';
    }
    const fullDatetimeStr = `${datePart}T${timePart}+09:00`;
    return fullDatetimeStr;
}

const getRelativeTimeStr = (fromTime) => {
    const diffMin = Math.floor((Date.now() - fromTime) / (1000 * 60));
    if (diffMin < 1)  return "방금 전";
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}시간 전`;
    return `${Math.floor(diffHour / 24)}일 전`;
};

export { getKSTDate, getKSTDateFromLocal, getDateStr, getFullDatetimeStr, getRelativeTimeStr };