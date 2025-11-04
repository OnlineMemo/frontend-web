import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { getDateStr, getFullDatetimeStr } from "../../utils/TimeUtil"
import ConfirmModal from "./ConfirmModal";

function NoticeModal(props) {
    const {
        isProgressOrComplete,  // true: 점검 예정 또는 진행중인 모달, false: 업데이트 완료 모달 
        startDateTime, endDateTime,  // ex) "2025-06-26 00:00" or "2025-06-26 00:00:00"
        modalStyle = {},
        iconStyle = {}, contentStyle = {} 
    } = props;
    
    const noticeStateKey = isProgressOrComplete ? 'noticeProgressState' : 'noticeCompleteState';
    const maxNoticeCnt = 2;  // 최대 2회(하루에 1회씩)까지만 보게하기.

    // - 1차: DOM 렌더링 허용 판단 (Prerender 레벨)
    const currentDate = new Date();
    const isInDateRange = (() => {  // IIFE 함수로 변수화
        const startDate = new Date(getFullDatetimeStr(startDateTime));
        const endDate = new Date(getFullDatetimeStr(endDateTime));
        return (startDate <= currentDate && currentDate <= endDate);  // 공지모달 띄울 기간
    })();
    // - 2차: 모달 열고닫기 조건 평가 (Client 레벨)
    const [noticeModalOn, setNoticeModalOn] = useState(false);

    useEffect(() => {
        if (!isInDateRange) {
            localStorage.removeItem(noticeStateKey);
            return;
        }

        const kstDateStr = getDateStr(currentDate);  // 현재 시각 (한국 기준)
        const noticeStateValue = localStorage.getItem(noticeStateKey);
        const noticeStateArr = noticeStateValue ? noticeStateValue.split(',') : [];
        const noticeStateLen = noticeStateArr.length;

        // - 새로운 공지가 올라왔는가?
        const startDateTimePrefix = startDateTime.split(' ')[0];  // ex) "2025-06-26 00:00" -> "2025-06-26"
        const isNewNotice = (noticeStateLen > 0) && (noticeStateArr[noticeStateLen-1] < startDateTimePrefix);
        if (isNewNotice === false) {  // 기존 공지이므로 횟수 체크 필요
            // - 공지 최대 조회수를 모두 충족하였는가?
            const isMaxView = noticeStateLen >= maxNoticeCnt;
            if (isMaxView) return;
            // - 오늘 공지를 확인하였는가?
            const isTodayView = (noticeStateLen > 0) && (noticeStateArr[noticeStateLen-1] === kstDateStr);
            if (isTodayView) return;
        }

        setTimeout(() => {
            setNoticeModalOn(true);
            localStorage.setItem(
                noticeStateKey,
                (isNewNotice === true || noticeStateArr.length === 0)
                    ? kstDateStr
                    : `${noticeStateValue},${kstDateStr}`
            );
        }, 300);  // 0.3초 딜레이 후에 공지모달 생성.
    }, []);

    useEffect(() => {
        if (!isInDateRange) return;

        const globalModalElement = document.getElementById(noticeStateKey);
        if (globalModalElement) {
            globalModalElement.style.opacity = noticeModalOn ? 1 : 0;
            globalModalElement.style.pointerEvents = noticeModalOn ? "auto" : "none";
            globalModalElement.style.transition = "opacity 0.1s ease-in-out";
            globalModalElement.style.visibility = noticeModalOn ? 'visible' : 'hidden';
        }

        const handleEnterKeyDown = (event) => {  // 엔터키로 공지 모달 닫기.
            if (event.key === "Enter" && noticeModalOn === true) {
                setNoticeModalOn(false);
            }
        };
        if (noticeModalOn) window.addEventListener("keydown", handleEnterKeyDown);

        return () => {
            window.removeEventListener("keydown", handleEnterKeyDown);
        };
    }, [noticeModalOn]);


    return (
        (isInDateRange === true) &&  // !!! 주의 : 이 변수를 useState로 관리하면 hydration 오류(#418, #423)가 발생하니 인라인으로 즉시 비교할것. !!!
            <ConfirmModal globalModalId={noticeStateKey} closeModal={() => setNoticeModalOn(!noticeModalOn)} customStyle={modalStyle}>
                <i className={isProgressOrComplete ? "fa fa-exclamation-circle" : "fa fa-thumbs-o-up"} aria-hidden="true" style={iconStyle}></i>
                <h2 className="successSignupModalTitle" style={contentStyle}>
                    {props.children}
                </h2>
                <button className="cancelButton" onClick={() => setNoticeModalOn(false)}>확인</button>
            </ConfirmModal>
    );
}

export default NoticeModal;