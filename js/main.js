import FileSaver from "file-saver";
import micromodal from "micromodal";

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

  micromodal.init();

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
  const fontMargin = levels[selected].menu.fontSize/2;
  [...levelColors].forEach((color, i) => {
    color.setAttribute("x", levels[selected].menu.x+20);
    color.setAttribute("y", levels[selected].menu.y+10+(i*levels[selected].menu.lineHeight));
    color.setAttribute("fill", levels[selected].data[color.getAttribute("index")-0].color);
    color.innerHTML = levels[selected].data[color.getAttribute("index")-0].desc;
  });
  [...levelDescs].forEach((desc, i) => {
    desc.setAttribute("x", levels[selected].menu.x+80);
    desc.setAttribute("y", levels[selected].menu.y+fontMargin+20+(i*levels[selected].menu.lineHeight));
    desc.innerHTML = levels[selected].data[desc.getAttribute("index")-0].desc;
  });
  [...levelValues].forEach((value, i) => {
    value.setAttribute("x", levels[selected].menu.x+levels[selected].menu.width-20);
    value.setAttribute("y", levels[selected].menu.y+fontMargin+20+(i*levels[selected].menu.lineHeight));
    value.innerHTML = `${meta.levelPrefix}${levels[selected].data[value.getAttribute("index")-0].level}`;
  });
};

const renderDropdown = (svg) => {
  const dropdown = document.getElementById("dropdown-menu");
  const ul = dropdown.querySelector("ul");
  const oldlist = ul.querySelectorAll("li.dropdown-level");
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

      dropdown.style.display = "none";
    });
    label.addEventListener("mouseover", (e) => e.target.style.backgroundColor = item.color.toLowerCase() === "#ffffff" ? "#eaeaea" : item.color);
    label.addEventListener("mouseout", (e) => e.target.style.backgroundColor = null);

    li.classList.add("dropdown-level");
    li.appendChild(label);

    ul.appendChild(li);
  });
};

const renderOptions = (svg) => {
  const select = document.querySelector(".option-panel #mode-options");
  select.innerHTML = "";

  Object.keys(levels).forEach((item, i) => {
    const option = document.createElement("option");
    const label = document.createElement("label");

    label.innerHTML = levels[item].name;
    option.value = item;
    option.appendChild(label);

    if (item === "customize") {
      option.addEventListener("click", (e) => micromodal.show("modal"));
    }

    select.appendChild(option);
  });

  const selectedOption = select.querySelector(`option[value=${selected}]`);
  selectedOption.selected = "selected";

  select.addEventListener("change", (e) => {
    const option = e.target.options[e.target.selectedIndex].value;
    if (option === "customize") {
      micromodal.show("modal");
    } else {
      selected = option;
      init(svg);
    }
  });
};

const initCustomize = () => {
  levels.customize.data.slice().sort((a, b) => b.level - a.level).forEach((level, i) => {
    const desc = document.querySelector(`#modal #modal-content .input-level-desc[index="${i}"]`);
    const value = document.querySelector(`#modal #modal-content .input-level-value[index="${i}"]`);
    const color = document.querySelector(`#modal #modal-content .input-level-color[index="${i}"]`);
    if (desc) {
      desc.placeholder = level.desc;
    }
    if (value) {
      value.placeholder = level.level;
    }
    if (color) {
      color.value = level.color;
      color.setAttribute("default-value", level.color);
    }
  });

  const title = document.getElementById("input-main-title");
  title.placeholder = meta.title;

  const tipX = document.getElementById("input-tip-x");
  const tipY = document.getElementById("input-tip-y");
  const tipW = document.getElementById("input-tip-w");
  const tipH = document.getElementById("input-tip-h");
  const lineHeight = document.getElementById("input-tip-line-height");
  const fontSize = document.getElementById("input-tip-font-size");
  tipX.placeholder = levels.customize.menu.x;
  tipY.placeholder = levels.customize.menu.y;
  tipW.placeholder = levels.customize.menu.width;
  tipH.placeholder = levels.customize.menu.height;
  lineHeight.placeholder = levels.customize.menu.lineHeight;
  fontSize.placeholder = levels.customize.menu.fontSize;
};

