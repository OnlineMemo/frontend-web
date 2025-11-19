const fs = require('fs');
const glob = require('glob');


// ================ < Get File > ================ //

// - sitemap file
const sitemapFiles = glob.sync('public/sitemap.xml');
if (sitemapFiles.length === 0) {
  console.error(`❌ fix-sitemap.js 실행 실패! : sitemap.xml 파일없음 ERROR`);
  process.exit(1);
}
const sitemapFile = sitemapFiles[0];


// ================ < Fix Sitemap > ================ //

let sitemap = fs.readFileSync(sitemapFile, 'utf8');

// ex) new Date(Fri Aug 01 2025 00:00:00 GMT+0900 (한국 표준시)) -> "2025-08-01"
const kstDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
const dateStr = `${kstDate.getFullYear()}-${String(kstDate.getMonth()+1).padStart(2,'0')}-${String(kstDate.getDate()).padStart(2,'0')}`;

const dateRegex = /<lastmod>.*?<\/lastmod>/g;
sitemap = sitemap.replace(dateRegex, `<lastmod>${dateStr}</lastmod>`);

fs.writeFileSync(sitemapFile, sitemap, 'utf8');


// ============== < Run Completed > ============== //

console.log(`✅ fix-sitemap.js 실행 완료!`);