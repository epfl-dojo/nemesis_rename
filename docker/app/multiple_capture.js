// docker run --user 1000:1000 -v $PWD/out:/tmp webcapture /tmp http://www.epfl.ch/ http://www.kandou.com/
const puppeteer = require('puppeteer');
var fs = require('fs');

(async () => {
  // const browser = await puppeteer.launch();
  const outdir = process.argv[2];
  console.log("outdir: " + outdir);
  const browser = await puppeteer.launch({headless: true, args: ["--no-sandbox"]});
  for (let i = 3; i < process.argv.length; ++i) {
    url = process.argv[i];
    console.log("url: " + url);
    const context = await browser.createIncognitoBrowserContext();
    // Create a new page in a pristine context.
    const page = await context.newPage();
    await page.setCacheEnabled(false);

    // TODO: see if we can just  fix the width and still get the full page
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
    var hn = new URL(url).hostname;
    var logpath = outdir + "/" + hn + ".log";
    var pngpath = outdir + "/" + hn + ".png";
    console.log("url: " + url);
    console.log("log: " + logpath);
    console.log("png: " + pngpath);

    const entries = await page.evaluate( () => JSON.stringify(performance.getEntries(), null, " ") );
    const performance = await page.evaluate( () => JSON.stringify(performance.toJSON(), null, " ") ); 
    const perf = await page.metrics(); 


    var stream = fs.createWriteStream(logpath);
    stream.once('open', function(fd) {
      stream.write("\"entries\": "); 
      stream.write( entries + ",\n");
      stream.write("\"performance\" :");
      stream.write( performance + ",\n"); 
      stream.write("\"metrics\": ");
      stream.write( JSON.stringify(perf, null, " "));
      stream.end();
    });

    await page.screenshot({path: pngpath, fullPage: true});
    await context.close();
  }
  await browser.close();
})();