const resetCustomize = () => {
  const levelDescs = document.querySelectorAll("#modal #modal-content .input-level-desc[index]");
  const levelValues = document.querySelectorAll("#modal #modal-content .input-level-value[index]");
  const levelColors = document.querySelectorAll("#modal #modal-content .input-level-color[index]");
  const title = document.getElementById("input-main-title");
  const tipX = document.getElementById("input-tip-x");
  const tipY = document.getElementById("input-tip-y");
  const tipW = document.getElementById("input-tip-w");
  const tipH = document.getElementById("input-tip-h");
  const lineHeight = document.getElementById("input-tip-line-height");
  const fontSize = document.getElementById("input-tip-font-size");

  [...levelDescs, ...levelValues, title, tipX, tipY, tipW, tipH, lineHeight, fontSize].forEach((element) => element.value = "");
  [...levelColors].forEach((element) => element.value = element.getAttribute("default-value"));
};

const findSameDistricts = (container, name) => container.querySelectorAll(`polyline[name=${name}]`);

document.addEventListener("DOMContentLoaded", (e) => {
  const container = document.querySelector(".image-container");
  const svg = container.querySelector("svg");
  const districtTitle = svg.querySelector(".district-name");
  const dropdown = document.getElementById("dropdown-menu");
  const dropdownTitle = dropdown.querySelector(".dropdown-header");

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

  const resetBtn = document.getElementById("reset-button");
  resetBtn.addEventListener("click", resetCustomize);

  const saveBtn = document.getElementById("save-button");
  saveBtn.addEventListener("click", (e) => {
    const levelDescs = document.querySelectorAll("#modal #modal-content .input-level-desc[index]");
    const levelValues = document.querySelectorAll("#modal #modal-content .input-level-value[index]");
    const levelColors = document.querySelectorAll("#modal #modal-content .input-level-color[index]");

    [...levelDescs].forEach((desc, i) => levels.customize.data[i].desc = desc.value || desc.placeholder);
    [...levelValues].forEach((value, i) => levels.customize.data[i].level = (value.value || value.placeholder)-0);
    [...levelColors].forEach((color, i) => levels.customize.data[i].color = color.value);

    levels.customize.data.sort((a, b) => a.level - b.level);

    const title = document.getElementById("input-main-title");
    meta.title = title.value || title.placeholder;

    const tipX = document.getElementById("input-tip-x");
    const tipY = document.getElementById("input-tip-y");
    const tipW = document.getElementById("input-tip-w");
    const tipH = document.getElementById("input-tip-h");
    const lineHeight = document.getElementById("input-tip-line-height");
    const fontSize = document.getElementById("input-tip-font-size");
    levels.customize.menu.x = (tipX.value || tipX.placeholder)-0;
    levels.customize.menu.y = (tipY.value || tipY.placeholder)-0;
    levels.customize.menu.width = (tipW.value || tipW.placeholder)-0;
    levels.customize.menu.height = (tipH.value || tipH.placeholder)-0;
    levels.customize.menu.lineHeight = (lineHeight.value || lineHeight.placeholder)-0;
    levels.customize.menu.fontSize = (fontSize.value || fontSize.placeholder)-0;

    selected = "customize";

    init(svg);
  });

  const closeBtn = document.getElementById("close-button");
  closeBtn.addEventListener("click", (e) => micromodal.close("#modal"));

  /*
  const avatar = document.querySelector(".avatar");
  avatar.setAttribute("x", meta.avatar.x);
  avatar.setAttribute("y", meta.avatar.y);
  avatar.setAttribute("width", meta.avatar.width);
  avatar.setAttribute("height", meta.avatar.height);

  const uploadBtn = document.getElementById("upload-button");
  uploadBtn.addEventListener("change", (e) => {
    try {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = ((f) => {
        return (e) => {
          avatar.innerHTML = "";

          const img = document.createElement("image");
          img.setAttribute("x", meta.avatar.x);
          img.setAttribute("y", meta.avatar.y);
          img.setAttribute("width", meta.avatar.width);
          img.setAttribute("height", meta.avatar.height);
          img.setAttribute("xlink:href", `url(${e.target.result})`);
          avatar.appendChild(img);
        }
      })(file);
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
    }
  });
  */

  init(svg);
  initCustomize();

  // font family
  const texts = svg.querySelectorAll("g");
  [...texts].forEach((text) => text.setAttribute("font-family", `"Courier New", Helvetica, Arial, "WenQuanYi Zen Hei", "LiHei Pro", "Microsoft JhengHei", DFKai-SB, sans-serif`));

  // district handling
  const districtRegions = svg.querySelectorAll("polyline");
  [...districtRegions].forEach((district) => {
    district.setAttribute("data-jq-dropdown", "#dropdown-menu");

    district.addEventListener("click", (e) => {
      selectedDistrict = e.target.getAttribute("name");
      dropdownTitle.innerHTML = districts[selectedDistrict].name;
      setTimeout(() => {
        dropdown.style.left = e.clientX;
        dropdown.style.top = e.clientY;
      }, 0);
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
