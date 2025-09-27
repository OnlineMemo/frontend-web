import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import '../../App.css';
import NavWrapper from "../Styled/NavWrapper";
import DropdownLeft from "../UI/DropdownLeft";
import NewMemoOptionDropdownRight from "../UI/NewMemoOptionDropdownRight";
import { checkToken } from "../../utils/TokenUtil"

const Wrapper = styled(NavWrapper)`

    ul {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        
        align-items: baseline;
    }

    ul li {
        font-size:2rem;
        list-style: none;
        line-height:50px;
        color: #ffffff;
    }

    .fa-user-o {
        border: solid 2.3px #bcb8b1;
        border-radius: 6px;
        padding: 2.3px 4.8px;
        color: #ffffff;
        background-color: #463f3a;

        &:hover {
            cursor: pointer;
            background-color: #463f3aa4;
        }
    }

    a {  // Link 태그도 영향 받음.
        text-decoration:none;
        font-size:2rem;
        color: #ffffff;
        border-left: #bcb8b1 solid 2px;
        border-right: #bcb8b1 solid 2px;
        padding: 1px 7px;

        &:hover {
            cursor: pointer;
            color: #463f3a;
            background-color: #bcb8b1;
            border-left: #463f3a solid 2px;
            border-right: #463f3a solid 2px;
        }
    }

    button {
        background-color: #463f3a;
        color: white;
        border-radius: 5px;
        font-family: "jua";
        font-size: 1.8rem;

        padding: 1px 6px 1px 6px;
        border-top: 2px solid #767676;
        border-left: 2px solid #767676;
        border-bottom: 2px solid #212121;
        border-right: 2px solid #212121;

        &:hover {
            cursor: pointer;
            background-color: #463f3aa4;
        }
    }
`;

function YesLoginNav(props) {
    const navigate = useNavigate();

    const { memoListPageFriends } = props;  // undefined 가능. 선택적.

    const dropItemsUser = [
        {
            name: "회원정보",
            link: `/users`,
        },
        {
            name: "공지사항",
            link: '/notice',
        },
        {
            name: "개발 정보",
            link: '/information',
        },
        {
            name: "로그아웃",
        },
    ]

    const dropItemsPlus = [
        {
            name: "+ 개인 메모",
            link: `/memos/new-memo`,
        },
        {
            name: "+ 공동 메모",
        },
    ]

    useEffect(() => {
        checkToken();
    }, []);


    return (
        <Wrapper>
            <ul>
                <DropdownLeft
                    dropMain={<i className="fa fa-user-o" aria-hidden="true"></i>}
                    dropItems={dropItemsUser}
                />
                <li><Link to={'/memos'}>메모 목록</Link></li>
                <li><Link to={'/friends'}>친구 목록</Link></li>
                <NewMemoOptionDropdownRight
                    dropMain={<span><button>+ 새 메모&nbsp;<i className="fa fa-caret-down" aria-hidden="true"></i></button></span>}
                    dropItems={dropItemsPlus}
                    memoListPageFriends={memoListPageFriends}
                />
            </ul>
        </Wrapper>
    );
}

export default YesLoginNav;