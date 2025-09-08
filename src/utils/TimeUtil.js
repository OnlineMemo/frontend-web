// getKSTDate("2025-08-01", "00:00:00")
// -> new Date(Fri Aug 01 2025 00:00:00 GMT+0900 (한국 표준시))
const getKSTDate = (dateStr, timeStr) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const [hh, mm, ss] = timeStr.split(":").map(Number);
    return new Date(Date.UTC(y, m - 1, d, hh, mm, ss) - 9 * 60 * 60 * 1000);
};

const getKSTDateFromLocal = (date) => {
    return new Date(date.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
};

export { getKSTDate, getKSTDateFromLocal };