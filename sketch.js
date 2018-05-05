// @ts-check
/* eslint no-undef: 0 */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "setup|draw|preload|recordFrame|recordSetup|p5Canvas0" }] */
// region SEC: Globals
let p5Canvas0;
let rupSVG;
const toPoints = SVGPoints.toPoints;
const toPath = SVGPoints.toPath;
let xPath;
let RupPaths = [];
// endregion
function preload() {
  rupSVG = loadXML("Rupertofly.svg");
}

function setup() {
  let rupPoints = [];
  p5Canvas0 = createCanvas(800, 600);
  console.log(rupSVG.children[1].attributes.d);
  xPath = toPoints({ type: "path", d: rupSVG.children[1].attributes.d });
  for (let child of rupSVG.children) {
    if (child.attributes.d !== undefined) {
      RupPaths.push(toPoints({ type: "path", d: child.attributes.d }));
    } else if (child.attributes.points !== undefined) {
      RupPaths.push(
        toPoints({ type: "polygon", points: child.attributes.points })
      );
    } else if (child.name === "style") continue;
  }
  console.log(xPath);
  noFill();
  for (let path of RupPaths) {
    let rmPath = null;
    for (let i of path.keys()) {
      if (isNaN(path[i].x)) rmPath = i;
    }
    if (rmPath !== null) path.splice(rmPath, 1);
    let length = Points.length(path, 1);
    let interval = 3 / length;
    let cInt = 0;
    while (cInt < 1) {
      cInt += interval;
      let p = Points.position(path, cInt, 1);
      rupPoints.push([p.x, p.y]);
    }
    for (let p of path) ellipse(p.x, p.y, 10);
    for (let [i, b] of path.entries()) {
      /** @type {[number,number]} */ let p = [b.x, b.y];
      let prevPath =
        i === 0 ? path[path.length - 1] : path[(i - 1) % path.length];
      if (b.curve !== undefined) {
        // bezier(
        //   prevPath.x,
        //   prevPath.y,
        //   b.curve.x1,
        //   b.curve.y1,
        //   b.curve.x2,
        //   b.curve.y2,
        //   b.x,
        //   b.y
        // );
      } else {
        // line(prevPath.x, prevPath.y, b.x, b.y);
      }
    }
  }
  /** @type {[number,number][]} */
  let extraPoints = d3
    .range(240)
    .map(() => [Math.random() * width, Math.random() * height]);
  let polys = d3
    .voronoi()
    .size([width, height])([...extraPoints, ...rupPoints])
    .polygons();
  for (let [i, poly] of polys.entries()) {
    if (i >= extraPoints.length) continue;
    let c = d3.polygonCentroid(poly);
    extraPoints[i] = c;
  }
  polys = d3
    .voronoi()
    .size([width, height])([...extraPoints, ...rupPoints])
    .polygons();
  for (let [i, poly] of polys.entries()) {
    if (i >= extraPoints.length) continue;
    let c = d3.polygonCentroid(poly);
    extraPoints[i] = c;
  }
  polys = d3
    .voronoi()
    .size([width, height])([...extraPoints, ...rupPoints])
    .polygons();
  noStroke();
  fill(55);
  for (let [i, poly] of polys.entries()) {
    if (i >= extraPoints.length)
      fill(getC(hues.limes, Math.floor(random(3))).hex);
    else fill(getC(hues.neutrals, Math.floor(random(3))).hex);

    if (poly === undefined) continue;
    let c = d3.polygonCentroid(poly);
    let radius = getMinDist(poly);
    ellipse(c[0], c[1], 2 * radius - 2);
  }
}

function draw() {}
function getMinDist(poly) {
  let c = d3.polygonCentroid(poly);
  return max(
    d3.range(poly.length).map(i => {
      let thisP = poly[i];
      let nextP = poly[(i + 1) % poly.length];
      return distToSegment(c, thisP, nextP);
    })
  );
}
