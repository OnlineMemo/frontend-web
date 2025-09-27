import React, { useState, useEffect } from "react";
import Apis from "../../apis/Api";

function IsStarButton(props) {
    const { memoId, isStar, memoHasUsersCount } = props;

    const [nowIsStar, setNowIsStar] = useState(isStar);

    const handleIsStarClick = async (starValue, e) => {
        setNowIsStar(starValue);  // toggle

        await Apis
            .put(`/memos/${memoId}`, {
                title: null,
                content: null,
                isStar: starValue
            })
            .then((response) => {
                //console.log(response);
            })
            .catch((error) => {
                //console.log(error);
            })
    }

    let isStarButton;
    if (memoHasUsersCount && memoHasUsersCount > 1) {  // 개인메모가 아닌 공동메모일 경우에는, 별이 아닌 다른 그림을 보여주어 즐겨찾기 기능 사용불가하도록 해제시킴.
        isStarButton = <i className="fa fa-users" aria-hidden="true"></i>;
    }
    else {  // 개인메모일 경우에는, 별 그림을 보여주어 즐겨찾기 기능 사용가능하도록 함.
        nowIsStar && nowIsStar
            ? isStarButton = <i className="fa fa-star" aria-hidden="true" onClick={(event) => handleIsStarClick(0, event)}></i>  // isStar이 1이면 꽉찬 별 버튼
            : isStarButton = <i className="fa fa-star-o" aria-hidden="true" onClick={(event) => handleIsStarClick(1, event)}></i>  // isStar이 0이면 속이빈 별 버튼
    }


    return (
        <div style={{display: "inline-block"}}>
            {isStarButton}
        </div>
    );
}

export default IsStarButton;