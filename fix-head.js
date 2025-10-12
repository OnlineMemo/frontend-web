const fs = require('fs');
const glob = require('glob');


// ================ < Get Files > ================ //

// - html files
const htmlFiles = [
  ...glob.sync('build/index.html'),
  ...glob.sync('build/**/*.html'),
];
const uniqueHtmlFiles = [...new Set(htmlFiles)];

// - font files
// const fontFiles = [
//   ...glob.sync('build/static/media/*.woff2'),
//   ...glob.sync('build/static/media/*.woff'),
//   ...glob.sync('build/static/media/*.ttf'),
// ];
// const uniqueFontFiles = [...new Set(fontFiles)];

// - css files
const cssFiles = [
  ...glob.sync('build/global/globalStyle.css'),
  ...glob.sync('build/global/font-awesome.shj.css'),
];
const uniqueCssFiles = [...new Set(cssFiles)];

// - asset fileNames
const assetManifest = JSON.parse(fs.readFileSync('build/asset-manifest.json', 'utf8'));
const assetObjMap = assetManifest.files;


// ================ < Fix Head > ================ //

uniqueHtmlFiles.forEach(htmlFile => {
  let html = fs.readFileSync(htmlFile, 'utf8');

  // - postbuild 시 비활성화할 커스텀 태그 제거 (true,'true',"true" 모두 감지 가능)
  // !!! 주의 : 내부에 텍스트 외 '다른 태그' 또는 '<'가 존재하면 data-disable-build 옵션 부여금지 !!!
  // ex X. <태그명 data-disable-build="true"><div><span>내용</span></div></태그명> => 제거없이 유지됨
  // ex X. <태그명 data-disable-build="true">내용1<내용2</태그명> => 앞부분만 제거됨 '내용1<내용2</태그명>'
  // ex 1. <태그명 data-disable-build="true">내용1>내용2</태그명> => 제거 O (우선순위 1-1)
  // ex 2. <태그명 data-disable-build="true">내용</태그명> => 제거 O (우선순위 1-2)
  // ex 3. <태그명 data-disable-build="true" /> => 제거 O (우선순위 2-1)
  // ex 4. <태그명 data-disable-build="true"> => 제거 O (우선순위 2-2)
  const disableBuildRegex = /(?<!<!--\s*)<([a-z][a-z0-9]*)\b[^>]*\sdata-disable-build\s*=\s*(?:["']true["']|true)[^>]*>[^<]*<\/\1>|(?<!<!--\s*)<[^>]*\sdata-disable-build\s*=\s*(?:["']true["']|true)[^>]*\/?>/gi;  // '<!--' 주석으로 시작하지 않아야함.
  html = html.replace(disableBuildRegex, '');

  // - 첫번째 이외의 모든 중복 Toast CSS 제거
  // const toastStyleRegex = /<style[^>]*>[\s\S]*?:root\{--toastify-color-light[\s\S]*?<\/style>/gi;
  // const matches = html.match(toastStyleRegex);
  // if (matches && matches.length > 1) {
  //   for (let i = 1; i < matches.length; i++) {
  //     html = html.replace(matches[i], '');
  //   }
  // }
  // - 모든 Toast CSS 제거 (런타임에 1회 추가 재생성됨.)
  const toastStyleRegex = /<style[^>]*>[\s\S]*?:root\{--toastify-color-light[\s\S]*?<\/style>/gi;
  html = html.replace(toastStyleRegex, '');

  // - 첫번째 이외의 모든 중복 styled Components CSS 제거
  // (비록 런타임에 1회 추가 재생성되지만, SEO 크롤러를 위해 중복 2회까지 허용.)
  const styledComponentsRegex = /<style[^>]*data-styled="active"[^>]*data-styled-version="[^"]*"[^>]*>([\s\S]*?)<\/style>/gi;
  const innerContentSet = new Set();
  html = html.replace(styledComponentsRegex, (match, innerContent) => {  // innerContent는 <style>여기</style> 내부 CSS 내용을 의미
    const trimmedContent = innerContent.trim();
    if (!innerContentSet.has(trimmedContent)) {  // 첫번째 내용이면 유지
      innerContentSet.add(trimmedContent);
      return match;
    }
    else {  // 중복된 내용이면 제거
      return '';
    }
  });

  // - meta charset을 맨 위로 이동
  html = html.replace(/<meta[^>]*charset[^>]*>/gi, '');
  html = html.replace(/<head[^>]*>/i, match => `${match}<meta charset="UTF-8" />`);

  // - font 파일정보 정리
  // const fontObjMap = {};
  // uniqueFontFiles.forEach(fontFile => {  // build/static/media/name.hash.woff2
  //   const fontPath = fontFile.replace(/^.*(?=\/static)/, '');  // /static/media/name.hash.woff2
  //   const buildName = fontPath.split('/').pop();  // name.hash.woff2
  //   const ext = buildName.split('.').pop();  // woff2
  //   const originName = `${buildName.split('.')[0]}.${ext}`;  // name.woff2

  //   fontObjMap[originName] = {
  //     staticPath: fontPath,
  //   };
  // });

  // - head 태그의 맨 뒤에 <style>global.css & fontawesome.css<style> 스타일 삽입
  let cssOptions = [];
  uniqueCssFiles.forEach(cssFile => {
    let css = fs.readFileSync(cssFile, 'utf8');
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');  // CSS 주석 제거 ('/* */' 형태)
    css = css.replace(/\s+/g, ' ').trim();  // 연속공백 1칸으로 최소화 (minify 최적화)

    css = css.replace(/url\((['"]?)([^'")]+)\1\)/gi, (match, _, fontPath) => {
      if (fontPath.startsWith('http://') || fontPath.startsWith('https://')) {
        return match;
      }
      const fontOriginFName = fontPath.includes('/') ? fontPath.split('/').pop() : fontPath;
      const fontStaticPath = assetObjMap[`static/media/${fontOriginFName}`];
      if (fontStaticPath) {
        return `url('${fontStaticPath}')`;
      }
      else {
        return match;
      }
    });
    cssOptions.push(css);
  });
  const styleTagWithCss = `<style>${cssOptions.join('')}</style>`;
  html = html.replace(/<\/head>/i, `${styleTagWithCss}</head>`);

  fs.writeFileSync(htmlFile, html, 'utf8');
});


// ============== < Run Completed > ============== //

// - 프로덕션에 불필요한 build 파일 삭제
const publicBuildDir = ['build/global', 'build/dev'];  // 디렉토리
publicBuildDir.forEach(dir => {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  } catch (err) {
    console.error(`❌ fix-head.js 실행 실패! : 디렉토리 삭제 ERROR`);
  }
});

console.log(`✅ fix-head.js 실행 완료!`);