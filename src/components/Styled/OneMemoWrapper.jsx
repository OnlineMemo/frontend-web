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
        height: calc(100% - 3px);
        
        position: absolute;
        left: calc(19vw + 3px + 50% + 11px);  // 38vw/2 + 6px/2 + 50%
        top: calc(50% - 0.5px);
        transform: translateY(-50%);
        
        background-color: #463f3a;
        font-family: "jua";
        font-size: 15px;
        color: white;
        padding: 1px 5px 1px 5px;  // 1px 6px 1px 6px
        border-radius: 5px;
        border-top: 2px solid #767676;
        border-left: 2px solid #767676;
        border-bottom: 2px solid #212121;
        border-right: 2px solid #212121;

        @media(max-width: 570px) {
            left: calc(19vw + 3px + 50% + 7.6px);  // 38vw/2 + 6px/2 + 50%
        }

        &:hover {
            cursor:pointer;
            background-color: #463f3aa4;
        }

        .fa-magic {
            margin-left: 4px;
            font-size: 13px;
        }
    }

    hr {
        width: 53vw;
        background-color: black;
        height: 1.23px;
        border: 0px;

        @media(max-width: 570px) {
            width: calc(53vw + 7px);  // before: 53vw
        }
    }
`;

export default OneMemoWrapper;