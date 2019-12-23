import { JSDOM } from "jsdom";
import { promises as fs } from "fs";

type Node = { title: string; edges: string[] };

const run = async () => {
  const source = await fs.readFile(process.argv[2], "utf8");
  const sources: Record<string, string> = JSON.parse(source);

  const graph: Record<string, Node> = {};
  const edge = (nr: string, edge: string) => {
    if (nr in graph) {
      graph[nr].edges.push(edge);
    } else {
      graph[nr] = { title: nr, edges: [edge] };
    }
  };

  for (const title of Object.keys(sources)) {
    const html = new JSDOM(sources[title]);
    const { document } = html.window;

    const parsed = /(\d+) (.+)/.exec(document.querySelector("h2")!.innerHTML)!;
    const courseNumber = parsed[1];
    const courseName = parsed[2];
    if (courseNumber in graph) {
      graph[courseNumber].title = courseName;
    } else {
      graph[courseNumber] = { title: courseName, edges: [] };
    }

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
      edge(preq, courseNumber);
    }
  }
  console.log(JSON.stringify(graph));
};

run();
