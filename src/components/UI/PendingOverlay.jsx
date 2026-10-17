import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";

const OverlayWrapper = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: transparent;
    z-index: 1000;  // Nav(999)보다 위, 토스트(9999)보다 아래.
`;

function PendingOverlay() {  // 요청 처리 중 화면 클릭 및 터치를 막는 투명 오버레이
    useEffect(() => {
        document.activeElement?.blur();  // 입력란 포커스 해제 (Tab 이동은 막지 않음)
    }, []);

    return createPortal(<OverlayWrapper />, document.body);
}

export default PendingOverlay;
