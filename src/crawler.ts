import puppeteer from "puppeteer";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const range = (n: number): Iterable<number> =>
  new Array(n).fill(0).map((_, i) => i);

const COURSES_URL =
  "https://kurser.dtu.dk/search?CourseCode=&SearchKeyword=&Department=1&CourseType=&TeachingLanguage=";

const run = async () => {
  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();
  await page.goto(COURSES_URL, { waitUntil: "domcontentloaded" });
  await page.goto(COURSES_URL, { waitUntil: "domcontentloaded" });

  const courses = await page.$$eval(".table a", links =>
    Promise.resolve(
      (links as HTMLAnchorElement[]).map(a => ({
        title: a.innerHTML,
        href: a.href
      }))
    )
  );

  const pages = [page];
  const results: Record<string, string> = {};

  for (let i in range(10)) {
    pages.push(await browser.newPage());
  }

  const requests = pages.map(async page => {
    let next;
    while ((next = courses.pop())) {
      await page.goto(next.href, { waitUntil: "domcontentloaded" });
      results[next.title] = await page.content();
    }
  });

  await Promise.all(requests);

  await browser.close();

  console.log(JSON.stringify(results));
};

run();
