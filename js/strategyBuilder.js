const PRESET_STRATEGIES = {
  "Apne 16": [4, 6, 7, 9, 13, 15, 16, 18, 22, 24, 25, 27, 31, 33, 34, 36],
  "Top 16": [1, 3, 7, 9, 10, 12, 13, 15, 16, 21, 22, 24, 25, 28, 30, 33],
  "Top 21": [1, 3, 4, 6, 7, 9, 10, 12, 13, 15, 16, 18, 21, 22, 24, 25, 27, 28, 30, 31, 33]
};

let selectedNumbers = new Set();

function createNumberSelector() {
  const container = document.getElementById("numberSelector");
  if (!container) return;

  container.innerHTML = "";

  for (let n = 0; n <= 36; n++) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "number-btn";
    button.textContent = n;
    button.dataset.number = n;

    button.addEventListener("click", () => {
      toggleNumber(n, button);
    });

    container.appendChild(button);
  }

  updateSelectedDisplay();
}

function toggleNumber(number, button) {
  if (selectedNumbers.has(number)) {
    selectedNumbers.delete(number);
    button.classList.remove("selected");
  } else {
    selectedNumbers.add(number);
    button.classList.add("selected");
  }

  updateSelectedDisplay();
  triggerLiveAnalysis();
}

function loadPreset(name) {
  const values = PRESET_STRATEGIES[name] || [];
  selectedNumbers = new Set(values);

  document.querySelectorAll(".number-btn").forEach(button => {
    const number = Number(button.dataset.number);
    button.classList.toggle("selected", selectedNumbers.has(number));
  });

  updateSelectedDisplay();
  triggerLiveAnalysis();
}

function clearSelection() {
  selectedNumbers.clear();

  document.querySelectorAll(".number-btn").forEach(button => {
    button.classList.remove("selected");
  });

  updateSelectedDisplay();
  triggerLiveAnalysis();
}

function updateSelectedDisplay() {
  const output = document.getElementById("selectedNumbersText");
  const count = document.getElementById("selectedCount");

  const sorted = [...selectedNumbers].sort((a, b) => a - b);

  if (output) {
    output.textContent = sorted.length ? sorted.join(", ") : "None";
  }

  if (count) {
    count.textContent = sorted.length;
  }
}

function triggerLiveAnalysis() {
  document.dispatchEvent(
    new CustomEvent("strategySelectionChanged", {
      detail: {
        numbers: [...selectedNumbers].sort((a, b) => a - b)
      }
    })
  );
}

window.RIDStrategyBuilder = {
  createNumberSelector,
  loadPreset,
  clearSelection,
  getSelectedNumbers: () => [...selectedNumbers].sort((a, b) => a - b)
};