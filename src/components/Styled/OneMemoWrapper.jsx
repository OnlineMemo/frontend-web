import React from "react";
import styled from "styled-components";
import '../../App.css';

const OneMemoWrapper = styled.div`
    background-color: #bcb8b1;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    padding: 12px 18.3px;

    min-height: calc(100vh - 271px + 43.5px);
    height: auto;

    font-size: 1.4rem;
    font-family: "LINESeedKR-Bd";
    word-spacing: 2.23px;
    line-height: 150%;

    .memoTitle {
        font-size: 1.55rem;
        text-align: center;
        text-decoration: none;

        position: relative;
        z-index: 0;
    }

    .memoContent {
        text-decoration: none;
        white-space: pre-wrap;

        word-break: break-all;
    }

    #aiTitleButton {
        display: flex;
        justify-content: center;
        align-items: center;
        height: calc(100% - 2px);
        
        position: absolute;
        left: calc(19vw + 3px + 50% + 9px);  // 38vw/2 + 6px/2 + 50%
        top: calc(50% - 0.5px);
        transform: translateY(-50%);
        
        background-color: #463f3a;
        font-family: "jua";
        font-size: 16.2px;
        color: white;
        padding: 0px 4px 1px 4px;
        border-radius: 5px;
        border-top: 2px solid #767676;
        border-left: 2px solid #767676;
        border-bottom: 2px solid #212121;
        border-right: 2px solid #212121;

        @media(max-width: 570px) {
            left: calc(19vw + 3px + 50% + 7.6px);  // 38vw/2 + 6px/2 + 50%
            padding: 1px 4px 1px 4px;
        }

        &:hover {
            cursor:pointer;
            background-color: #463f3aa4;
        }

        .fa-magic {
            display: 'inline-block';
            transform: scaleX(-1) translateX(15px);
            margin-right: -14.5px;
            margin-top: 2.7px;

            font-size: 16px;
            color: rgba(255, 255, 255, 0.4);
            opacity: 1;
            z-index: -1;
            text-shadow: 0 0 3px rgba(255, 217, 0, 0.723);
        }
    }

    hr {
        width: 53vw;
        background-color: black;
        height: 1.23px;
        border: 0px;

        transform: translateX(8px);

        @media(max-width: 570px) {
            width: calc(53vw + 25px);  // before: 53vw
        }
    }
`;

export default OneMemoWrapper;