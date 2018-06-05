import FileSaver from "file-saver";

import meta from "./meta";
import levels from "./levels";
import districts from "./districts";

let selected = "basic";
let selectedDistrict = "";
let colorMap = {};

const init = (svg) => {
  resetLevel(svg);
  renderTitle(svg);
  calculateLevel(svg);
  renderTip(svg);
  renderDropdown(svg);
  renderOptions(svg);

  colorMap = levels[selected].data.reduce((map, level) => {
    map[level.level] = level.color;
    return map;
  }, {});
};

const resetLevel = (svg) => {
  Object.keys(districts).forEach((d) => districts[d].level = 0);
  const districtRegions = svg.querySelectorAll("polyline");
  [...districtRegions].forEach((district) => {
    district.setAttribute("fill", "white");
  });
};

const calculateLevel = (svg) => {
  const levelValue = svg.querySelector(".title .level");
  levelValue.innerHTML = Object.keys(districts).reduce((sum, d) => sum + (districts[d].level || 0), 0);
};

const renderTitle = (svg) => {
  const mainTitle = svg.querySelector(".main-title");
  const levelTitle = svg.querySelector(".level-title");

  mainTitle.innerHTML = meta.title;
  levelTitle.innerHTML = meta.level;
};

const renderTip = (svg) => {
  const tip = svg.querySelector(".tips");
  const container = tip.querySelector(".container");
  const levelColors = tip.querySelectorAll(".level-color");
  const levelDescs = tip.querySelectorAll(".level-desc");
  const levelValues = tip.querySelectorAll(".level-value");
  tip.setAttribute("font-size", levels[selected].menu.fontSize);
  container.setAttribute("x", levels[selected].menu.x);
  container.setAttribute("y", levels[selected].menu.y);
  container.setAttribute("width", levels[selected].menu.width);
  container.setAttribute("height", levels[selected].menu.height);
  [...levelColors].forEach((color, i) => {
    color.setAttribute("x", levels[selected].menu.x+20);
    color.setAttribute("y", levels[selected].menu.y+10+(i*levels[selected].menu.lineHeight));
    color.setAttribute("fill", levels[selected].data[color.getAttribute("index")-0].color);
    color.innerHTML = levels[selected].data[color.getAttribute("index")-0].desc;
  });
  [...levelDescs].forEach((desc, i) => {
    desc.setAttribute("x", levels[selected].menu.x+80);
    desc.setAttribute("y", levels[selected].menu.y+levels[selected].menu.fontMargin+20+(i*levels[selected].menu.lineHeight));
    desc.innerHTML = levels[selected].data[desc.getAttribute("index")-0].desc;
  });
  [...levelValues].forEach((value, i) => {
    value.setAttribute("x", levels[selected].menu.x+levels[selected].menu.width-20);
    value.setAttribute("y", levels[selected].menu.y+levels[selected].menu.fontMargin+20+(i*levels[selected].menu.lineHeight));
    value.innerHTML = `${meta.levelPrefix}${levels[selected].data[value.getAttribute("index")-0].level}`;
  });
};

const renderDropdown = (svg) => {
  const dropdown = document.querySelector("#dropdown-menu ul");
  const oldlist = dropdown.querySelectorAll("li.dropdown-level");
  [...oldlist].forEach((li) => li.parentNode.removeChild(li));

  const list = levels[selected].data.slice().sort((a, b) => b.level - a.level);
  list.forEach((item) => {
    const li = document.createElement("li");
    const label = document.createElement("label");

    label.setAttribute("level", item.level);
    label.innerHTML = item.desc;
    label.addEventListener("click", (e) => {
      districts[selectedDistrict].level = e.target.getAttribute("level")-0;
      const district = svg.querySelectorAll(`polyline[name=${selectedDistrict}]`);
      [...district].forEach((d) => d.setAttribute("fill", colorMap[districts[selectedDistrict].level]));
      calculateLevel(svg);
    });
    label.addEventListener("mouseover", (e) => e.target.style.backgroundColor = item.color.toLowerCase() === "#ffffff" ? "#eaeaea" : item.color);
    label.addEventListener("mouseout", (e) => e.target.style.backgroundColor = null);

    li.classList.add("dropdown-level");
    li.appendChild(label);

    dropdown.appendChild(li);
  });
};

const renderOptions = (svg) => {
  const dropdown = document.querySelector("#options ul");
  const oldlist = dropdown.querySelectorAll("li.option-item");
  [...oldlist].forEach((li) => li.parentNode.removeChild(li));

  Object.keys(levels).forEach((item) => {
    const li = document.createElement("li");
    const label = document.createElement("label");

    label.setAttribute("option", item);
    label.innerHTML = levels[item].name;
    label.addEventListener("click", (e) => {
      selected = e.target.getAttribute("option");
      init(svg);
    });

    li.classList.add("option-item");
    li.appendChild(label);

    dropdown.appendChild(li);
  });
};

const findSameDistricts = (container, name) => container.querySelectorAll(`polyline[name=${name}]`);

document.addEventListener("DOMContentLoaded", (e) => {
  const container = document.querySelector(".image-container");
  const svg = container.querySelector("svg");
  const districtTitle = svg.querySelector(".district-name");
  const dropdownTitle = document.querySelector("#dropdown-menu .dropdown-header");

  const downloadBtn = document.getElementById("download-button");
  downloadBtn.addEventListener("click", (e) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 1200;
    canvas.height = 700;

    const data = new XMLSerializer().serializeToString(svg);
    canvg(canvas, data);
    canvas.toBlob((blob) => FileSaver.saveAs(blob, meta.download));
  });

  init(svg);

  // font family
  const texts = svg.querySelectorAll("g");
  [...texts].forEach((text) => text.setAttribute("font-family", `"Courier New", Helvetica, Arial, "WenQuanYi Zen Hei", "LiHei Pro", "Microsoft JhengHei", DFKai-SB, sans-serif`));

  // district handling
  const districtRegions = svg.querySelectorAll("polyline");
  [...districtRegions].forEach((district) => {
    district.classList.add("dropdown-toggle");
    district.setAttribute("data-jq-dropdown", "#dropdown-menu");

    district.addEventListener("click", (e) => {
      selectedDistrict = e.target.getAttribute("name");
      dropdownTitle.innerHTML = districts[selectedDistrict].name;
    });

    district.addEventListener("mouseover", (e) => {
      const sameDistricts = findSameDistricts(svg, e.target.getAttribute("name"));
      [...sameDistricts].forEach((d) => d.classList.add("hover"));
      districtTitle.innerHTML = districts[sameDistricts[0].getAttribute("name")].name;
    });

    district.addEventListener("mouseout", (e) => {
      const sameDistricts = findSameDistricts(svg, e.target.getAttribute("name"));
      [...sameDistricts].forEach((d) => d.classList.remove("hover"));
      districtTitle.innerHTML = "";
    });
  });

});
