import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { clearToken } from "../../utils/TokenUtil"
import { showConfirmAlert } from "../../utils/AlertUtil"
import useDetectDropdown from "../../hooks/useDetectDropdown";

const DropdownContainer = styled.div`
    position: relative;
`;

const DropMenu = styled.div`
    background: #463f3a;
    position: absolute;
    top: 67px;
    left: 50%;
    width: 94px;
    text-align: left;
    border-radius: 7px;
    transform: translate(-50%, -20px);
    z-index: 990;  // 페이지위에 겹친 요소들중 가장 위에있는 정도. 숫자가 클수록 위에 있다.

    @media(max-width: 565px) {
        left: 145%;
    }

    &:after {  // 세모화살표만들기
        content: "";
        height: 0;
        width: 0;
        position: absolute;
        top: -2px;
        left: 50%;
        transform: translate(-50%, -50%);
        border: 12px solid transparent;
        border-top-width: 0;
        border-bottom-color: #463f3a;

        @media(max-width: 565px) {
            left: 22%;
        }
    }

    #dropUl {
        list-style-type: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    }

    #dropLi {
        border: solid white 2px;
        border-top: #463f3a;
        border-left: #463f3a;
        border-right: #463f3a;

        :last-child {
            border-bottom: #463f3a;
        }

        & > a {
            font-size: 1.5rem;
            border: #463f3a;
        }
    }
`;

function DropdownLeft(props) {
    const [ddIsOpen, ddRef, ddHandler] = useDetectDropdown(false);  // props를 받아오는게 아닌 훅 종류를 사용하였으므로, {}가 아닌, []로 받아야한다.
    // useDetectDropdown(initialValue)의 initialValue를 false로 넣어주었다. 그러므로, IsOpen이 false가 되어 ddIsOpen도 false가 된다.
    // 참고로 dd는 dropdown을 줄여서 적어본것임.

    const { dropMain, dropItems } = props;

    const handleLogoutClick = () => {
        showConfirmAlert({
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

    return (
        <DropdownContainer>
            <li onClick={ddHandler} ref={ddRef}>
                {dropMain}
            </li>
            {ddIsOpen &&
                <DropMenu>
                    <ul id="dropUl">
                        {dropItems.map((drop, index) => {
                            return (
                                <li id="dropLi" key={index}>
                                    {index==3 && drop.name=="로그아웃"
                                        ? <Link onClick={handleLogoutClick}>{drop.name}</Link>
                                        : <Link to={drop.link} style={{ textDecoration: "none" }}>{drop.name}</Link>
                                    }
                                </li>
                            );
                        }
                        )}
                    </ul>
                </DropMenu>
            }
        </DropdownContainer>
    );
}

export default DropdownLeft;