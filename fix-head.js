const fs = require('fs');
const glob = require('glob');

const files = [
  ...glob.sync('build/index.html'),
  ...glob.sync('build/**/*.html'),
];
const uniqueFiles = [...new Set(files)];

uniqueFiles.forEach(file => {
  let html = fs.readFileSync(file, 'utf8');

  const toastStyleRegex = /<style[^>]*>[\s\S]*?:root\{--toastify-color-light[\s\S]*?<\/style>/gi;
  // - 첫번째 이외의 모든 중복 Toast CSS 제거
  // const matches = html.match(toastStyleRegex);
  // if (matches && matches.length > 1) {
  //   for (let i = 1; i < matches.length; i++) {
  //     html = html.replace(matches[i], '');
  //   }
  // }
  // - 모든 Toast CSS 제거 (런타임에 1회 자동 재생성됨.)
  html = html.replace(toastStyleRegex, '');

  // meta charset을 맨 위로 이동
  html = html.replace(/<meta[^>]*charset[^>]*>/gi, '');
  html = html.replace(/<head[^>]*>/i, match => `${match}\n<meta charset="UTF-8" />`);

  fs.writeFileSync(file, html, 'utf8');
  console.log(`✅ fix-head.js 실행 완료!`);
});
