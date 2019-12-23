import { JSDOM } from "jsdom";
import { promises as fs } from "fs";

const run = async () => {
  const source = await fs.readFile(process.argv[2], "utf8");
  const sources: Record<string, string> = JSON.parse(source);
  console.log("digraph G {");
  for (const title of Object.keys(sources)) {
    const html = new JSDOM(sources[title]);
    const { document } = html.window;

    const parsed = /(\d+) (.+)/.exec(document.querySelector("h2")!.innerHTML)!;
    const courseNumber = parsed[1];
    const courseName = parsed[2];
    console.log(`  ${courseNumber}[label="${courseName}"]`);

    const preqLabel = Array.from(document.querySelectorAll("label")).find(a => {
      return a.innerHTML == "Recommended prerequisites";
    })!;
    if (!preqLabel) continue;
    const preqs = Array.from(
      preqLabel.parentElement!.parentElement!.querySelectorAll("a")
    )
      .map(a => a.innerHTML)
      .filter(d => d.match(/^\d+$/));
    for (const preq of preqs) {
      console.log(`  ${preq} -> ${courseNumber}`);
    }
  }
  console.log("}");
};

run();
