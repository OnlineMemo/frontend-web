import React, { useState, useEffect } from "react";
import styled from "styled-components";
import '../../App.css';
import { CheckToken } from "../../utils/CheckToken";
import Apis from "../../apis/Api";

const PageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    width: 100%;
    height: calc(var(--vh, 1vh) * 100);
    overflow: auto;

    background-color: #f4f3ee;
    font-family: "jua";
    font-size: 17px;

    h1 {
        font-size: 27px;
        color: #463f3a;
    }

    #logoutButton {
        position: fixed;
        top: 10px;
        right: 10px;
        padding: 6px 10px;
        background-color: #bcb8b1;
        border: none;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 700;
        color: #463f3a;

        &:hover {
            cursor: pointer;
            background-color: #837a72;
        }
    }
    
    &::-webkit-scrollbar {
        width: 5px;
        background-color: #f4f3ee;
        border-radius: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: #bcb8b1;
        border-radius: 4px;
    }
`;

function StatisticPage(props) {
    const [containerSize, setContainerSize] = useState(0);

    const handleLogoutClick = () => {
        localStorage.clear();  // 이때는 모두 비워주도록함.
        sessionStorage.clear();
        window.location.href = '/login';
    }

    async function getGa4CalcData() {
        await Apis
            .get(`/back-office/ga4/calc-data`, {
                params: {
                    startDatetime: "2025-08-01 15:30:00",
                    endDatetime: "2025-08-29 23:59:59"
                }
            })
            .then((response) => {
                const data = response.data.data;
                // if (Array.isArray(data)) console.log(data.slice(0, 4));
            })
            .catch((error) => {
                //console.log(error);
            })
    }

    async function getGa4Statistics() {
        await Apis
            .get(`/back-office/ga4/statistics`, {
                params: {
                    startDatetime: "2025-08-01 15:30:00",
                    endDatetime: "2025-08-29 23:59:59"
                }
            })
            .then((response) => {
                const data = response.data.data;
                // if (Array.isArray(data)) console.log(data.slice(0, 4));
            })
            .catch((error) => {
                //console.log(error);
            })
    }

    async function getUserStatistics() {
        await Apis
            .get(`/back-office/users/statistics`)
            .then((response) => {
                const data = response.data.data;
                console.log(data);
            })
            .catch((error) => {
                //console.log(error);
            })
    }

    useEffect(() => {
        CheckToken();
        // getGa4CalcData();
        // getGa4Statistics();
        // getUserStatistics();
    }, []);

    useEffect(() => {
        // 백오피스 페이지는 header, footer 렌더링 X
        const headerTag = document.querySelector("header");
        if (headerTag) headerTag.style.display = "none";
        const footerTag = document.querySelector("footer");
        if (footerTag) footerTag.style.display = "none";
        const htmlTag = document.querySelector("html");
        if (htmlTag) htmlTag.style.margin = "0px";

        const updatSize = () => {
            // 화면 세로길이 조정
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty("--vh", `${vh}px`);
            // 내부 컨테이너 사이즈 조정 (화면 가로or세로 길이의 % 크기)
            const isVerticalScreen = window.innerWidth < window.innerHeight;  // 현재 세로화면인가?
            const newContainerSize = isVerticalScreen ? window.innerWidth * 0.7 : window.innerHeight * 0.6;
            setContainerSize(newContainerSize);
        }

        updatSize();
        window.addEventListener('resize', updatSize);
        return () => {
            window.removeEventListener('resize', updatSize);
        };
    }, []);


    return (
        <PageWrapper className="backOfficePage">
            <button id="logoutButton" onClick={handleLogoutClick}>로그아웃 <i className="fa fa-sign-out" aria-hidden="true" /></button>
            <h1>[ 온라인 메모장 - Back Office ]</h1>
            <br /><br />

            <div>
                테스트 Text
            </div>
        </PageWrapper>
    );
}

export default StatisticPage;