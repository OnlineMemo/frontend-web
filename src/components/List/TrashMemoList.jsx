import React from "react";
import styled from "styled-components";

const TrashMemosWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    & > * {
        :not(:last-child) {
            margin-bottom: 6px;
        }
    }
`;

const TrashMemoItemsWrapper = styled.div`
    width: calc(100% - 36px);
    padding: 12.5px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    background: #fef5c6;
    border-bottom: 2.2px solid #463f3a;
    box-shadow: 0px 0.7px;
    border-radius: 9px;
    cursor: pointer;
    :hover {
        background: #faeb9e;
    }

    .fa-trash {
        font-size: 1.7rem;
        color: #7d3d15;
    }
`;

const TitleRemainWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    height: 37px;
    flex-wrap: nowrap;
    justify-content: space-between;

    color: #463f3a;

    .titleDiv {
        font-size: 1.8rem;

        height: 18.6px;
        overflow: hidden;
    }

    .remainDiv {
        font-size: 1.13rem;

        height: 13.1px;
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

function TrashMemoList(props) {
    const { trashMemos, isFirstGetTrashMemos } = props;

    const getRemainText = (remainDays) => {
        return remainDays === 0 ? "오늘 삭제" : `${remainDays}일 후 삭제`;
    }


    return (
        <TrashMemosWrapper>
            {(isFirstGetTrashMemos && trashMemos.length === 0) &&  // 휴지통이 비어있을 경우
                <NoneResult>
                    <span><i className="fa fa-times-circle" aria-hidden="true"></i></span><div style={{ lineHeight: "45%" }}><br></br></div>
                    휴지통이 비어 있습니다.<br></br>
                    삭제한 메모는 이곳에 30일간 보관됩니다.
                </NoneResult>
            }

            {trashMemos && trashMemos.map((trashMemo) => {
                return (
                    <TrashMemoItemsWrapper key={trashMemo.memoId}>
                        <i className="fa fa-trash" aria-hidden="true"></i>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <TitleRemainWrapper style={{ flexGrow: "8" }}>
                            <div className="titleDiv">{trashMemo.title && trashMemo.title}</div>
                            <div className="remainDiv">{getRemainText(trashMemo.remainDays)}</div>
                        </TitleRemainWrapper>
                    </TrashMemoItemsWrapper>
                );
            })}
        </TrashMemosWrapper>
    );
}

export default TrashMemoList;
