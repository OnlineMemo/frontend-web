import React from "react";
import styled from "styled-components";

const ModalWrapper = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;  // 페이지위에 겹친 요소들중 가장 위에있는 정도. 숫자가 클수록 위에 있다.

    .modalBody {
        position: absolute;
        width: 225px;
        height: 113px;
        padding: 40px;
        text-align: center;
        background-color: #bdb8b1;
        border: 2.2px solid #463f3a;
        border-radius: 10px;
        box-shadow: 0 2px 3px 0 rgba(34, 36, 38, 0.15);
    }
    
    #modalCloseButton {
        position: absolute;
        top: 15px;
        right: 15px;
        border: none;
        color: rgba(0, 0, 0, 0.7);
        background-color: transparent;  // 배경색 없음.
        font-size: 20px;
    }
    
    #modalCloseBtn:hover {
        cursor: pointer;
    }

    .fa-exclamation-circle {
        font-size: 2.95rem;
        color: #dd2b2b;
    }

    .fa-thumbs-o-up {
        font-size: 2.95rem;
        color: #463f3a;
    }

    .fa-lock {
        font-size: 2.95rem;
        color: brown;
    }

    .modalTitle {
        font-size: 1.93rem;
        color: #dd2b2b;
        margin-top: 9px;
        margin-bottom: 19px;
    }

    .successSignupModalTitle {
        font-size: 1.93rem;
        color: #463f3a;
        margin-top: 9px;
        margin-bottom: 19px;
    }
    
    .confirmDeleteButton {
        font-size: 1.5rem;
        background-color: #dd2b2b;
        color: #312d29;

        padding: 1px 6px 1px 6px;
        border-top: 2px solid #767676;
        border-left: 2px solid #767676;
        border-bottom: 2px solid #212121;
        border-right: 2px solid #212121;

        &:hover {
            background-color: #dd2b2ba4;
        }
    }

    .cancelButton {
        font-size: 1.5rem;
        background-color: #463f3a;
        color: white;

        padding: 1px 6px 1px 6px;
        border-top: 2px solid #767676;
        border-left: 2px solid #767676;
        border-bottom: 2px solid #212121;
        border-right: 2px solid #212121;

        &:hover {
            background-color: #463f3aa4;
        }
    }

    .copyModalButton {
        font-size: 1.53rem;
        background-color: #f4f3ee;
        color: #463f3a;

        padding: 1px 6px 1px 6px;
        border-top: 2px solid #767676;
        border-left: 2px solid #767676;
        border-bottom: 2px solid #212121;
        border-right: 2px solid #212121;

        &:hover {
            background-color: #f4f3eea4;
        }
    }
`;

function ConfirmModal(props) {

    const handleCloseModalClick = (event) => {
        props.closeModal();
    }

    return (
        <ModalWrapper onClick={handleCloseModalClick}>
            <div className="modalBody" onClick={(e) => e.stopPropagation()} style={props.customStyle}>
                <button id="modalCloseButton" onClick={handleCloseModalClick}>
                    X
                </button>
                {props.children}
            </div>
        </ModalWrapper>
    );
}

export default ConfirmModal;