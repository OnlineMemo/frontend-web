import axios from 'axios'

function CheckToken() {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if(!storedAccessToken || !storedRefreshToken) {
        window.location.href = "/login";
    }
}

export { CheckToken };