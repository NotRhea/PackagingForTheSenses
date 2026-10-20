
// ========================================
// GOOGLE SHEETS CMS
// ========================================

const sheetID = "1pokmog2TUlmLt57uFU2--VWgkk0O_pHesiNVbcG4YuI";
const tabName = "Tea";

const opensheet_uri =
  `https://opensheet.elk.sh/${sheetID}/${encodeURIComponent(tabName)}`;

let teaData = [];


// ========================================
// IMAGE ASSETS
// ========================================

const WOMEN = {
  1: "assets/woman-1.png",
  2: "assets/woman-2.png",
  3: "assets/woman-3.png"
};

const SHAPES = {
  sachet: "assets/shape-sachet.png",
  loose: "assets/shape-loose.png"
};

const TEA_COLORS = {
  green: "#bbc9af",
  oolong: "#e6cd9d",
  white: "#ffffff",
  black: "#000000"
};

const FLAVOUR_BANDS = {
  lemon: "assets/flavour-lemon.png",
  ginger: "assets/flavour-ginger.png",
  rose: "assets/flavour-rose.png",
  lavender: "assets/flavour-lavender.png",
  cinnamon: "assets/flavour-cinnamon.png",

  "cinnamon-ginger": "assets/flavour-ginger-cinnamon.png",
  "cinnamon-lavender": "assets/flavour-cinnamon-lavender.png",
  "cinnamon-lemon": "assets/flavour-lemon-cinnamon.png",
  "cinnamon-rose": "assets/flavour-rose-cinnamon.png",
  "ginger-lavender": "assets/flavour-ginger-lavender.png",
  "ginger-lemon": "assets/flavour-ginger-lemon.png",
  "ginger-rose": "assets/flavour-ginger-rose.png",
  "lavender-lemon": "assets/flavour-lemon-lavender.png",
  "lavender-rose": "assets/flavour-rose-lavender.png",
  "lemon-rose": "assets/flavour-lemon-rose.png"
};

const LEAF_SRC = "assets/leaf.png";


// ========================================
// HTML ELEMENTS
// ========================================

const stage = document.getElementById("stage");

const caffeineSlider = document.getElementById("caffeineSlider");
const shapeSelect = document.getElementById("shapeSelect");
const teaTypeSelect = document.getElementById("teaTypeSelect");

const flavourCheckboxes =
  document.querySelectorAll('input[name="flavour"]');

const titleInput = document.getElementById("titleInput");

const womanImg = document.getElementById("womanImg");
const shapeImg = document.getElementById("shapeImg");

const flavourTop = document.getElementById("flavourTop");
const flavourBottom = document.getElementById("flavourBottom");

const titleImg = document.getElementById("titleImg");

const ribbonText =
  document.querySelector("#titleRibbon textPath");

const labelLeft = document.querySelector(".label-left");
const labelRight = document.querySelector(".label-right");

const caffeineLeafContainer =
  document.getElementById("caffeineLeafContainer");

const teaSelect = document.getElementById("teaSelect");
const exportBtn = document.getElementById("exportBtn");


// ========================================
// INITIALIZE
// ========================================

function init() {

  updateWoman();
  updateShape();
  updateTeaType();
  updateFlavours();
  updateCaffeineLeaves();

  caffeineSlider.addEventListener("input", () => {
    updateWoman();
    updateCaffeineLeaves();
  });

  shapeSelect.addEventListener("change", updateShape);

  teaTypeSelect.addEventListener("change", updateTeaType);

  flavourCheckboxes.forEach(cb => {
    cb.addEventListener("change", () => {
      handleFlavourToggle(cb);
    });
  });

  titleInput.addEventListener("input", () => {
    const val = titleInput.value.trim();

    if (ribbonText) {
      ribbonText.textContent = val || "Tea Name";
    }
  });

  exportBtn.addEventListener("click", exportImage);

  if (teaSelect) {
    teaSelect.addEventListener("change", () => {
      const idx = parseInt(teaSelect.value, 10);
      const row = teaData[idx];

      if (row) {
        applyTeaRow(row);
      }
    });
  }

  loadTeaData();
}


