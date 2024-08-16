import React, { useState, useEffect } from "react";
import styled from "styled-components";

const TitleDateUserWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;

    color: #463f3a;
`;

const TitleDateWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    height: 37px;
    flex-wrap: nowrap;
    justify-content: space-between;

    .titleDiv {
        font-size: 1.8rem;

        height: 18.6px;
        overflow: hidden;
    }

    .dateDiv {
        font-size: 1.13rem;

        height: 13.1px;
    }
`;

const UserWrapper = styled.div`
    font-size: 1.25rem;
    color: #a14e1b;

    height: 37px;
    width: 81px;
    overflow-x: hidden;
    overflow-y: auto;
    white-space: nowrap;

    &::-webkit-scrollbar {
        width: 5px;
        background-color: lightgray;
        border-radius: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: gray;
        border-radius: 4px;
    }

    .user-ul {
        list-style-type: none;
        margin-top: 5px;
        margin-bottom: 5px;
        padding-left: 30px;

        :first-child {
            margin-top: 2px;
        }
        :last-child {
            margin-bottom: 2px;
        }
    }
    .user-li:before {
        content: "\f007";
        font-family: "FontAwesome";
    }
`;

function MemoListItem(props) {
    const { title, modifiedTime, userResponseDtoList, memoHasUsersCount } = props;


    return (
        <TitleDateUserWrapper>
            <TitleDateWrapper>
                <div className="titleDiv">{title && title}</div>
                <div className="dateDiv">{modifiedTime && modifiedTime}</div>
            </TitleDateWrapper>
            <UserWrapper>
                {(userResponseDtoList && memoHasUsersCount) && userResponseDtoList.map((user) => {
                    return (
                        <ul key={user.userId} className="user-ul" style={memoHasUsersCount == 1 ? { visibility: "hidden" } : { visibility: "visible" }}>
                            <li className="user-li">
                                &nbsp;{user.nickname}&nbsp;
                            </li>
                        </ul>
                    );
                })}
            </UserWrapper>
        </TitleDateUserWrapper>
    );
}

export default MemoListItem;