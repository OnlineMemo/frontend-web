import React from "react";
import styled from "styled-components";
import '../../App.css';
import { useNavigate } from "react-router-dom";
import BasicWrapper from "../../components/Styled/BasicWrapper";
import { QRCodeSVG } from 'qrcode.react';

const MoreWrapper = styled(BasicWrapper)`
    display: flex;
    flex-direction: column;
    justify-content: center;

    position: relative;

    @media(max-height: 767.1px) {
        height: 100%;
    }

    @media(min-height: 767.2px) {
        height: calc(100vh - 271px);
    }

    @media(min-height: 767.2px) and (max-width: 1364.9px) {
        height: calc(100vh - 271px + 43.5px);
    }

    .fa-arrow-left {
        font-size: 2rem;
        color: #463f3a;

        border: solid 2.3px;
        border-radius: 6px;
        padding: 1px 6.7px;

        position: absolute;
        top: 11.5px;
        left: 16px;
        z-index: 10;

        &:hover {
            cursor:pointer;
            background-color: #463f3a;
            color: #bcb8b1;
            border-color: #463f3a;
        }
    }
`;

const DivWrapper = styled.div`
    display: flex;
    justify-content: center;

    padding-top: 35px;
    padding-bottom: 35px;

    font-size: 1.8rem;
    color: #322d2a;

    line-height: 130%;
    text-align: center;
    overflow-y: hidden;

    h5 {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        font-size: 2.1rem;
        margin: 0px;
        text-align: center;
    }

    ul {
        /* margin: 12.8px 0px; */
        padding-left: 21px;  // 32px
    }

    strong {
        font-size: 1.85rem;
    }

    a {
        text-decoration: none;
        color: #0059ff;

        &:hover {
            cursor:pointer;
            color: blue;
        }
    }

    .notCenter {
        text-align: left;

        ul {
            margin-top: 3px;
            margin-bottom: 3px;
        }
    }
`;

const playStoreUrl = "https://play.google.com/store/apps/details?id=com.shj.onlinememo";

const QRimage = () => {
    const url = playStoreUrl;
    const qrSize = 85;
    return (
        <QRCodeSVG value={url} size={qrSize} bgColor="#bcb8b1" />
    );
};

const Download = () => {
    return (
        <div>
            {/* <br></br><br></br> */}

            <div style={{ lineHeight: "130%" }}><br></br></div>
            <h5>&lt;&nbsp;Android&nbsp;&nbsp;<i className="fa fa-android" aria-hidden="true"></i>&nbsp;&gt;</h5>
            {/* <div style={{ lineHeight: "35%" }}><br></br></div> */}
            <div style={{ lineHeight: "70%" }}><br></br></div>
            <QRimage />
            <div className="notCenter">
                <ul>
                    <li>방법 1: Play Store 다운로드:&nbsp;&nbsp;<a href={playStoreUrl} aria-label="Play Store에서 온라인 메모장 앱 다운로드"><i className="fa fa-download" aria-hidden="true"></i></a></li>
                    <li>방법 2: iOS와 동일한 방법으로 설치</li>
                </ul>
            </div>
            <div style={{ lineHeight: "150%" }}><br></br></div>

            <h5>&lt;&nbsp;iOS&nbsp;&nbsp;<i className="fa fa-apple" aria-hidden="true"></i>&nbsp;&gt;</h5>
            <div style={{ lineHeight: "35%" }}><br></br></div>
            별도의 앱 다운로드 없이<br></br>
            밑의 과정으로 앱 설치가 가능합니다.
            <div style={{ lineHeight: "20%" }}><br></br></div>
            <div className="notCenter">
                <ul>
                    <li>과정 1: Chrome 또는 Safari 앱 접속</li>
                    <li>과정 2: 'www.OnlineMemo.kr' 이동</li>
                    <li>과정 3: 옵션의 '홈 화면에 추가' 클릭</li>
                </ul>
            </div>
            <div style={{ lineHeight: "165%" }}><br></br></div>

            <strong>
                <i className="fa fa-arrow-down" aria-hidden="true"></i>
                <div style={{ lineHeight: "70%" }}><br></br></div>
                풀스크린으로 쾌적하게 이용 가능
            </strong>
            <div style={{ lineHeight: "185%" }}><br></br></div>

            {/* <br></br><br></br> */}
        </div>
    );
}

function DownloadPage(props) {
    const navigate = useNavigate();

    return (
        <MoreWrapper>
            <i className="fa fa-arrow-left" aria-hidden="true" onClick={() => { navigate(-1) }}></i>
            <DivWrapper className="flex-container">
                <Download />
            </DivWrapper>
        </MoreWrapper>
    );
}

export default DownloadPage;