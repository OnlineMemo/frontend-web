import React, { useState, useRef } from "react";

function usePendingRequest(maxPendingTime = 1000 * 15) {  // 요청이 끝날 때까지 중복 실행을 막는 커스텀 훅 (최대 15초)
    const [isPending, setIsPending] = useState(false);
    const isPendingRef = useRef(false);  // state는 리렌더 후 반영되므로, 연타 즉시 차단은 ref로 처리
    const requestIdRef = useRef(0);

    const releasePending = (requestId) => {
        if (requestIdRef.current !== requestId) return;  // 최대시간 초과 후 새로 실행된 요청의 pending은 유지

        isPendingRef.current = false;
        setIsPending(false);
    };

    const runPending = async (requestFunction) => {
        if (isPendingRef.current) return;

        const requestId = ++requestIdRef.current;
        isPendingRef.current = true;
        setIsPending(true);

        const maxPendingTimer = setTimeout(() => releasePending(requestId), maxPendingTime);  // 응답이 없어도 최대시간 후 해제
        try {
            await requestFunction();
        } finally {
            clearTimeout(maxPendingTimer);
            releasePending(requestId);
        }
    };

    return [isPending, runPending];
}

export default usePendingRequest;