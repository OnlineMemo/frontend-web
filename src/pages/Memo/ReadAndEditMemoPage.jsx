import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios'
import OneMemoWrapper from "../../components/Styled/OneMemoWrapper";
import ReadAndEditMemoNav from "../../components/Navigation/ReadAndEditMemoNav";
import { CheckToken } from "../../utils/CheckToken";
import Apis from "../../apis/Api";

function ReadAndEditMemoPage(props) {
    const { memoId } = useParams();

    const [memo, setMemo] = useState();
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

    useEffect(() => {
        CheckToken();
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
            <ReadAndEditMemoNav
                purpose={purposeText} 
                memoId={memoId}
                title={memo && titleValue}
                content={memo && contentValue}
                memoHasUsersCount={memo && memo.memoHasUsersCount}
                currentVersion={memo && memo.currentVersion}
                propPurposeFunction={highPurposeFunction}
                rerendering={getMemo}
            />
            <OneMemoWrapper>
                {purposeComponent}
            </OneMemoWrapper>
        </div>
    );
}

export default ReadAndEditMemoPage;