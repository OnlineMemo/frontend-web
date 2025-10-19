import React, { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import styled, { StyleSheetManager } from "styled-components";
import LoadingNav from "./components/Navigation/LoadingNav";
import BasicWrapper from "./components/Styled/BasicWrapper";
import { retryLazy } from "./utils/lazyUtil"
import { parseToken } from "./utils/TokenUtil"
import { getTitle, getDescription, getCanonical } from "./utils/MetaUtil"

// Preload Font
import HeaderFont from './assets/fonts/KOTRAHOPE_subset_header.woff2';
// import FooterFont from './assets/fonts/Kalam-Regular_subset_footer.woff2';
// import MainFont from './assets/fonts/BMJUA_ttf.woff2';
// import FontAwesomeFont from './assets/fontawesome/fontawesome-webfont.woff2';

// Eager Suspense
import Header from './components/Core/Header';
import Footer from './components/Core/Footer';
import GA4Tracker from './components/Core/GA4Tracker';
import Toast from './components/Core/Toast';
import NoLoginNav from "./components/Navigation/NoLoginNav"
import LoginPage from "./pages/User/LoginPage"
import SignupPage from "./pages/User/SignupPage"
import NoticePage from "./pages/Etc/NoticePage"
import DownloadPage from "./pages/Etc/DownloadPage"
import GlobalModal from "./components/Modal/GlobalModal";

// Lazy Suspense
const LazyLoad = (path) => retryLazy(() => import(`${path}`));
const YesLoginNav = LazyLoad("./components/Navigation/YesLoginNav");
const ChangePwPage = LazyLoad("./pages/User/ChangePwPage");
const MemoListPage = LazyLoad("./pages/Memo/MemoListPage");
const InformationPage = LazyLoad("./pages/Etc/InformationPage");
const ReadAndEditMemoPage = LazyLoad("./pages/Memo/ReadAndEditMemoPage");
const NewMemoPage = LazyLoad("./pages/Memo/NewMemoPage");
const ProfilePage = LazyLoad("./pages/User/ProfilePage");
const FriendListPage = LazyLoad("./pages/Friend/FriendListPage");
const SenderListPage = LazyLoad("./pages/Friend/SenderListPage");
const NotFoundPage = LazyLoad("./pages/Etc/NotFoundPage");
const StatisticPage = LazyLoad("./pages/BackOffice/StatisticPage");


// =========== < Lazy (Suspense, CSSOM) > =========== //

function LoadingComponent() {
  return (
    <div>
      <LoadingNav />
      <BasicWrapper>
        <div style={{textAlign: "center", fontSize: "16px"}}>
          loading...
        </div>
      </BasicWrapper>
    </div>
  );
}

const wrapComponent = (children, isSSR = false) => {
  if (isSSR === false) {
    return wrapSuspense(children);  // CSR (Lazy Loading)
  }
  else {
    return wrapWithStyleTag(children);  // SSR (Disable CSSOM)
  }
}

// - hydration 오류 (#418, #423) 해결 :
// !!! 이는 'SEO 크롤러에 노출된 SSR 페이지'를 제외하고, 'CSR 페이지'에만 적용할것. !!!
// SSR 페이지는 즉시 렌더링하여, 서버와 클라이언트의 렌더링 출력이 일치하도록 해결함.
// CSR 페이지는 이 함수로 래핑해, 기존처럼 지연 로딩을 정상적으로 적용하면 됨.
const wrapSuspense = (children) => (  // for 'CSR 페이지'
  <React.Suspense fallback={<LoadingComponent />}>
    {children}
  </React.Suspense>
);

// !!! 이는 'CSR 페이지'를 제외하고, 'SEO 크롤러에 노출된 SSR 페이지 및 컴포넌트'에만 적용할것. !!!
// 기존 Styled Components 스타일은 JS로 CSS가 추가되는 방식이므로, prerender 크롤링 시
// 빌드된 index.html에 CSS 옵션이 적용되지 않아, Layout Shift 발생하며 CLS 수치가 안좋아짐.
// 따라서 SSR 페이지 및 컴포넌트를 이 함수로 래핑해, head의 <style> 태그에 포함시켜 최적화하면 됨.
const wrapWithStyleTag = (children) => (
  <StyleSheetManager disableCSSOMInjection>
    {children}
  </StyleSheetManager>
);


// ============ < Route (GA4, Router) > ============ //

function RouteComponent() {
  const location = useLocation();
  const [isAdminUser, setIsAdminUser] = useState(false);

  const currentRoute = useMemo(() => {
    if (isAdminUser === true) {
      return (
        <Routes>
          <Route path="/statistics" element={wrapComponent(<StatisticPage />)} />
          <Route path="*" element={<Navigate to="/statistics" replace />} />
        </Routes>
      );
    }

    return (
      <Routes>
        {/* 기본 라우트 */}
        <Route index element={wrapComponent(<><NoLoginNav /><LoginPage /></>, true)} />

        {/* 비로그인 및 로그인 사용자용 - Nav가 분리된 페이지 */}
        <Route path="/login" element={wrapComponent(<><NoLoginNav /><LoginPage /></>, true)} />
        <Route path="/signup" element={wrapComponent(<><NoLoginNav /><SignupPage /></>, true)} />
        <Route path="/password" element={wrapComponent(<><NoLoginNav /><ChangePwPage /></>)} />
        <Route path="/information" element={wrapComponent(<><NoLoginNav /><InformationPage /></>)} />
        <Route path="/notice" element={wrapComponent(<><NoLoginNav /><NoticePage /></>, true)} />
        <Route path="/download" element={wrapComponent(<><NoLoginNav /><DownloadPage /></>, true)} />

        {/* 로그인 사용자용 - Nav가 분리된 페이지 */}
        <Route path="/users" element={wrapComponent(<><YesLoginNav /><ProfilePage /></>)} />
        <Route path="/friends" element={wrapComponent(<><YesLoginNav /><FriendListPage /></>)} />
        <Route path="/senders" element={wrapComponent(<><YesLoginNav /><SenderListPage /></>)} />

        {/* 로그인 사용자용 - Nav가 병합된 페이지 */}
        <Route path="/memos" element={wrapComponent(<MemoListPage />)} />
        <Route path="/memos/:memoId" element={wrapComponent(<ReadAndEditMemoPage />)} /> {/* 또는 path="/memos/:memoId(\d+) 정규표현식 적용할것. */}
        <Route path="/memos/new-memo" element={wrapComponent(<NewMemoPage />)} />

        {/* 404 Not Found 페이지 - GA4 이벤트 단일 */}
        <Route path="*" element={wrapComponent(<><NoLoginNav /><NotFoundPage /></>)} />

        {/* 404 Not Found 페이지 - GA4 이벤트 중복 */}
        {/* <Route path="/404" element={wrapComponent(<><NoLoginNav /><NotFoundPage /></>)} />
        <Route path="*" element={<Navigate to="/404" replace />} /> */}
      </Routes>
    );
  }, [isAdminUser]);

  useEffect(() => {
    if (!location?.pathname) return;
    setIsAdminUser(parseToken().isAdminUser);
  }, [location?.pathname]);

  return (
    <>
      <GA4Tracker />
      {currentRoute}
    </>
  );
}


// ============= < Main (Helmet, App) > ============= //

function HelmetComponent() {
  const location = useLocation();
  const pathName = location?.pathname || "/";

  const preloadFont = (href, fetchpriority = null) => {
    return (
      <link rel="preload" href={href}
        as="font" type="font/woff2" crossOrigin="anonymous"
        {...(fetchpriority ? { fetchpriority } : {})}
      />
    );
  };

  return (
      <Helmet htmlAttributes={{ lang: "ko" }}>
        <title>{getTitle(pathName)}</title>
        <meta name="description" content={getDescription(pathName)} />
        <link rel="canonical" href={getCanonical(pathName)} />

        {preloadFont(HeaderFont, "high")}  {/* high : 레이아웃 최상단으로서 Layout Shift 최소화하기위함. */}
        {/* {preloadFont(FooterFont, "low")}  {/ low : 레이아웃 최하단이라 preload 중 로딩이 늦어도 무관함. /} */}
        {/* {preloadFont(MainFont, "high")}  {/ high : 용량이 크므로 로딩 완료시점을 앞당기기위함. /} */}
        {/* {preloadFont(FontAwesomeFont)} */}
      </Helmet>
  );
}

function App(props) {
  // const [isCrawlTime, setIsCrawlTime] = useState(true);  // SSR hydration 크롤러가 첫 렌더링 중일때

  useEffect(() => {
    // setIsCrawlTime(false);

    const applyStyle = (element) => {
      // 길게 터치해 이동 시, 나타나는 링크 미리보기 창 방지
      if (!element.hasAttribute('draggable')) {
        element.setAttribute('draggable', 'false');
      }
      // 길게 터치 시, 나타나는 페이지 미리보기 창 방지
      element.style.webkitTouchCallout = 'none';  // -webkit-touch-callout: none;
      // 텍스트 드래그 선택 방지
      element.style.webkitUserSelect = 'none';  // -webkit-user-select: none;
      element.style.userSelect = 'none';  // user-select: none;
    };

    const observer = new MutationObserver(() => {
      const dragElements = document.querySelectorAll('a, img');
      dragElements.forEach(dragElement => applyStyle(dragElement));
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // 초기에도 한 번 적용
    const initElements = document.querySelectorAll('a, img');
    initElements.forEach(initElement => applyStyle(initElement));

    return () => observer.disconnect();
  }, []);

  
  return (
    <>
      {/* [ Header ] */}
      <HelmetComponent />
      {wrapComponent(<Header />, true)}
      
      {/* [ Content ] */}
      <RouteComponent />
      {/*
        {isCrawlTime === true ? (  // hydration 오류(#418, #423) 해결 : 서버와 클라이언트의 렌더링 출력이 일치하도록 함.
          <RouteComponent />
        ) : (
          <React.Suspense fallback={<LoadingComponent />}>
            <RouteComponent />
          </React.Suspense>
        )}
      */}

      {/* [ Footer ] */}
      {wrapComponent(<Footer />, true)}

      {/* [ Notification ] */}
      <Toast />
      {wrapComponent(<GlobalModal />, true)}  {/* 테스트 결과, 높이에 영향을 주므로 SSR 스타일 적용 필요. */}
    </>
  );
}

export default App;