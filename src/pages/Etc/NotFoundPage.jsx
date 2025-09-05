import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import '../../App.css';
import { Link, useNavigate } from "react-router-dom";
import BasicWrapper from "../../components/Styled/BasicWrapper";
import { ParseToken } from "../../utils/ParseToken";

const MoreWrapper = styled(BasicWrapper)`
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    position: relative;
    min-height: 150px;

    .fa-arrow-left {
        font-size: 2rem;
        color: #463f3a;

        border: solid 2.3px;
        border-radius: 6px;
        padding: 1px 6.7px;

        position: absolute;
        top: 11.5px;
        left: 16px;
        z-index: 10;

        &:hover {
            cursor:pointer;
            background-color: #463f3a;
            color: #bcb8b1;
            border-color: #463f3a;
        }
    }
`;

const DivWrapper = styled.div`
    /* display: flex;
    justify-content: center; */
    text-align: center;

    font-size: 1.8rem;
    color: #322d2a;

    line-height: 130%;

    h5 {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        /* font-size: 2.1rem; */
        font-size: 2.4rem;
        margin: 0px;
        text-align: center;
    }

    strong {
        /* font-size: 1.78rem; */
        font-size: 1.8rem;
    }

    button {
        background-color: #463f3a;
        color: white;
        border-radius: 5px;
        font-family: "jua";
        font-size: 1.5rem;

        padding: 1px 6px 1px 6px;
        border-top: 2px solid #767676;
        border-left: 2px solid #767676;
        border-bottom: 2px solid #212121;
        border-right: 2px solid #212121;

        &:hover {
            cursor:pointer;
            background-color: #2c2927;
        }
    }

    .fa-exclamation-circle {
        font-size: 4rem;
        color: red;
    }
`;

function NotFoundPage(props) {
    const navigate = useNavigate();
    const contentRef = useRef(null);
    const { isLoggedIn, isAdminUser } = ParseToken();

    const getHeightWithMargin = (elementName) => {
        const element = document.querySelector(elementName);
        if (!element) return 0;
        const style = getComputedStyle(element);

        const elementHeight = element.getBoundingClientRect().height || 0;
        const elementMarginTop = parseFloat(style.marginTop) || 0;
        const elementMarginBottom = parseFloat(style.marginBottom) || 0;
        return elementHeight + elementMarginTop + elementMarginBottom;
    }

    useEffect(() => {
        const updateContentHeight = () => {
            const headerHeight = getHeightWithMargin("header");
            const navHeight = getHeightWithMargin("nav");
            const footerHeight = getHeightWithMargin("footer");

            const usedHeight = headerHeight + navHeight + footerHeight;
            const contentPaddingHeight = 12 * 2;
            const restHeight = window.innerHeight - usedHeight - contentPaddingHeight - 15;

            if (contentRef.current) {
                contentRef.current.style.height = `${restHeight}px`;
            }
        };
        updateContentHeight();
        window.addEventListener("resize", updateContentHeight);
        
        return () => {
            window.removeEventListener("resize", updateContentHeight);
        };
    }, []);

    return (
        (isAdminUser === false) &&
            <MoreWrapper ref={contentRef}>
                {/* <i className="fa fa-arrow-left" aria-hidden="true" onClick={() => { navigate(-1) }}></i> */}
                <i className="fa fa-arrow-left" aria-hidden="true" onClick={() => navigate(isLoggedIn === true ? "/memos" : "/")}></i>
                <DivWrapper className="flex-container">
                    <div style={{ lineHeight: "140%" }}><br></br></div>

                    <i className="fa fa-exclamation-circle" aria-hidden="true"></i>
                    <div style={{ lineHeight: "30%" }}><br></br></div>
                    <h5>&lt;&nbsp;404 ERROR&nbsp;&gt;</h5>
                    <div style={{ lineHeight: "66%" }}><br></br></div>
                    <strong>페이지를 찾을 수 없습니다.</strong><br></br>
                    <div style={{ lineHeight: "12%" }}><br></br></div>
                    <span>
                        입력하신 주소가 잘못되었거나,<br></br>
                        새롭게 변경되었을 수 있습니다.
                    </span>
                    <div style={{ lineHeight: "51%" }}><br></br></div>
                    {/* <Link to={isLoggedIn === true ? "/memos" : "/"}><button>홈으로 이동</button></Link> */}
                    <button onClick={() => navigate(isLoggedIn === true ? "/memos" : "/")}>홈으로 이동</button>

                    <br></br><br></br>
                    <div style={{ lineHeight: "140%" }}><br></br></div>
                </DivWrapper>
            </MoreWrapper>
    );
}

export default NotFoundPage;