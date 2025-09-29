import React, { useState, useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import '../../App.css';
import { checkToken, clearToken } from "../../utils/TokenUtil"
import { getKSTDate, getKSTDateFromLocal } from "../../utils/TimeUtil"
import Apis from "../../apis/Api";
import Highcharts from "highcharts";  // Line Graph
import HighchartsReact from "highcharts-react-official";
import { Grid } from "gridjs";  // Grid
import "gridjs/dist/theme/mermaid.css";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';  // 버전 5
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

    @media(max-width: 650px) {
        zoom: 50%;
        overflow: visible;
    }

    h1 {
        margin-top: 12px;
        margin-bottom: 14px;
        font-size: 27px;
        color: #463f3a;
    }

    /* #customContainer {
        position: fixed;
        top: 10.5px;
        right: 100px;
        padding: 6px 10px;
        background-color: #c4b8b2;
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
    } */

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

    // Grid CSS
    .gridjs-footer {
        padding: 9px 19px !important;
    }

    // DatePicker CSS
    .react-datepicker {
        top: 22px;
        right: 2.6px;  // 6px

        @media(max-width: 650px) {
            top: 20.5px;
            right: 35.5px;
        }
    }
    .react-datepicker__triangle {
        display: none;
    }
    .react-datepicker__day,
    .react-datepicker__day-name {
        @media(max-width: 650px) {
            font-size: 9px;
        }

        &:hover {
            background-color: #886b62a1 !important;
        }
    }
    .react-datepicker__day--keyboard-selected,
    .react-datepicker__day--in-range {
        background-color: #463f3a !important;
        color: white !important;
    }
    .react-datepicker__day--in-selecting-range {
        background-color: #886b62a1 !important;
        color: white !important;
    }
    
    // Scroll CSS
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
        right: -185px;
        padding: 5px 9px;
        background-color: #c3c3c3aa;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        color: #463f3a;

        display: flex;
        justify-content: center;
        align-items: center;

        @media(max-width: 650px) {
            right: -142px;
            flex-direction: column;
        }

        .hideMobile {
            @media(max-width: 650px) {
                display: none;
            }
        }
    }
`;

const DateContainer = styled.div`
    position: absolute;
    top: 7.5px;
    right: 11px;

    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    z-index: 999;
