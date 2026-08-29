import React from "react";
import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
`;

const Shimmer = styled.div`
    background: linear-gradient(90deg, #e8dc8a 25%, #fef7cc 50%, #e8dc8a 75%);
    background-size: 600px 100%;
    animation: ${shimmer} 1.5s infinite linear;
    border-radius: 4px;
`;

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 6px;

    & > * + * {
        margin-top: 6px;
    }
`;

const Card = styled.div`
    width: calc(100% - 36px);
    padding: 12.5px;
    display: flex;
    flex-direction: row;
    align-items: center;
    background: #fef5c6;
    border-bottom: 2.2px solid #463f3a;
    border-radius: 9px;
    box-shadow: 0px 0.7px;
`;

const StarCircle = styled(Shimmer)`
    width: 17px;
    height: 17px;
    flex-shrink: 0;
    border-radius: 50%;
`;

const Middle = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    flex: 1;
    margin: 0 14px;
`;

const TitleDateCol = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 37px;
`;

const TitleBar = styled(Shimmer)`
    width: 130px;
    height: 19px;
`;

const DateBar = styled(Shimmer)`
    width: 85px;
    height: 13px;
`;

const UserBlock = styled(Shimmer)`
    width: 58px;
    height: 37px;
`;

const DotsBar = styled(Shimmer)`
    width: 5px;
    height: 20px;
    flex-shrink: 0;
    border-radius: 3px;
`;

const skeletonCount = 5;

function MemoListSkeleton() {
    return (
        <Wrapper>
            {Array.from({ length: skeletonCount }).map((_, i) => (
                <Card key={i}>
                    <StarCircle style={{ animationDelay: `${i * 0.07}s` }} />
                    <Middle>
                        <TitleDateCol>
                            <TitleBar style={{ animationDelay: `${i * 0.07}s` }} />
                            <DateBar style={{ animationDelay: `${i * 0.07}s` }} />
                        </TitleDateCol>
                        <UserBlock style={{ animationDelay: `${i * 0.07}s` }} />
                    </Middle>
                    <DotsBar style={{ animationDelay: `${i * 0.07}s` }} />
                </Card>
            ))}
        </Wrapper>
    );
}

export default MemoListSkeleton;