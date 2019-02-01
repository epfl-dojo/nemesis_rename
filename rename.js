const util = require('util');
const lighthouse = require('lighthouse');
const request = require('request');

const puppeteer = require('puppeteer');
const { Page } = require('puppeteer/lib/Page');

async function connectToBrowser(port) {

  const resp = await util.promisify(request)(`http://localhost:${port}/json/version`);
  const {webSocketDebuggerUrl} = JSON.parse(resp.body);
  return puppeteer.connect({browserWSEndpoint: webSocketDebuggerUrl});

}

Page.prototype.input = function(name) {
  const page = this;
  let selector;
  if (typeof(name) === "String") {
    selector = 'input[name=' + name + ']';
  } else if (name.id) {
    selector = 'input#' + name.id;
  } else {
    throw new Error("¯\_(ツ)_/¯");
  }
  return {
    async fill(value) {
      const clicker = (el, v) => el.value = v;  // Must *not* close on e.g. value from line 20!!
      return page.$eval(selector, clicker, value);
    }
  } 
}


Page.prototype.fillInput = async function(name, value) {
    const clicker = (el, v) => el.value = v;  // Must *not* close on e.g. value from line 16!!
    return this.$eval('input[name=' + name + ']', clicker, value);
}

async function changeOwnerOfMachines(page, link) {
  link = link.replace('device_view', 'device_edit');

  console.log("Going to:" + link);

  await page.goto(link)
  await [
    page.fillInput({id: 'unite'}, 'ch/epfl/si/si-idev/idev-fsd'),
    page.fillInput({id: 'id_faculte'}, 'SI')
  ];
  page = await clickElement(page, "input[type=Submit]")
}

async function clickElement (page, cssSelector) {
  const browser = page.browser();
  await page.$eval(cssSelector, el => el.click());

  await new Promise(function (resolve, reject) {
    page.on('load', () => { console.log("Loaded: " + page.url()); resolve();});
  })
  return browser.targets()[browser.targets().length-1].page();
}

(async () => {

  const chromium_port=process.argv[2];
  if (chromium_port == undefined) {
    throw new Error("Please provide port number to command line");
  } else {
    console.log("Using port " + chromium_port);
  }

  const browser = await connectToBrowser(chromium_port);
  let page = await browser.newPage();

  await page.goto('https://fm.epfl.ch');
  await page.input('search_str').fill('cloud.epfl.ch');
  page = await clickElement(page, 'input.whiteButton');

  // #content > div.fm_content > div:nth-child(6) > table > tbody > tr:nth-child(2) > td:nth-child(2) > a

  for (let url of await page.$$eval(
    '#content > div.fm_content > div:nth-child(6) > table a',
    // Again - Function MUST NOT close on anything
    (listOfA) => [].map.call(listOfA, (a) => a.href))) {
      await changeOwnerOfMachines(page, url);
  }

  await browser.disconnect();
})();
