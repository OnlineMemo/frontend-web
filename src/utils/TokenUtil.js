import { jwtDecode } from "jwt-decode";

const checkToken = () => {
    // const isLoggedIn = !!(localStorage.getItem("accessToken") && localStorage.getItem("refreshToken"));
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (!storedAccessToken || !storedRefreshToken) {
        window.location.href = "/login";
    }
};

const parseToken = (accessToken, refreshToken) => {
    const parseResult = { decodedId: null, decodedRole: null, isLoggedIn: false, isAdminUser: false };

    const storedAccessToken = accessToken || localStorage.getItem("accessToken");
    const storedRefreshToken = refreshToken || localStorage.getItem("refreshToken");
    if (!storedAccessToken || !storedRefreshToken) {
        return parseResult;
    }

    try {
        // const { sub: decodedId, auth: decodedRole } = jwtDecode(storedAccessToken);
        const decoded = jwtDecode(storedAccessToken);
        const decodedId = decoded.sub;  // 로그인 사용자의 id
        const decodedRole = decoded.auth;  // 로그인 사용자의 권한

        if (decodedId && decodedRole) {
            parseResult.decodedId = decodedId;
            parseResult.decodedRole = decodedRole;
            parseResult.isLoggedIn = true;
            parseResult.isAdminUser = (decodedRole === "ROLE_ADMIN");
        }
        return parseResult;
    } catch (error) {
         return parseResult;
    }
};

const excludeLocalStorageKeys = new Set(['isTest', 'noticeProgressState', 'noticeCompleteState', 'isMaxDailyAIUsage']);
const excludeSessionStorageKeys = new Set(['alert']);
const clearToken = (isAllclear = false) => {
    if (isAllclear === false) {
        for (const key of Object.keys(localStorage)) {
            if (!excludeLocalStorageKeys.has(key)) {
                localStorage.removeItem(key);
            }
        }
        for (const key of Object.keys(sessionStorage)) {
            if (!excludeSessionStorageKeys.has(key)) {
                sessionStorage.removeItem(key);
            }
        }
    }
    else {
        localStorage.clear();
        sessionStorage.clear();
    }
}

export { checkToken, parseToken, clearToken };