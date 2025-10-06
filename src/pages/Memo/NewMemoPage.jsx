import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import OneMemoWrapper from "../../components/Styled/OneMemoWrapper";
import NewMemoNav from "../../components/Navigation/NewMemoNav";
import { checkToken } from "../../utils/TokenUtil";
import { getDateStr } from "../../utils/TimeUtil"
import { showSuccessToast, showErrorToast, showWarnToast, showInfoToast } from "../../utils/ToastUtil"
import Apis from "../../apis/Api";
import { debounce } from 'lodash';

function NewMemoPage(props) {
    const location = useLocation();
    const { isGroup, friendList } = location.state;

    const [prevTitleValue, setPrevTitleValue] = useState(null);
    const [titleValue, setTitleValue] = useState("");
    const [contentValue, setContentValue] = useState("");

    const handleChangeTitle = (event) => {
        setTitleValue(event.target.value);
    }
    const handleChangeContent = (event) => {
        setContentValue(event.target.value);
    }

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

    function startNewMemo() {
        let textarea = document.querySelector('.autoTextarea');
        if (textarea) {
            textarea.style.height = 'auto';
            let height = textarea.scrollHeight;  // 높이
            textarea.style.height = `${height + 8}px`;
        }  // textarea 초기 높이 지정
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
        startNewMemo();  // 출생시점에 startNewMemo 한번 실행.
    }, []);

    // new는 다른 용도와는 다르게, 애초에 빈값이므로 value 속성을 삭제해주어야 인풋으로 값이 적혀진다. 예시로 useState("") 로 시작해버리면 값이 안적혀진다.
    let purposeComponent =
        <div>
            <div className="memoTitle">
                <input className="memoTitleInput" type="text" value={titleValue} onChange={handleChangeTitle} placeholder="제목 입력 (1~15자)" maxLength="15"
                    style={{ width: "38vw", textAlign: "center", paddingTop: "4px", paddingBottom: "4px", border: "1px solid #463f3a", borderRadius: "5px", backgroundColor: "#f4f3ee" }} />
                <button id="aiTitleButton" onClick={debounceAITitleClick}>
                    {/* <span style={{ WebkitTextStroke: "0.35px #463f3a" }}>AI</span> */}
                    <span style={{ WebkitTextStroke: "0.35px #463f3a", width: "13px" }}></span>
                    <i className="fa fa-magic" aria-hidden="true"></i>
                </button>
            </div>
            <hr></hr>
            <div className="memoContent">
                <textarea className="autoTextarea" value={contentValue} onChange={handleChangeContent} placeholder="내용을 입력해주세요."
                    style={{ width: "99.2%", resize: "none", minHeight: "calc(100vh - 271px - 38px)", paddingTop: "5px", paddingBottom: "5px", border: "1px solid #463f3a", borderRadius: "5px", backgroundColor: "#f4f3ee" }}
                    onKeyDown={(event) => autoResizeAndTapkeyTextarea(event)} onKeyUp={autoResizeTextarea} />
            </div>
        </div>

    return (
        <div>
            <NewMemoNav title={titleValue} content={contentValue} isGroup={isGroup} friendList={friendList} />
            <OneMemoWrapper>
                {purposeComponent}
            </OneMemoWrapper>
        </div>
    );
}

export default NewMemoPage;