// ========================================
// LOAD GOOGLE SHEETS DATA
// ========================================

async function loadTeaData() {

  if (teaSelect) {
    teaSelect.innerHTML =
      '<option value="">Loading teas...</option>';
  }

  try {

    console.log("Fetching Google Sheet:", opensheet_uri);

    const response = await fetch(opensheet_uri, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `Google Sheets request failed: ${response.status}`
      );
    }

    const data = await response.json();

    console.log("Google Sheets response:", data);

    if (!Array.isArray(data)) {
      throw new Error(
        "The sheet did not return a list of teas. " +
        JSON.stringify(data)
      );
    }

    // Normalize spreadsheet column names and values.
    // This also handles accidental spaces or capitalization.

    teaData = data.map(rawRow => {

      const row = {};

      Object.entries(rawRow).forEach(([key, value]) => {

        const cleanKey = key
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "_");

        row[cleanKey] = String(value ?? "").trim();

      });

      return row;

    }).filter(row => row.name);

    // Sort alphabetically

    teaData.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    console.log(`Successfully loaded ${teaData.length} teas`);

    populateTeaSelect();

  } catch (error) {

    console.error("CMS connection error:", error);

    if (teaSelect) {
      teaSelect.innerHTML =
        '<option value="">Sheet load error</option>';
    }

  }
}


// ========================================
// POPULATE CMS DROPDOWN
// ========================================

function populateTeaSelect() {

  if (!teaSelect) return;

  teaSelect.innerHTML = "";

  if (teaData.length === 0) {

    teaSelect.innerHTML =
      '<option value="">No teas found</option>';

    console.warn(
      "No tea records found. Check the Tea tab " +
      "and the name column in Google Sheets."
    );

    return;
  }

  teaData.forEach((row, index) => {

    const option = document.createElement("option");

    option.value = index;
    option.textContent = row.name;

    teaSelect.appendChild(option);

  });

  // Automatically load the first tea

  teaSelect.value = "0";

  applyTeaRow(teaData[0]);
}


// ========================================
// APPLY CMS ROW TO PACKAGING
// ========================================

function applyTeaRow(row) {

  if (!row) return;

  // TEA NAME

  const name = String(row.name || "").trim();

  if (titleInput) {
    titleInput.value = name;
  }

  if (ribbonText) {
    ribbonText.textContent = name || "Tea Name";
  }


  // CAFFEINE LEVEL

  const level = parseInt(
    row.caffeine_level || row.caffeine || "1",
    10
  );

  const clampedLevel = Math.min(
    3,
    Math.max(1, isNaN(level) ? 1 : level)
  );

  caffeineSlider.value = clampedLevel;

  updateWoman();
  updateCaffeineLeaves();


  // TEA FORM

  const form = String(row.tea_form || "")
    .toLowerCase()
    .trim();

  if (form === "sachet" || form === "loose") {

    shapeSelect.value = form;
    updateShape();

  }


  // TEA TYPE

  const type = String(row.tea_type || "")
    .toLowerCase()
    .trim();

  if (["green", "oolong", "white", "black"].includes(type)) {

    teaTypeSelect.value = type;
    updateTeaType();

  }


  // FLAVOURS

  const f1 = String(row.flavour_1 || "")
    .toLowerCase()
    .trim();

  const f2 = String(row.flavour_2 || "")
    .toLowerCase()
    .trim();

  flavourCheckboxes.forEach(cb => {
    cb.checked = false;
  });

  [f1, f2].forEach(flavour => {

    if (!flavour) return;

    const checkbox = Array.from(flavourCheckboxes)
      .find(cb => cb.value === flavour);

    if (checkbox) {
      checkbox.checked = true;
    }

  });

  updateFlavours();
}