`;

const CustomDatePicker = styled(DatePicker)`
    width: 135.69px;
    padding-top: 2px;
    padding-left: 5.5px;
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: #463f3a;

    background: linear-gradient(145deg, #f4f3eeaa, #e0ded7aa);
    box-shadow: 2px 2px 4px #c0bcb6, -2px -2px 4px #ffffff;
    transition: all 0.13s ease-in-out;
    border: 1px solid #bcb8b1;
    border-radius: 3px;
    cursor: pointer;
    caret-color: transparent;

    @media(max-width: 650px) {
        // 모바일 iOS 화면 자동확대 방지
        width: calc(135.69px / 0.53);
        height: 22.4px;
        padding-top: 2px;
        padding-right: 0px;
        padding-bottom: 2px;
        font-size: 16px;  // 8.5px
        transform: scale(0.53); 
        transform-origin: top right;
    }

    &:hover {
        background: linear-gradient(145deg, #f4f3ee, #e0ded7);
        box-shadow: 2px 2px 6px #c0bcb6, -2px -2px 6px #ffffff;
    }

    &:focus {
        box-shadow: 0 0 5px rgba(131, 122, 114, 0.6);
        outline: none;
        border-color: #837a72;
    }
`;


function StatisticPage(props) {
    const [prevDateRange, setPrevDateRange] = useState([
        getKSTDate("2025-08-01", "00:00:00"),
        getKSTDate("2025-08-31", "00:00:00"),
    ]);
    const [prevStartDate, prevEndDate] = prevDateRange;
    const [dateRange, setDateRange] = useState([
        getKSTDate("2025-08-01", "00:00:00"),
        getKSTDate("2025-08-31", "00:00:00"),
    ]);
    const [startDate, endDate] = dateRange;

    const [signupUserCnt, setSignupUserCnt] = useState(0);  // User
    const [withdrawnUserCnt, setWithdrawnUserCnt] = useState(0);
    const [ga4LineCols, setGa4LineCols] = useState(null);  // Line Graph
    const [ga4GridCols, setGa4GridCols] = useState(null);  // Grid
    const [ga4GridRender, setGa4GridRender] = useState(0);
    const ga4GridRef = useRef(null);

    const handleLogoutClick = () => {
        confirmAlert({
            title: '로그아웃 확인',
            message: '정말 로그아웃 하시겠습니까?',
            buttons: [
                {
                    label: '예',
                    onClick: () => {
                        clearToken();
                        window.location.href = '/login';
                    }
                },
                {
                    label: '아니오',
                    onClick: () => {}
                }
            ],
            // closeOnEscape: false,  // ESC로 닫기 방지
            // closeOnClickOutside: false,  // 모달 외부 클릭 방지
        });
    };

    const getMaxDate = () => {
        const kstDate = getKSTDateFromLocal(new Date());  // 현재 시각
        const hour = kstDate.getHours();
        const minute = kstDate.getMinutes();

        if (hour > 15 || (hour === 15 && minute >= 1)) {  // 오후 3시 이후라면 (데이터 정제 스케줄링 15시)
            kstDate.setDate(kstDate.getDate() - 1);
        }
        else {
            kstDate.setDate(kstDate.getDate() - 2);
        }
        return kstDate;
    }

    const getRequestDatetimeStr = (date, timeStr) => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
        const datetimeStr = `${dateStr} ${timeStr}`;
        return datetimeStr;
    }

    const getPrintDateStr = () => {
        const startDateStr = (!startDate) ? '미선택' : `${String(startDate.getFullYear()).slice(2, 4)}.${String(startDate.getMonth() + 1).padStart(2, "0")}.${String(startDate.getDate()).padStart(2, "0")}`;
        const endDateStr = (!endDate) ? '미선택' : `${String(endDate.getFullYear()).slice(2, 4)}.${String(endDate.getMonth() + 1).padStart(2, "0")}.${String(endDate.getDate()).padStart(2, "0")}`;
        const printDateStr = `${startDateStr} ~ ${endDateStr}  📆`;  // 또는 🔻 사용할것.
        return printDateStr;
    }


    // ============ < Call API & Calculate > ============ //

    async function getUserStatistics() {
        await Apis
            .get(`/back-office/users/statistics`)
            .then((response) => {
                const data = response.data.data;
                setSignupUserCnt(data.signupUserCount);
                setWithdrawnUserCnt(data.withdrawnUserCount);
            })
            .catch((error) => {
                //console.log(error);
            })
    }

    async function getGa4CalcData() {
        const startDatetime = getRequestDatetimeStr(startDate, "00:00:00");
        const endDatetime = getRequestDatetimeStr(endDate, "23:59:59");

        await Apis
            .get(`/back-office/ga4/calc-data`, {
                params: {
                    startDatetime: startDatetime,
                    endDatetime: endDatetime
                }
            })
            .then((response) => {
                const data = response.data.data;  // 이미 날짜시각 오름차순으로 정렬되어옴.
                const dateInfoMap = new Map();
                const loginUserIdMap = new Map();
                const userPseudoIdMap = new Map();
                const pageViewCountMap = new Map();
                const pseudoIdWithLoginMap = new Map();  // 로그인한 사용자들의 pseudoId (실사용자 수 집계 시, 활성 사용자 중복 제거용)
                const pseudoIdWithNoLoginMap = new Map();  // 로그인하지 않은 사용자들의 pseudoId

                data.forEach(item => {
                    const eventDatetime = item.eventDatetime;  // ex) "2025-08-01T16:41:25.398"
                    const key = eventDatetime.slice(0, 10);  // "2025-08-01"
                    const [year, month, day] = key.split("-");

                    if (!dateInfoMap.has(key)) {
                        dateInfoMap.set(key, {
                            year,
                            month,
                            day,
                            yearSuffix: year.slice(2, 4),
                        });
                        loginUserIdMap.set(key, new Set());
                        userPseudoIdMap.set(key, new Set());
                        pageViewCountMap.set(key, 0);
                        pseudoIdWithLoginMap.set(key, new Set());
                        pseudoIdWithNoLoginMap.set(key, new Set());
                    }
                    
                    const loginUserId = item.loginUserId;
                    const userPseudoId = item.userPseudoId;
                    if (loginUserId > 0) {
                        loginUserIdMap.get(key).add(loginUserId);
                        pseudoIdWithLoginMap.get(key).add(userPseudoId);
                    }
                    userPseudoIdMap.get(key).add(userPseudoId);
                    pageViewCountMap.set(key, pageViewCountMap.get(key) + 1);
                });

                data.forEach(item => {
                    const eventDatetime = item.eventDatetime;  // ex) "2025-08-01T16:41:25.398"
                    const key = eventDatetime.slice(0, 10);  // "2025-08-01"

                    const loginUserId = item.loginUserId;
                    const userPseudoId = item.userPseudoId;
                    if (loginUserId === 0 && !pseudoIdWithLoginMap.get(key).has(userPseudoId)) {
                        pseudoIdWithNoLoginMap.get(key).add(userPseudoId);
                    }
                });

                const calcReult = [];
                for (const key of dateInfoMap.keys()) {
                    const dateInfo = dateInfoMap.get(key);
                    const loginUserCount = loginUserIdMap.get(key).size;
                    const activeUserCount = userPseudoIdMap.get(key).size;
                    const uniqueUserCount = pseudoIdWithNoLoginMap.get(key).size + loginUserCount;
                    const pageViewCount = pageViewCountMap.get(key);

                    calcReult.push({
                        dateInfo,
                        uniqueUserCount,
                        loginUserCount,
                        activeUserCount,
                        pageViewCount,
                    });
                }

                const columnKeys = [
                    ['날짜', item => `${item.dateInfo.month}/${item.dateInfo.day}`],
                    ['실사용자 수', item => item.uniqueUserCount],
                    ['로그인 사용자 수', item => item.loginUserCount],
                    ['활성 사용자 수', item => item.activeUserCount],
                    ['조회수', item => item.pageViewCount],
                ];
                const columns = Object.fromEntries(
                    columnKeys.map(([key, fn]) => [key, calcReult.map(fn)])
                );
                setGa4LineCols(columns);
            })
            .catch((error) => {
                //console.log(error);
            })
    }

    async function getGa4Statistics() {
        const startDatetime = getRequestDatetimeStr(startDate, "00:00:00");
        const endDatetime = getRequestDatetimeStr(endDate, "23:59:59");

        await Apis
            .get(`/back-office/ga4/statistics`, {
                params: {
                    startDatetime: startDatetime,
                    endDatetime: endDatetime
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
                setGa4GridRender(prev => prev + 1);
            })
            .catch((error) => {
                //console.log(error);
            })
    }

    useEffect(() => {
        getUserStatistics();
    }, []);
    
    useEffect(() => {
        if (startDate && endDate) {            
            if (ga4GridRender === 0 ||  // 첫 렌더링때는 API 반드시 호출하도록 함
                (prevStartDate.getTime() !== startDate.getTime() || prevEndDate.getTime() !== endDate.getTime())) {
                getGa4CalcData();
                getGa4Statistics();
                setPrevDateRange([startDate, endDate]);
            }
        }
    }, [startDate, endDate]);


    // ============ < Make Charts (Line Graph, Grid) > ============ //

    const lineOptions = useMemo(() => {
        if (!ga4LineCols) return null;

        const options = {
            chart: {
                type: "line",
            },
            credits: {
                enabled: false
            },
            title: {
                text: "일별 사용자 통계",
                style: {
                    fontSize: "14px",
                    color: "#333333",
                },
            },
            subtitle: {
                text: '<a href="https://onlinememo.kr" target="_blank">www.OnlineMemo.kr</a>',
                style: {
                    fontSize: "9px",
                },
            },
            xAxis: {
                categories: ga4LineCols["날짜"],  // x축
                labels: {
                    style: {
                        fontSize: "10px",
                        color: "#333333",
                    },
                },
            },
            yAxis: [
                {
                    title: {
                        text: "사용자 수",
                        style: {
                            fontSize: "10px",
                            fontWeight: "bold",
                            color: "#333333",
                        },
                    },
                    labels: {
                        style: {
                            fontSize: "9px",
                            color: "#333333",
                        },
                    },
                    opposite: false,  // y축 (왼쪽)
                },
                {
                    title: {
                        text: "조회수",
                        style: {
                            fontSize: "10px",
                            fontWeight: "bold",
                            color: "#333333",
                        },
                    },
                    labels: {
                        style: {
                            fontSize: "9px",
                            color: "#333333",
                        },
                    },
                    opposite: true,  // y축 (오른쪽)
                },
            ],
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true,
                    },
                    enableMouseTracking: false,
                    lineWidth: 2.5,
                },
            },
            series: [
                {
                    name: "실사용자 수",
                    data: ga4LineCols["실사용자 수"],
                    yAxis: 0,
                    color: "#FF0000",
                },
                {
                    name: "로그인 사용자 수",
                    data: ga4LineCols["로그인 사용자 수"],
                    yAxis: 0,
                    color: "#FF7F00",
                },
                {
                    name: "활성 사용자 수",
                    data: ga4LineCols["활성 사용자 수"],
                    yAxis: 0,
                    color: "#FFD700",
                },
                {
                    name: "조회수",
                    data: ga4LineCols["조회수"],
                    yAxis: 1,
                    color: "#1a75ff",
                },
            ],
        };
        return options;
    }, [ga4LineCols]);

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
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        // textAlign: 'center',
                    }
                },
            }).render(ga4GridRef.current);
        }
    }, [ga4GridCols]);


    // ============ < View > ============ //

    useEffect(() => {
        checkToken();

        // 백오피스 페이지는 header, footer 렌더링 X.
        const headerTag = document.querySelector("header");
        if (headerTag) headerTag.style.display = "none";
        const footerTag = document.querySelector("footer");
        if (footerTag) footerTag.style.display = "none";
        const htmlTag = document.querySelector("html");
        if (htmlTag) htmlTag.style.margin = "0px";

        // 모바일의 zoom 옵션 적용을 위함. (초기 설정)
        const bodyTag = document.querySelector("body");
        if (bodyTag) {
            bodyTag.style.display = "flex";
            bodyTag.style.flexDirection = "column";
            bodyTag.style.justifyContent = "center";
            bodyTag.style.alignItems = "center";
            bodyTag.style.height = "100vh";
        }

        // 모바일의 zoom 옵션 적용을 위함. (반응형 설정)
        // ==> !!! 추후 useMediaQuery 감지 방식으로 최적화 예정 !!!
        const updateLayoutMobile = () => {
            const htmlTag = document.querySelector("html");
            const bodyTag = document.querySelector("body");

            if (window.innerWidth <= 650) {
                if (htmlTag) htmlTag.style.overflowX = "hidden";
                if (bodyTag) bodyTag.style.overflowX = "hidden";
            }
            else {
                if (htmlTag) htmlTag.style.overflowX = "";
                if (bodyTag) bodyTag.style.overflowX = "";
            }
        }
        updateLayoutMobile();

        window.addEventListener('resize', updateLayoutMobile);
        return () => {
            window.removeEventListener('resize', updateLayoutMobile);
        };
    }, []);

    return (
        <PageWrapper>
            <TitleContainer>
                <h1>[ 온라인 메모장 - Back Office ]</h1>
                <div id="userContainer">
                    <div>가입자: {signupUserCnt}명</div>
                    <div className="hideMobile">,&nbsp;</div>
                    <div>탈퇴자: {withdrawnUserCnt}명</div>
                </div>
            </TitleContainer>
            <br />

            {/* [ Line Graph ] */}
            <div style={{
                position: 'relative', width: '76%', maxHeight: '500px',
                marginLeft: '4px', marginBottom: '2px',
                border: '1px solid #ccc', borderRadius: '3px',
            }}>
                <DateContainer>
                    <CustomDatePicker
                        selectsRange
                        shouldCloseOnSelect={true}
                        onChange={(dateRange) => setDateRange(dateRange)}
                        minDate={getKSTDate("2025-08-01", "00:00:00")}  // "15:30:00"
                        maxDate={getMaxDate()}
                        startDate={startDate}
                        endDate={endDate}
                        value={getPrintDateStr()}
                        onFocus={(event) => event.target.blur()}  // 키보드 생성 방지
                        popperPlacement="bottom-start"
                        popperModifiers={[
                            { name: "flip", options: { fallbackPlacements: [] } },  // 모바일에서 드롭다운이 위로 펴짐을 방지
                            { name: "preventOverflow", options: { tether: false } },
                        ]}
                    />
                </DateContainer>
                {lineOptions &&
                     <HighchartsReact highcharts={Highcharts} options={lineOptions} style={{ width: '100%', height: '100%' }} />
                }
            </div>
            
            {/* [ Grid ] */}
            <div ref={ga4GridRef}
                key={ga4GridRender}
                style={{
                    width: "76%",
                    minHeight: "398px", backgroundColor: "#f4f3ee",
                }}
            />

            <button id="logoutButton" onClick={handleLogoutClick}>
                로그아웃 <i className="fa fa-sign-out" aria-hidden="true" />
            </button>
            {/* <div id="customContainer">
                <div>커스텀 텍스트1</div>
                &nbsp;
                <div>커스텀 텍스트2</div>
            </div> */}
        </PageWrapper>
    );
}

export default StatisticPage;