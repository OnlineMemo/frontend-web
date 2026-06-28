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

const excludeLocalStorageKeys = new Set(['isTest', 'noticeProgressState', 'noticeCompleteState', 'maxAIUsageDate']);
const excludeSessionStorageKeys = new Set(['alert', 'memoContent']);
const protectedLocalStorageKeys = new Set(['pinnedMemoIds', 'unsavedMemos']);
const protectedSessionStorageKeys = new Set([]);
const clearToken = (isAllclear = false) => {
    const localKeepKeys = (isAllclear === false)
        ? excludeLocalStorageKeys.union(protectedLocalStorageKeys)
        : protectedLocalStorageKeys;
    const sessionKeepKeys = (isAllclear === false)
        ? excludeSessionStorageKeys.union(protectedSessionStorageKeys)
        : protectedSessionStorageKeys;

    for (const key of Object.keys(localStorage)) {
        if (!localKeepKeys.has(key)) {
            localStorage.removeItem(key);
        }
    }
    for (const key of Object.keys(sessionStorage)) {
        if (!sessionKeepKeys.has(key)) {
            sessionStorage.removeItem(key);
        }
    }
}

export { checkToken, parseToken, clearToken };