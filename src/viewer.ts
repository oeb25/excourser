import srcRaw from "./graph.json";

const src = srcRaw as Record<string, { title: string; edges: string[] }>;

const nodes = Object.keys(src).map(nr => {
  return {
    nr,
    src: src[nr],
    x: Math.random() * 0.001,
    y: Math.random() * 0.001,
    vx: 0,
    vy: 0,
    indep: true
  };
});

for (const node of nodes) {
  for (const n of node.src.edges) {
    nodes.find(x => x.nr == n)!.indep = false;
  }
}

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;

canvas.width = window.innerWidth * 2;
canvas.height = window.innerHeight * 2;

document.body.appendChild(canvas);

let cx = 0,
  cy = 0;

let mousedown = false;
let mouseclick = false;

let w = 0,
  h = 0;

let mx = 0,
  my = 0;

canvas.onmousemove = e => {
  mx = e.clientX * 2 - w / 2;
  my = e.clientY * 2 - h / 2;
};
canvas.ontouchmove = e => {
  e.preventDefault();
  mx = e.touches[0].screenX * 2 - w / 2;
  my = e.touches[0].screenY * 2 - h / 2;
};
canvas.onmousedown = () => {
  mousedown = true;
  mouseclick = true;
};
canvas.ontouchstart = e => {
  mousedown = true;
  mouseclick = true;

  mx = e.touches[0].screenX * 2 - w / 2;
  my = e.touches[0].screenY * 2 - h / 2;
};
canvas.onmouseup = canvas.ontouchend = () => {
  mousedown = false;
};

let selectedNode: null | typeof nodes[0] = null;

const loop = () => {
  w = canvas.width;
  h = canvas.height;

  let mindm = Infinity;
  let minNode = nodes[0];

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(200,200,200,1.0)";
  for (const node of nodes) {
    node.x += node.vx;
    node.y += node.vy;
  }
  for (const node of nodes) {
    const scale = Math.min(w / 600, h / 600);

    let fx = -node.x / scale,
      fy = -node.y / scale;

    for (const n2 of nodes) {
      if (node == n2) continue;
      const dx = node.x - n2.x,
        dy = node.y - n2.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      let mod = 2;
      // if (node.src.edges.includes(n2.nr)) {
      if (n2.src.edges.includes(node.nr) || node.src.edges.includes(n2.nr)) {
        mod = d < 20 ? 1.0 : -0.8 * d;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255,255,255,${(1 - d / 1000) * 0.5})`;
        ctx.moveTo(node.x - cx + w / 2, node.y - cy + h / 2);
        ctx.lineTo(n2.x - cx + w / 2, n2.y - cy + h / 2);
        ctx.stroke();
      }
      if (d != 0) {
        fx += (dx / d / 2) * mod;
        fy += (dy / d / 2) * mod;
      }
    }

    node.vx = node.vx * 0.8 + fx * 0.02;
    node.vy = node.vy * 0.8 + fy * 0.02;

    const dmx = mx - node.x,
      dmy = my - node.y;
    const dm = Math.sqrt(dmx * dmx + dmy * dmy);
    if (dm < mindm) {
      mindm = dm;
      minNode = node;
    }

    ctx.beginPath();
    ctx.arc(node.x - cx + w / 2, node.y - cy + h / 2, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  if (!mousedown) {
    selectedNode = null;
  }

  if (selectedNode) {
    selectedNode.x = mx;
    selectedNode.y = my;
  } else if (mouseclick) {
    if (mindm < 100) {
      selectedNode = minNode;
    }
  }
  if (selectedNode || mindm < 100) {
    ctx.fillText((selectedNode || minNode)!.src.title, 50, 50);
  }

  mouseclick = false;

  requestAnimationFrame(loop);
  // setTimeout(loop, 50);
};

loop();
loop();
loop();
