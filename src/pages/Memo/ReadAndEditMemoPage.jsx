import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import OneMemoWrapper from "../../components/Styled/OneMemoWrapper";
import ReadAndEditMemoNav from "../../components/Navigation/ReadAndEditMemoNav";
import { checkToken } from "../../utils/TokenUtil";
import { getDateStr } from "../../utils/TimeUtil"
import { showSuccessToast, showErrorToast, showWarnToast, showInfoToast } from "../../utils/ToastUtil"
import { ToastContainer, Bounce, Slide } from 'react-toastify';
import Apis from "../../apis/Api";
import { debounce } from 'lodash';

function ReadAndEditMemoPage(props) {
    const navigate = useNavigate();
    const { memoId } = useParams();

    const [memo, setMemo] = useState();
    const [prevTitleValue, setPrevTitleValue] = useState(null);
    const [titleValue, setTitleValue] = useState("");
    const [contentValue, setContentValue] = useState("");
    const [purpose, setPurpose] = useState("read");

    const extendLockGap = (1000 * 60 * 10) - (1000 * 15);  // 10분 - 15초 (밀리초 단위)
    const extendLockTimerRef = useRef(null);
    const lastTypedTimeRef = useRef(Date.now());

    const highPurposeFunction = (text) => {  // 상위 컴포넌트 함수
        setPurpose(text);
    }

    const handleChangeTitle = (event) => {
        setTitleValue(event.target.value);
        handleIsTypingForTimer();
    }
    const handleChangeContent = (event) => {
        setContentValue(event.target.value);
        handleIsTypingForTimer();
    }

    const handleIsTypingForTimer = () => {
        if (purpose === "edit" && memo?.memoHasUsersCount > 1) {
            lastTypedTimeRef.current = Date.now();
            if (!extendLockTimerRef.current) {
                startExtendLockTimer();
            }
        }
    }
    const startExtendLockTimer = () => {
        extendLockTimerRef.current = setTimeout(() => {  // 타이머 Ref를 생성
            const now = Date.now();
            const diffTime = now - lastTypedTimeRef.current;

            if (diffTime <= extendLockGap) {
                // 시간 내에 타이핑이 있었으니, API 호출
                Apis.post(`/memos/${memoId}/lock`)
                    .then(() => {
                        // 락 연장에 성공했으므로, 타이머 초기화 후 재시작
                        clearTimeout(extendLockTimerRef.current);
                        extendLockTimerRef.current = null;
                        startExtendLockTimer();
                    })
                    .catch((error) => {
                        // 락 연장에 실패했으므로, API 호출 중지 및 타이머 종료
                        clearTimeout(extendLockTimerRef.current);
                        extendLockTimerRef.current = null;
                    });
            }
            else {
                // 시간 내에 타이핑이 없었으니, API 호출 중지 및 타이머 종료
                clearTimeout(extendLockTimerRef.current);
                extendLockTimerRef.current = null;
            }
        }, extendLockGap);  // extendLockGap 시간 이후에, 내부 메소드 로직을 실행.
    };

    const autoResizeTextarea = () => {
        let textarea = document.querySelector('.autoTextarea');

        if (textarea) {
            var scrollLeft = window.pageXOffset ||
                (document.documentElement || document.body.parentNode || document.body).scrollLeft;
            var scrollTop = window.pageYOffset ||
                (document.documentElement || document.body.parentNode || document.body).scrollTop;

            textarea.style.height = 'auto';
            let height = textarea.scrollHeight;  // 높이
            textarea.style.height = `${height + 8}px`;

            window.scrollTo(scrollLeft, scrollTop);
            // textarea.style.height = 'auto'; 로 인하여 발생하는
            // textarea Autosizing Scroll Jumping 현상을 방지하는 역할의 코드이다.
        }
    };

    const autoResizeAndTapkeyTextarea = (event) => {
        let textarea = document.querySelector('.autoTextarea');

        if (textarea) {
            var scrollLeft = window.pageXOffset ||
                (document.documentElement || document.body.parentNode || document.body).scrollLeft;
            var scrollTop = window.pageYOffset ||
                (document.documentElement || document.body.parentNode || document.body).scrollTop;

            textarea.style.height = 'auto';
            let height = textarea.scrollHeight;  // 높이
            textarea.style.height = `${height + 8}px`;

            window.scrollTo(scrollLeft, scrollTop);
            // textarea.style.height = 'auto'; 로 인하여 발생하는
            // textarea Autosizing Scroll Jumping 현상을 방지하는 역할의 코드이다.
        }

        if (event.keyCode === 9) {
            event.preventDefault();
            let val = event.target.value;
            let start = event.target.selectionStart;
            let end = event.target.selectionEnd;
            event.target.value = val.substring(0, start) + "\t" + val.substring(end);
            event.target.selectionStart = event.target.selectionEnd = start + 1;

            return false;  // focus 막음
        }
    };

    async function getMemo() {  // 해당 사용자의 메모 1개 조회
        await Apis
            .get(`/memos/${memoId}`)
            .then((response) => {
                setMemo(response.data.data);
                setTitleValue(response.data.data.title);
                setContentValue(response.data.data.content);

                let textarea = document.querySelector('.autoTextarea');
                if (textarea) {
                    textarea.style.height = 'auto';
                    let height = textarea.scrollHeight;  // 높이
                    textarea.style.height = `${height + 8}px`;
                }  // textarea 초기 높이 지정
            })
            .catch((error) => {
                //console.log(error);
            })
    }

    const handleAITitleClick = async (event) => {
        const storedMaxAIUsageDate = localStorage.getItem("maxAIUsageDate");
        const todayStr = getDateStr(new Date());
        if (storedMaxAIUsageDate) {
            if (storedMaxAIUsageDate >= todayStr) {
                showErrorToast("일일 AI 사용 횟수를 초과했습니다. (10회)");
                return;
            }
            else localStorage.removeItem("maxAIUsageDate");
        }

        if (contentValue.length > 15) {  // 내용이 15자 초과일때만 '제목 AI 생성' API 호출 (불필요한 리소스 낭비 방지.)
            showInfoToast("제목 AI : 내용을 분석하는 중 ...")
            const prevTitle = (prevTitleValue === null && titleValue) ? titleValue : prevTitleValue;

            await Apis
                .post(`/memos/ai/title`, {
                    prevTitle: prevTitle,
                    content: contentValue
                })
                .then((response) => {
                    // console.log(response.data.data.dailyAIUsage);
                    const aiTitleValue = response.data.data.title;
                    const isMaxDailyAIUsage = response.data.data.isMaxDailyAIUsage;
                    if (isMaxDailyAIUsage === true) {
                        localStorage.setItem("maxAIUsageDate", todayStr);
                    }
                    setTitleValue(aiTitleValue);
                    setPrevTitleValue(aiTitleValue);
                    showSuccessToast("내용에 어울리는 제목을 만들었어요!");
                })
                .catch((error) => {
                    const httpStatus = error.response?.status;
                    if (httpStatus === 400) {
                        showErrorToast("일일 AI 사용 횟수를 초과했습니다. (10회)");
                    }
                    else if (httpStatus === 429) {
                        showErrorToast("현재 이용자가 많아, 잠시 후 시도해주세요.");
                    }
                    else {  // else if (httpStatus === 500)
                        showErrorToast("문제가 발생했어요. 잠시 후 시도해주세요.");
                    }
                })
        }
        else {
            // setTitleValue(contentValue);
            showWarnToast("제목 AI : 내용을 16자 이상 작성해주세요.");
        }
    }
    const debounceAITitleClick = useCallback(
        debounce(handleAITitleClick, 300),
        [handleAITitleClick]
    );

    useEffect(() => {
        checkToken();
        getMemo();
    }, [purpose]);

    useEffect(() => {
        if (purpose === "edit" && memo?.memoHasUsersCount > 1) {
            if (!extendLockTimerRef.current) {
                startExtendLockTimer();
            }
        }
        else {
            if (extendLockTimerRef.current) {
                clearTimeout(extendLockTimerRef.current);
                extendLockTimerRef.current = null;
            }
        }
    }, [purpose, memo]);

    useEffect(() => {
        if (memoId && !/^\d+$/.test(memoId)) {  // '/memos/숫자' 경로가 아닌 경우, 404 페이지로 이동
            navigate('/404');
        }

        return () => {
            if (extendLockTimerRef.current) {
                clearTimeout(extendLockTimerRef.current);
                extendLockTimerRef.current = null;
            }
        };
    }, []);


    let purposeText;
    let purposeComponent;
    if (purpose == "edit") {
        purposeText = "edit";

        purposeComponent =
            <div>
                <div className="memoTitle">
                    <input className="memoTitleInput" type="text" value={memo && titleValue} onChange={handleChangeTitle} placeholder="제목 입력 (1~15자)" maxLength="15"
                        style={{ width: "38vw", textAlign: "center", paddingTop: "4px", paddingBottom: "4px", border: "1px solid #463f3a", borderRadius: "5px", backgroundColor: "#f4f3ee" }} />
                    <button id="aiTitleButton" onClick={debounceAITitleClick}>
                    {/* <span style={{ WebkitTextStroke: "0.35px #463f3a" }}>AI</span> */}
                    <span style={{ WebkitTextStroke: "0.35px #463f3a", width: "13px" }}></span>
                    <i className="fa fa-magic" aria-hidden="true"></i>
                    </button>
                </div>
                <hr></hr>
                <div className="memoContent">
                    <textarea className="autoTextarea" value={memo && contentValue} onChange={handleChangeContent} placeholder="내용을 입력해주세요."
                        style={{ width: "99.2%", resize: "none", minHeight: "calc(100vh - 271px - 38px)", paddingTop: "5px", paddingBottom: "5px", border: "1px solid #463f3a", borderRadius: "5px", backgroundColor: "#f4f3ee" }}
                        onKeyDown={(event) => autoResizeAndTapkeyTextarea(event)} onKeyUp={autoResizeTextarea} />
                </div>
            </div>
    }
    else {  // (purpose == "read") 일때
        memo && memo.memoHasUsersCount > 1
            ? purposeText = "readGroup"  // 개인메모가 아닌 공동메모일 경우, 버튼의 텍스트를 '그룹 탈퇴'로 변경.
            : purposeText = "readPrivate";  // 개인메모일 경우, 버튼의 텍스트를 '삭제'로 변경.

        purposeComponent =
            <div>
                <div className="memoTitle">{memo && memo.title}</div>
                <hr></hr>
                <div className="memoContent">{memo && memo.content}</div>
            </div>
    }

    return (
        <div>
            {(titleValue !== "" && purpose === "read") &&
                <Helmet>
                    <title>{titleValue} (온라인 메모장)</title>
                    {/* <meta name="description" content="📝 모든 기기에서 간편하게 메모를 작성하고, 친구와 공동 편집도 가능한 온라인 메모장입니다. 📝" /> */}
                    {/* <link rel="canonical" href={`https://www.onlinememo.kr/memos/${memoId}`} /> */}
                </Helmet>
            }
            {(purpose === "edit") &&
                <Helmet>
                    <title>편집 중... (온라인 메모장)</title>
                    {/* <meta name="description" content="📝 모든 기기에서 간편하게 메모를 작성하고, 친구와 공동 편집도 가능한 온라인 메모장입니다. 📝" /> */}
                    {/* <link rel="canonical" href={`https://www.onlinememo.kr/memos/${memoId}`} /> */}
                </Helmet>
            }

            <ReadAndEditMemoNav
                purpose={purposeText} 
                memoId={memoId}
                title={memo && titleValue}
                content={memo && contentValue}
                setPrevTitleValue={setPrevTitleValue}
                memoHasUsersCount={memo && memo.memoHasUsersCount}
                currentVersion={memo && memo.currentVersion}
                propPurposeFunction={highPurposeFunction}
                rerendering={getMemo}
            />
            <OneMemoWrapper>
                {purposeComponent}
            </OneMemoWrapper>

            <ToastContainer
                position={'bottom-center'}
                autoClose={1100}  // 1.1초 뒤 자동 닫힘
                hideProgressBar={false}  // 타임 진행바 숨김
                closeOnClick={false}  // 클릭해도 닫히지 않음
                pauseOnHover={false}  // 마우스 올리면 멈춤
                draggable={false}  // 스와이프 제거 가능
                transition={Bounce}
                toastStyle={{
                    // width: "500px",
                    padding: "5px 25px 5px 18px",
                    backgroundColor: "#f4f3ee",  // white
                    color: "#463f3a",
                    fontFamily: "jua",
                    fontSize: "14.5px",
                    border: "1.3px solid #bdb8b1",
                    borderRadius: "8px",
                    whiteSpace: "pre-line"
                }}
            />
        </div>
    );
}

export default ReadAndEditMemoPage;