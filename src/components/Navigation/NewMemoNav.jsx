import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import '../../App.css';
import NavWrapper from "../Styled/NavWrapper";
import axios from 'axios'
import { CheckToken } from "../../utils/CheckToken";
import Apis from "../../apis/Api";

const Wrapper = styled(NavWrapper)`

    position: sticky;
    top: 0px;

    ul {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        
        align-items: baseline;
    }

    ul li {
        list-style:none;
        line-height:50px;
        padding: 0px 7px;
        font-size: 2rem;
    }  

    .fa-arrow-left {
        font-size: 2.1rem;  
        font-weight: bolder;
        color: #f4f3ee;
        text-shadow: -1.6px 0 #463f3a, 0 1.6px #463f3a, 1.6px 0 #463f3a, 0 -1.6px #463f3a;
        padding: 2.3px 4.8px;

        &:hover {
            cursor: pointer;
            color: #f4f3eea4;
        }
    }

    button {
        border-radius: 6.5px;
        font-family: "jua";
        font-size: 1.75rem;

        width: 51.5px;
        height: 27px;

        padding-bottom: 0px;

        &:hover {
            cursor: pointer;
        }
    }

    .editButton {
        background-color: #463f3a;
        color: white;

        &:hover {
            background-color: #463f3aa4;
        }
    }

    .deletePrivateButton {
        background-color: #dfafa1;
        color: #463f3a;

        &:hover {
            background-color: #dfb1a1a4;
        }
    }

    .deleteGroupButton {
        background-color: #dfafa1;
        color: #463f3a;

        width: 80px;

        &:hover {
            background-color: #dfb1a1a4;
        }
    }

    .saveButton {
        background-color: #a1c4df;
        color: #463f3a;

        padding: 1px 6px 1px 6px;
        border-top: 2px solid #767676;
        border-left: 2px solid #767676;
        border-bottom: 2px solid #212121;
        border-right: 2px solid #212121;

        &:hover {
            background-color: #a1c4dfa4;
        }
    }

    .flex-left {
        display: inline-flex;
        align-items: center;
    }

    .flex-copy {
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        line-height: 13.7px;
        width: 30px;
        margin-top: 1.5px;

        color: #463f3a;        
        border: solid 1.8px #463f3a;
        border-radius: 6px;
        background-color: #f4f3ee;
        padding: 2.3px 4.8px;

        &:hover {
            cursor: pointer;
            background-color: #f4f3eea4;
        }
    }

    .fa-clone {
        font-size: 1.45rem;   
        font-weight: bold;
    }

    .copyText {
        font-size: 1.15rem;
        font-weight: bold; 
        height: 11px;
    }
`;

function NewMemoNav(props) {
    const navigate = useNavigate();

    const handleNewSaveClick = async (titleValue, contentValue, e) => {
        if (titleValue.length < 1) {
            var element = document.querySelector(".memoTitleInput");
            element.style.border = "3.3px solid #dd2b2b";
            element.style.borderRadius = "5px";
        }
        else {
            let friendIdList = null;
            if (props.isGroup == 1) {  // 새 공동메모 생성시라면
                friendIdList = props.friendList.map((user) => user.userId); // 친구의 userId만 추출한 리스트 생성.
            }

            await Apis
                .post(`/memos`, {
                    title: titleValue,
                    content: contentValue,
                    userIdList: friendIdList
                })
                .then((response) => {
                    var memoId = response.data.data.memoId
                    navigate(`/memos/${memoId}`);
                })
                .catch((error) => {
                    //console.log(error);
                })
        }
    }

    useEffect(() => {
        CheckToken();
    }, []);

    const newNavItems = [  // 메모 작성 용도
        <span className="flex-left">&nbsp;<i className="fa fa-arrow-left" aria-hidden="true" onClick={() => { navigate(-1) }}></i></span>,
        <span><button className="saveButton" onClick={(event) => handleNewSaveClick(props.title, props.content, event)}>저장</button>&nbsp;</span>
    ];

    let navItems = newNavItems;


    return (
        <Wrapper>
            <ul>
                {navItems.map((navItem, index) => {
                    return (
                        <li key={index}>{navItem}</li>
                    );
                }
                )}
            </ul>
        </Wrapper>
    );
}

export default NewMemoNav;