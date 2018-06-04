import html2canvas from "html2canvas";
import FileSaver from "file-saver";

import meta from "./meta";
import levels from "./levels";
import districts from "./districts";

let selected = "basic";

const findSameDistricts = (container, name) => container.querySelectorAll(`polyline[name=${name}]`);

document.addEventListener("DOMContentLoaded", (e) => {
  const container = document.querySelector(".image-container");
  const svg = container.querySelector("svg");
  const downloadBtn = document.getElementById("download-button");
  downloadBtn.addEventListener("click", (e) => {
    html2canvas(container).then((canvas) => {
      canvas.toBlob((blob) => FileSaver.saveAs(blob, meta.download));
    });
  });

  // fill in title
  const mainTitle = svg.querySelector(".main-title");
  const levelTitle = svg.querySelector(".level-title");
  const levelValue = svg.querySelector(".level");
  const districtTitle = svg.querySelector(".district-name");

  mainTitle.innerHTML = meta.title;
  levelTitle.innerHTML = meta.level;

  // fill in level
  const levelDescs = svg.querySelectorAll(".tips .level-desc");
  const levelValues = svg.querySelectorAll(".tips .level-value");
  [...levelDescs].forEach((desc) => desc.innerHTML = levels[selected].data[desc.getAttribute("index")-0].desc);
  [...levelValues].forEach((value) => value.innerHTML = `${meta.levelPrefix}${levels[selected].data[value.getAttribute("index")-0].level}`);

  // fill in color
  const rects = svg.querySelectorAll(".tips rect");
  [...rects].forEach((rect) => rect.setAttribute("fill", levels[selected].data[rect.getAttribute("index")-0].color));

  // font family
  const texts = svg.querySelectorAll("g");
  [...texts].forEach((text) => text.setAttribute("font-family", `"Courier New", Helvetica, Arial, "文泉驛正黑", "WenQuanYi Zen Hei", "儷黑 Pro", "LiHei Pro", "微軟正黑體", "Microsoft JhengHei", "標楷體", DFKai-SB, sans-serif`));

  // district handling
  const districtRegions = svg.querySelectorAll("polyline");
  [...districtRegions].forEach((district) => district.addEventListener("mouseover", (e) => {
    const sameDistricts = findSameDistricts(svg, e.target.getAttribute("name"));
    [...sameDistricts].forEach((d) => d.classList.add("hover"));
    console.log(sameDistricts, districts);
    districtTitle.innerHTML = districts[sameDistricts[0].getAttribute("name")].name;
  }));
  [...districtRegions].forEach((district) => district.addEventListener("mouseout", (e) => {
    const sameDistricts = findSameDistricts(svg, e.target.getAttribute("name"));
    [...sameDistricts].forEach((d) => d.classList.remove("hover"));
    districtTitle.innerHTML = "";
  }));
});
