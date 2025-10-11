import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";

const HeaderContainer = styled.header`
    font-family: "KOTRAHOPE";  // HeaderFont
    color: #463f3a;
    text-align: center;

    font-size: 3rem;
    margin: 9px 0px;

    @media(min-width: 1365px) {
        font-size: 3.3rem;
        margin: 18px 0px;
    }
`;

const LittleTitle = styled.div`
    font-size: 1.25rem;

    @media(min-width: 1365px) {
        font-size: 1.7rem;
    }
`;

function Header(props) {
    const location = useLocation();
    const pathName = location?.pathname || "/";
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // hydration 오류(#418, #423) 해결 : 서버와 클라이언트의 렌더링 출력이 일치하도록 함.
        if (!location?.pathname) return;
        const isHasTokens = !!(localStorage.getItem("accessToken") && localStorage.getItem("refreshToken"));
        setIsLoggedIn(isHasTokens);
    }, [location?.pathname]);

  return (
        <HeaderContainer>
            <Link
                id="mainTitleLink"
                to={
                    isLoggedIn === true
                    ? "/memos"
                    : (pathName === "/" || pathName === "/login")
                        ? pathName
                        : "/"
                }
                onClick={() => {
                    ["filter", "search", "scroll"].forEach(key => sessionStorage.removeItem(key));
                }}
                style={{ textDecoration: "none", color: "#463f3a" }}
            >
                온라인 메모장 <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
                <LittleTitle>OnlineMemo.kr</LittleTitle>
            </Link>
        </HeaderContainer>
  );
}

export default Header;