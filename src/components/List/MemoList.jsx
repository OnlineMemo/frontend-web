import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
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

const NoneResult = styled.div`
    display: block;

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
`;

const filterNames = {
    null: "전체 메모",  // "all-memo"
    "private-memo": "개인 메모",
    "group-memo": "공동 메모",
    "star-memo": "즐겨찾기 메모"
};

function MemoList(props) {
    const { filter, search, memos, allFriends, getMemos } = props;

    const getFilterName = () => {
        return filterNames[filter] ?? "전체 메모";  // 후자는 에러의 경우이나, 사용자에게 별도로 알리지 않기 위함.
    }

    const storeFilterSearchScroll = () => {
        // Filter & Search
        const currentSortValue = document.getElementById('sortBox')?.value;
        const currentSearchValue = document.getElementById('searchBox')?.value;
        if (['private-memo', 'group-memo', 'star-memo'].includes(currentSortValue)) {
            sessionStorage.setItem("filter", currentSortValue);
        }
        else if (currentSearchValue) {
            sessionStorage.setItem("search", currentSearchValue);
        }

        // Scroll
        const memoListElement = document.getElementById("memoListContainer");
        if (memoListElement) {
            sessionStorage.setItem("scroll", memoListElement.scrollTop);
        }
    }


    return (
        <MemosWrapper>
            <div>
                {(filter !== null && search === null && memos.length === 0) &&  // 전체메모 외 정렬 결과가 0개일 경우
                    <NoneResult>
                        <span><i className="fa fa-times-circle" aria-hidden="true"></i></span><div style={{ lineHeight: "45%" }}><br></br></div>
                        정렬하신 <strong>&#39;{getFilterName()}&#39;</strong> 기준의 <span>메모가 존재하지 않습니다.</span><br></br>
                        새로 생성하거나 다른 기준으로 <span>다시 정렬해주십시오.</span>
                    </NoneResult>
                }
                {(filter === null && search !== null && memos.length === 0) &&  // 검색 결과가 0개일 경우
                    <NoneResult>
                        <span><i className="fa fa-times-circle" aria-hidden="true"></i></span><div style={{ lineHeight: "45%" }}><br></br></div>
                        검색하신 <strong>&#39;{search}&#39;</strong>을 포함하는 <span>메모가 존재하지 않습니다.</span><br></br>
                        제목 또는 내용에 포함된 키워드로 <span>다시 검색해주십시오.</span>
                    </NoneResult>
                }
            </div>
            {memos && memos.map((memo) => {
                return (
                    <MemoItemsWrapper key={memo.memoId}>
                        <IsStarButton style={{ flexGrow: "4" }} memoId={memo.memoId} isStar={memo.isStar} memoHasUsersCount={memo.memoHasUsersCount} />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <Link style={{ textDecoration: "none", flexGrow: "8" }} to={`/memos/${memo.memoId}`} onClick={storeFilterSearchScroll} >
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