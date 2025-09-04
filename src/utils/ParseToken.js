import { jwtDecode } from "jwt-decode";

function ParseToken(accessToken, refreshToken) {
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
}

export { ParseToken };