import * as d3 from "d3";
import srcRaw from "./graph.json";

const src = srcRaw as Record<string, { title: string; edges: string[] }>;

const edges: { target: string; source: string }[] = [];
const nodes = Object.entries(src).map(([nr, node]) => {
  for (const pre of node.edges) {
    edges.push({ target: nr, source: pre });
  }
  return { id: nr, label: src[nr].title };
});

const width = window.innerWidth,
  height = window.innerHeight;

const svg = d3
  .select("svg")
  .attr("width", width)
  .attr("height", height);

const linkForce = d3
  .forceLink()
  .id(link => link.id)
  .strength(link => 0.7);
const simulation = d3
  .forceSimulation()
  .force("link", linkForce)
  .force("charge", d3.forceManyBody().strength(-20))
  .force("center", d3.forceCenter(width / 2, width / 2));

const linkElements = svg
  .append("g")
  .attr("class", "links")
  .selectAll("line")
  .data(edges)
  .enter()
  .append("line")
  .attr("stroke-width", 1)
  .attr("stroke", "rgba(50, 50, 50, 0.2)");

const nodeElements = svg
  .append("g")
  .selectAll("circle")
  .data(nodes)
  .enter()
  .append("circle")
  .attr("r", 10)
  .attr("fill", "red");

simulation.nodes(nodes).on("tick", () => {
  nodeElements.attr("cx", n => n.x).attr("cy", n => n.y);
  linkElements
    .attr("x1", link => link.source.x)
    .attr("y1", link => link.source.y)
    .attr("x2", link => link.target.x)
    .attr("y2", link => link.target.y);
});

simulation.force("link").links(edges);
