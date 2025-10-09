const fs = require('fs');
const glob = require('glob');


// ================ < Get Files > ================ //

const htmlFiles = [
  ...glob.sync('build/index.html'),
  ...glob.sync('build/**/*.html'),
];
const uniqueHtmlFiles = [...new Set(htmlFiles)];

const cssFiles = [
  ...glob.sync('build/fontawesome/font-awesome.shj.css'),
];
const uniqueCssFiles = [...new Set(cssFiles)];


// ================ < Fix Head > ================ //

uniqueHtmlFiles.forEach(file => {
  let html = fs.readFileSync(file, 'utf8');

  const toastStyleRegex = /<style[^>]*>[\s\S]*?:root\{--toastify-color-light[\s\S]*?<\/style>/gi;
  // - 첫번째 이외의 모든 중복 Toast CSS 제거
  // const matches = html.match(toastStyleRegex);
  // if (matches && matches.length > 1) {
  //   for (let i = 1; i < matches.length; i++) {
  //     html = html.replace(matches[i], '');
  //   }
  // }
  // - 모든 Toast CSS 제거 (런타임에 1회 추가 재생성됨.)
  html = html.replace(toastStyleRegex, '');

  // - 첫번째 이외의 모든 중복 styled Components CSS 제거
  // (비록 런타임에 1회 추가 재생성되지만, SEO 크롤러를 위해 중복 2회까지 허용.)
  const styledComponentsRegex = /<style[^>]*data-styled="active"[^>]*data-styled-version="[^"]*"[^>]*>([\s\S]*?)<\/style>/gi;
  const innerContentSet = new Set();
  html = html.replace(styledComponentsRegex, (match, innerContent) => {  // innerContent는 <style>여기</style> 내부 CSS 내용을 의미함
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

  // - head 태그의 맨 뒤에 <style>fontawesome.css<style> 스타일 삽입
  if (uniqueCssFiles.length > 0) {
    let css = fs.readFileSync(uniqueCssFiles[0], 'utf8');
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');  // CSS 주석 제거 ('/* */' 형태)
    css = css.replace(/\s+/g, ' ').trim();  // 공백 최소화 (minify 최적화)
    const styleTagWithCss = `<style>${css}</style>`;
    html = html.replace(/<\/head>/i, `${styleTagWithCss}</head>`);  // 스타일 삽입
  }

  fs.writeFileSync(file, html, 'utf8');
});


// =============================================== //

console.log(`✅ fix-head.js 실행 완료!`);