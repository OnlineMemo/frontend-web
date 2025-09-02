import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import '../../App.css';
import { CheckToken } from "../../utils/CheckToken";
import Apis from "../../apis/Api";
import { Grid } from "gridjs";
import "gridjs/dist/theme/mermaid.css";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const PageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    width: 100%;
    height: calc(100vh - 12px - 23px);  // 100vh - paddingTop - paddingBottom
    padding-top: 12px;
    padding-bottom: 23px;
    overflow: auto;

    background-color: #f4f3ee;
    font-family: "jua";
    font-size: 15px;

    h1 {
        margin-top: 12px;
        margin-bottom: 14px;
        font-size: 27px;
        color: #463f3a;
    }

    #dateContainer {
        position: fixed;
        top: 10.5px;
        right: 100px;
        padding: 6px 10px;
        background-color: gray;
        border: none;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 700;
        color: #463f3a;
        z-index: 998;

        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        height: 16px;
    }

    #logoutButton {
        position: fixed;
        top: 10.5px;
        right: 10.5px;
        padding: 6px 10px;
        background-color: #bcb8b1;
        border: none;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 700;
        color: #463f3a;
        z-index: 998;

        &:hover {
            cursor: pointer;
            background-color: #837a72;
        }
    }

    .gridjs-footer {
        padding: 9px 19px !important;
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

const TitleContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    #userContainer {
        position: absolute;
        right: -180px;
        padding: 6px 10px;
        background-color: gray;
        border: none;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 700;
        color: #463f3a;

        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }
`;

function StatisticPage(props) {
    const [ga4GridCols, setGa4GridCols] = useState(null);
    const ga4GridRef = useRef(null);

    const handleLogoutClick = () => {
        confirmAlert({
            title: '로그아웃 확인',
            message: '정말 로그아웃 하시겠습니까?',
            buttons: [
            {
                label: '예',
                onClick: () => {
                    localStorage.clear();  // 이때는 모두 비워주도록함.
                    sessionStorage.clear();
                    window.location.href = '/login';
                }
            },
            {
                label: '아니오',
                onClick: () => {}
            }
            ]
        });
    };

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
                const columnKeys = [
                    ['순위', (_, index) => index + 1],
                    ['페이지 경로', item => item.pagePath],
                    ['실사용자 수', item => item.uniqueUserCount],
                    ['로그인 사용자 수', item => item.loginUserCount],
                    ['활성 사용자 수', item => item.activeUserCount],
                    ['조회수', item => item.pageViewCount],
                    ['미인증 접근 차단', item => item.unauthBlockedCount],
                ];
                const columns = Object.fromEntries(
                    columnKeys.map(([key, fn]) => [key, data.map(fn)])
                );
                setGa4GridCols(columns);
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
        getGa4Statistics();
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
    }, []);

    useEffect(() => {
        if (ga4GridCols && ga4GridRef.current) {
            ga4GridRef.current.innerHTML = "";
            
            new Grid({
                columns: Object.keys(ga4GridCols),
                data: ga4GridCols['순위'].map((_, i) =>
                    Object.keys(ga4GridCols).map(key => ga4GridCols[key][i])
                ),
                pagination: {
                    enabled: true,
                    limit: 8,
                    summary: false
                },
                search: false,
                // sort: true,
                style: {
                    table: {
                        borderCollapse: 'collapse',
                        width: '100%',
                        border: '1px solid #ccc',
                    },
                    th: {
                        padding: '11px 13px 11px 19.5px',
                        backgroundColor: '#f0f0f0',
                        border: '1px solid #ccc',    
                        color: '#444',
                        fontWeight: '600',
                        // textAlign: 'center',
                    },
                    tr: {
                        backgroundColor: '#fff',
                    },
                    td: {
                        padding: '11px 13px 11px 19.5px',
                        border: '1px solid #ccc',
                        color: '#333',
                        // textAlign: 'center',
                    }
                },
            }).render(ga4GridRef.current);
        }
    }, [ga4GridCols]);


    return (
        <PageWrapper>
            <TitleContainer>
                <h1>[ 온라인 메모장 - Back Office ]</h1>
                <div id="userContainer"> {/* !!! 차후 모바일버전에 가로스크롤 생기는것 꼭 막기 !!! */}
                    <div>가입자수위치1</div>
                    &nbsp;
                    <div>가입자수위치2</div>
                </div>
            </TitleContainer>

            <br />

            <div style={{ backgroundColor: 'gray', marginLeft: '4px', width: '76%', height: '500px' }}>그래프위치</div>
            <div ref={ga4GridRef} style={{ width: "76%" }} />

            <button id="logoutButton" onClick={handleLogoutClick}>
                로그아웃 <i className="fa fa-sign-out" aria-hidden="true" />
            </button>
            <div id="dateContainer">
                <div>날짜위치1</div>
                &nbsp;
                <div>날짜위치2</div>
            </div>
        </PageWrapper>
    );
}

export default StatisticPage;