// ========================================
// UPDATE WOMAN ILLUSTRATION
// ========================================

function updateWoman() {

  const level = parseInt(caffeineSlider.value, 10);

  const src = WOMEN[level];

  if (src) {
    womanImg.src = src;
  }
}


// ========================================
// UPDATE TEA FORM
// ========================================

function updateShape() {

  const key = shapeSelect.value;

  const src = SHAPES[key];

  if (src) {
    shapeImg.src = src;
  }
}


// ========================================
// UPDATE TEA TYPE
// ========================================

function updateTeaType() {

  const type = teaTypeSelect.value;

  const color = TEA_COLORS[type] || "#ffffff";

  stage.style.backgroundColor = color;

  stage.style.borderColor =
    type === "black" ? "#333333" : "#d6d6d6";


  // Title illustration

  if (titleImg) {

    if (type === "green" || type === "oolong") {

      titleImg.src = "assets/title-1.png";

    } else if (type === "white" || type === "black") {

      titleImg.src = "assets/title-2.png";

    }
  }


  // Bottom labels

  const isBlack = type === "black";

  const textColor = isBlack ? "#ffffff" : "#111111";

  if (labelLeft) {
    labelLeft.style.color = textColor;
  }

  if (labelRight) {
    labelRight.style.color = textColor;
  }
}


// ========================================
// UPDATE CAFFEINE LEAVES
// ========================================

function updateCaffeineLeaves() {

  if (!caffeineLeafContainer) return;

  const level = parseInt(caffeineSlider.value, 10) || 1;

  caffeineLeafContainer.innerHTML = "";

  for (let i = 0; i < level; i++) {

    const leaf = document.createElement("img");

    leaf.src = LEAF_SRC;
    leaf.alt = "caffeine leaf";

    leaf.classList.add("caffeine-leaf");

    caffeineLeafContainer.appendChild(leaf);
  }
}


// ========================================
// FLAVOUR CHECKBOXES
// ========================================

function handleFlavourToggle(changedCheckbox) {

  const selected = getSelectedFlavours();

  if (selected.length > 2) {

    changedCheckbox.checked = false;

    return;
  }

  updateFlavours();
}


function getSelectedFlavours() {

  return Array.from(flavourCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);
}


// ========================================
// UPDATE FLAVOUR BANDS
// ========================================

function updateFlavours() {

  const selected = getSelectedFlavours();

  if (selected.length === 0) {

    flavourTop.style.display = "none";
    flavourBottom.style.display = "none";

    flavourTop.src = "";
    flavourBottom.src = "";

    return;
  }

  // Alphabetically sort selected flavours
  // to match the existing image mappings.

  const key = [...selected].sort().join("-");

  const bandSrc = FLAVOUR_BANDS[key];

  if (!bandSrc) {

    const fallback = FLAVOUR_BANDS[selected[0]];

    if (fallback) {

      flavourTop.src = fallback;
      flavourBottom.src = fallback;

      flavourTop.style.display = "block";
      flavourBottom.style.display = "block";

    } else {

      flavourTop.style.display = "none";
      flavourBottom.style.display = "none";

    }

    return;
  }

  flavourTop.src = bandSrc;
  flavourBottom.src = bandSrc;

  flavourTop.style.display = "block";
  flavourBottom.style.display = "block";
}


// ========================================
// EXPORT PACKAGING AS PNG
// ========================================

function exportImage() {

  if (typeof html2canvas === "undefined") {

    alert("Export library not loaded.");

    return;
  }

  html2canvas(stage, {

    scale: 3,
    backgroundColor: null

  }).then(canvas => {

    const link = document.createElement("a");

    link.download = `tea-packaging-${Date.now()}.png`;

    link.href = canvas.toDataURL("image/png");

    link.click();

  }).catch(error => {

    console.error("Export failed:", error);

  });
}


// ========================================
// START GENERATOR
// ========================================

init();

