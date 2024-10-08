import React from "react";
import styled from "styled-components";
import MemoOptionDropdownRight from "./MemoOptionDropdownRight";

const MemoOptionWrapper = styled.div`
    display: "inline-block";

    ul li {
        font-size:2rem;
        list-style: none;
        line-height:44px;
        color: #ffffff;
    }

    a {
        text-decoration:none;
        font-size:2rem;
        color: #ffffff;
        border-left: #bcb8b1 solid 2px;
        border-right: #bcb8b1 solid 2px;
        padding: 1px 7px;

        &:hover {
            color: #463f3a;
            background-color: #bcb8b1;
            border-left: #463f3a solid 2px;
            border-right: #463f3a solid 2px;
        }
    }
`;

function MemoOptionButton(props) {
    const { memoId, userResponseDtoList, memoHasUsersCount, allFriends, getMemos } = props;

    const dropItemsGroupOption = [
        {
            name: "친구 초대",
        },
        {
            name: "그룹 탈퇴",
        },
    ]

    const dropItemsPrivateOption = [
        {
            name: "친구 초대",
        },
        {
            name: "메모 삭제",
        },
    ]

    let dropItemsOption;
    if (memoHasUsersCount > 1) {  // 개인메모가 아닌 공동메모일 경우에
        dropItemsOption = dropItemsGroupOption;
    }
    else {  // 개인메모일 경우에
        dropItemsOption = dropItemsPrivateOption;
    }


    return (
        <MemoOptionWrapper>
            <MemoOptionDropdownRight
                dropMain={<i className="fa fa-ellipsis-v" aria-hidden="true"></i>}
                dropItems={dropItemsOption}
                memoId={memoId}
                userResponseDtoList={userResponseDtoList}
                allFriends={allFriends}
                getMemos={getMemos}
            />
        </MemoOptionWrapper>
    );
}

export default MemoOptionButton;