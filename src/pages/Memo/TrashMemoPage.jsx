import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import OneMemoWrapper from "../../components/Styled/OneMemoWrapper";
import TrashMemoNav from "../../components/Navigation/TrashMemoNav";
import ReadMemoSkeleton from "../../components/UI/ReadMemoSkeleton";
import { checkToken } from "../../utils/TokenUtil"
import Apis from "../../apis/Api";

function TrashMemoPage(props) {
    const navigate = useNavigate();
    const { memoId } = useParams();

    const [trashMemo, setTrashMemo] = useState();

    const getRemainText = (remainDays) => {
        return remainDays === 0 ? "오늘 삭제" : `${remainDays}일 후 삭제`;
    }

    async function getTrashMemo() {  // 해당 사용자의 휴지통 메모 1개 조회
        await Apis
            .get(`/memos/trash/${memoId}`)
            .then((response) => {
                setTrashMemo(response.data.data);
            })
            .catch((error) => {
                //console.log(error);
            })
    }

    useEffect(() => {
        checkToken();
        if (memoId && !/^\d+$/.test(memoId)) {  // '/memos/trash/숫자' 경로가 아닌 경우, 404 페이지로 이동
            navigate('/404');
        }
        getTrashMemo();
    }, []);


    return (
        <div>
            {trashMemo &&
                <Helmet>
                    <title>{trashMemo.title} (온라인 메모장)</title>
                </Helmet>
            }

            <TrashMemoNav
                memoId={memoId}
                content={trashMemo && trashMemo.content}
            />
            <OneMemoWrapper>
                {!trashMemo
                    ? <ReadMemoSkeleton isTrashMemo={true} />
                    : <div>
                        <div className="memoTitle">{trashMemo.title}</div>
                        <div className="memoSubTitle">({getRemainText(trashMemo.remainDays)})</div>
                        <hr></hr>
                        <div className="memoContent">{trashMemo.content}</div>
                    </div>
                }
            </OneMemoWrapper>
        </div>
    );
}

export default TrashMemoPage;
