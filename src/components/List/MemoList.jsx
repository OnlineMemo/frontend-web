import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import axios from 'axios'
import MemoListItem from "./MemoListItem";
import IsStarButton from "../UI/IsStarButton";
import MemoOptionButton from "../UI/MemoOptionButton";

const MemosWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    & > * {  // &는 현재 태그인 Wrapper 태그를 의미하고, *는 전체를 의미하므로, & > * 는 Wrapper 태그에 한단계 밑부분 전체의 자식 선택자 태그들을 범위로 지정한것이다.
        :not(:last-child) {  // Wrapper 태그에 한단계 밑부분 전체의 자식 선택자 태그들중에서 가장 마지막 자식 선택자를 제외한 모든 자식 태그들을 범위로 지정한것이다.
            margin-bottom: 6px;
        }
    }
`;

const MemoItemsWrapper = styled.div`
    width: calc(100% - 36px);
    padding: 12.5px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    background: #FEF5C6;
    border-bottom: 2.2px solid #463f3a;
    box-shadow: 0px 0.7px;
    border-radius: 9px;
    cursor: pointer;
    :hover {
        background: #faeb9e;
    }

    .fa-users {
        font-size: 1.7rem;
        color: #a14e1b;
    }
    .fa-star {
        font-size: 1.7rem;
        color: orange;

        :hover {
            cursor: grab;
        }
    }
    .fa-star-o {
        font-size: 1.7rem;
        color: orange;

        :hover {
            cursor: grab;
        }
    }
    .fa-ellipsis-v {
        font-size: 1.7rem;
        color: #463f3a;

        :hover {
            cursor: grab;
        }
    }
`;

const NoneSearch = styled.div`
    #noneResult {
        display: none;

        margin-top: 11.5px;
        word-break: keep-all;
        text-align: center;
        font-size: 1.43rem;
        line-height: 127%;

        .fa-times-circle {
            font-size: 4rem;
        }

        & > span {
            color: red;
        }
    }
`;

function MemoList(props) {
    const { search, memos, allFriends, getMemos } = props;


    return (
        <MemosWrapper>
            <NoneSearch>
                <div id="noneResult">
                    <span><i className="fa fa-times-circle" aria-hidden="true"></i></span><div style={{ lineHeight: "45%" }}><br></br></div>
                    검색하신 <strong>&#39;{search}&#39;</strong>을 포함하는 <span>메모가 존재하지 않습니다.</span><br></br>
                    제목 또는 내용에 포함된 키워드로 <span>다시 검색해주십시오.</span>
                </div>
            </NoneSearch>
            {memos && memos.map((memo) => {
                return (
                    <MemoItemsWrapper key={memo.memoId}>
                        <IsStarButton style={{ flexGrow: "4" }} memoId={memo.memoId} isStar={memo.isStar} memoHasUsersCount={memo.memoHasUsersCount} />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <Link style={{ textDecoration: "none", flexGrow: "8" }} to={`/memos/${memo.memoId}`} >
                            <MemoListItem title={memo.title} modifiedTime={memo.modifiedTime} userResponseDtoList={memo.userResponseDtoList} memoHasUsersCount={memo.memoHasUsersCount} /> 
                        </Link>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <MemoOptionButton style={{ flexGrow: "4" }} memoId={memo.memoId} userResponseDtoList={memo.userResponseDtoList} memoHasUsersCount={memo.memoHasUsersCount} allFriends={allFriends} getMemos={getMemos} />
                    </MemoItemsWrapper>
                );
            })}
        </MemosWrapper>
    );
}

export default MemoList;