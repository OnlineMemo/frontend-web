import React from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import styled from "styled-components";
import './App.css';
import LoadingNav from "./components/Navigation/LoadingNav";
import BasicWrapper from "./components/Styled/BasicWrapper";
import { retryLazy } from "./utils/lazyUtil.js"
const LazyLoad = (path) => retryLazy(() => import(`${path}`));
const NoLoginNav = LazyLoad("./components/Navigation/NoLoginNav");
const LoginPage = LazyLoad("./pages/User/LoginPage");
const SignupPage = LazyLoad("./pages/User/SignupPage");
const ChangePwPage = LazyLoad("./pages/User/ChangePwPage");
const YesLoginNav = LazyLoad("./components/Navigation/YesLoginNav");
const MemoListPage = LazyLoad("./pages/Memo/MemoListPage");
const InformationPage = LazyLoad("./pages/Etc/InformationPage");
const ReadAndEditMemoPage = LazyLoad("./pages/Memo/ReadAndEditMemoPage");
const NewMemoPage = LazyLoad("./pages/Memo/NewMemoPage");
const UserProfilePage = LazyLoad("./pages/User/UserProfilePage");
const FriendListPage = LazyLoad("./pages/Friend/FriendListPage");
const SenderListPage = LazyLoad("./pages/Friend/SenderListPage");
const NoticePage = LazyLoad("./pages/Etc/NoticePage");
const DownloadPage = LazyLoad("./pages/Etc/DownloadPage");

const MainTitleText = styled.header`
    font-size: 3rem;
    text-align: center;
    font-family: "KOTRAHOPE";
    margin: 9px 0px;
    color: #463f3a;

    @media(min-width: 1365px) {
        font-size: 3.3rem;
        margin: 18px 0px;
    }
`;

const LittleTitle = styled.div`
    font-size: 1.25rem;
    text-align: center;
    font-family: "KOTRAHOPE";
    color: #463f3a;

    @media(min-width: 1365px) {
        font-size: 1.7rem;
    }
`;

function HelmetComponent() {
  const location = useLocation();
  const pathName = location.pathname || "/";

  const getHelmetTitle = () => {
    let helmetTitle = "온라인 메모장";
    if (pathName === "/signup") helmetTitle += " - 회원가입";
    else if (pathName === "/password") helmetTitle += " - 비밀번호 변경";
    else if (pathName === "/information") helmetTitle += " - 개발 정보";
    else if (pathName === "/notice") helmetTitle += " - 공지사항";
    else if (pathName === "/download") helmetTitle += " - 다운로드 안내";
    return helmetTitle;
  }

  const getHelmetCanonical = () => {
    let helmetCanonical = "https://www.onlinememo.kr";
    if (pathName === "/login") helmetCanonical += "/";
    else helmetCanonical += pathName;
    return helmetCanonical;
  }

  return (
      <Helmet>
        <title>{getHelmetTitle()}</title>
        {/* <meta name="description" content="📝 모든 기기에서 간편하게 메모를 작성하고, 친구와 공동 편집도 가능한 온라인 메모장입니다. 📝" data-react-helmet="true"/> */}
        <link rel="canonical" href={getHelmetCanonical()} />
      </Helmet>
  );
}

function App(props) {

  return (
    <BrowserRouter>
      <HelmetComponent />

      <MainTitleText>
        <Link to="/" style={{textDecoration: "none", color:"#463f3a"}}>
          온라인 메모장 <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
          <LittleTitle>OnlineMemo.kr</LittleTitle>
        </Link>
      </MainTitleText>
      <React.Suspense fallback={<div><LoadingNav></LoadingNav><BasicWrapper><div style={{textAlign: "center", fontSize: "16px"}}>loading...</div></BasicWrapper></div>}>
        <Routes>
          <Route index element={<NoLoginNav />} />
          <Route path="login" element={<NoLoginNav />} />
          <Route path="signup" element={<NoLoginNav />} />
          <Route path="password" element={<NoLoginNav />} />
          <Route path="information" element={<NoLoginNav />} />
          <Route path="notice" element={<NoLoginNav />} />
          <Route path="download" element={<NoLoginNav />} />

          {/* <Route path="/memos" element={<YesLoginNav />} /> */}  {/* MemoListPage인 경우는 따로 병합해두었음. */}
          <Route path="/users" element={<YesLoginNav />} />
          <Route path="/friends" element={<YesLoginNav />} />
          <Route path="/senders" element={<YesLoginNav />} />
        </Routes>
        
        <Routes>
          <Route index element={<LoginPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="password" element={<ChangePwPage />} />
          <Route path="information" element={<InformationPage />} />
          <Route path="notice" element={<NoticePage />} />
          <Route path="download" element={<DownloadPage />} />

          <Route path="/memos" element={<MemoListPage />} />
          <Route path="/users" element={<UserProfilePage />} />
          <Route path="/friends" element={<FriendListPage />} />
          <Route path="/senders" element={<SenderListPage />} />

          <Route path="/memos/:memoId" element={<ReadAndEditMemoPage />} />
          <Route path="/memos/new-memo" element={<NewMemoPage />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default App;