// docker run --user 1000:1000 -v $PWD/out:/tmp webcapture http://www.epfl.ch/ /tmp/aaa.png
const puppeteer = require('puppeteer');

(async () => {
  const url = process.argv[2] || "https://www.epfl.ch/";  
  const pngpath = process.argv[3] || "capture.png";

  // const browser = await puppeteer.launch();
  const browser = await puppeteer.launch({headless: true, args: ["--no-sandbox"]});
  const page = await browser.newPage();
  // await page.setViewport({
  //   width: 1280,
  //   height: 2048,
  //   deviceScaleFactor: 2,
  //   hasTouch: false,
  //   isLandscape: false
  // });
  await page.goto(url);

  // const perf = await page.metrics();
  // console.log(JSON.stringify(perf));


  console.log("\n==== performance.getEntries() ====\n"); 
  console.log( await page.evaluate( () => JSON.stringify(performance.getEntries(), null, " ") ) );
  console.log("\n==== performance.toJSON() ====\n");
  console.log( await page.evaluate( () => JSON.stringify(performance.toJSON(), null, " ") ) ); 
  console.log("\n==== page.metrics() ====\n"); 
  const perf = await page.metrics(); 
  console.log( JSON.stringify(perf, null, " ") );


  await page.screenshot({path: pngpath, fullPage: true});
  await browser.close();
})();