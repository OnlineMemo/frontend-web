const metaData = {
  default: {
    title: "온라인 메모장",
    description: "📝 모든 기기에서 간편하게 메모를 작성하고, 친구와 공동 편집도 가능한 온라인 메모장입니다. 📝",
  },
  "/signup": {
    title: "온라인 메모장 - 회원가입",
    description: "심플 회원가입 - 생성할 ID/PW만 입력하고, 개인정보 없이 빠르게 가입해 메모를 관리해요.",  // or '심플 회원가입 - 생성할 ID/PW만 입력하면, 개인정보 없이 빠르게 가입하고 메모를 관리할 수 있어요.'
  },
  "/notice": {
    title: "온라인 메모장 - 공지사항",
    description: "이용방법 안내 - 웹 주소는 OnlineMemo.kr 이며, 로그인 상태가 2주간 안전하게 유지됩니다.",  // or '이용방법 안내 – 웹사이트 주소는 OnlineMemo.kr 이며, 문의는 기재된 메일로 부탁드립니다.'
  },
  "/download": {
    title: "온라인 메모장 - 다운로드 안내",
    description: "모바일 앱 지원 - 웹은 물론, Android · iOS 앱에서도 쾌적한 풀스크린 환경을 제공합니다.",
  },
  "/password": {
    title: "온라인 메모장 - 비밀번호 변경",
  },
  "/information": {
    title: "온라인 메모장 - 개발 정보",
  },
};

const getTitle = (pathName) => {
  return metaData[pathName]?.title || metaData.default.title;
};

const getDescription = (pathName) => {
  return metaData[pathName]?.description || metaData.default.description;
};

const getCanonical = (pathName) => {
  return pathName === "/login"
    ? "https://www.onlinememo.kr/"
    : `https://www.onlinememo.kr${pathName}`;
};

export { metaData, getTitle, getDescription, getCanonical };