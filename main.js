let hasSpaces = true;
let isExpanded = false;
let html,
  textArea,
  elErrorMessage,
  elChksetCharacterLimit = null;
let total = 0;

document.addEventListener("DOMContentLoaded", () => {
  html = document.querySelector("html");

  const counterForm = document.querySelector("#js-counter-form");
  textArea = counterForm.querySelector("textarea");

  const elTotalCharacters = document.querySelector("#js-total-characters");
  const elTotalWords = document.querySelector("#js-total-words");
  const elTotalSentences = document.querySelector("#js-total-sentences");
  const elReadingTime = document.querySelector("#js-reading-time");
  const elDensityContainer = document.querySelector(".density");

  const elCharacterLimit = document.querySelector("#character-limit");
  elChksetCharacterLimit = document.querySelector("#set_character_limit");
  const elChkExcludeSpaces = document.querySelector("#exclude_spaces");
  const themeToggle = document.querySelector("#js-theme-toggle");
  const toggleButton = document.getElementById("density-toggle");

  elErrorMessage = document.querySelector("#js-error-message");

  // Event: Text Input
  textArea.addEventListener("input", () => {
    const text = textArea.value;

    const characterCount = countCharacters(text, hasSpaces);
    total = characterCount; // track for use in limit check
    elTotalCharacters.textContent = characterCount;
    elTotalWords.textContent = countWords(text);
    elTotalSentences.textContent = countSentences(text);
    elReadingTime.textContent = getReadingTime(text);

    updateDensityChart(text, elDensityContainer);
    showHideLimitCError();
  });

  // Event: Character Limit Toggle
  elChksetCharacterLimit.addEventListener("input", () => {
    const isChecked = elChksetCharacterLimit.checked;
    elCharacterLimit.hidden = !isChecked;
    if (isChecked) {
      elCharacterLimit.dispatchEvent(new Event("input"));
    } else {
      textArea.removeAttribute("maxlength");
    }
    showHideLimitCError();
  });

  // Event: Character Limit Input
  elCharacterLimit.addEventListener("input", () => {
    textArea.setAttribute("maxlength", elCharacterLimit.value);
    showHideLimitCError();
  });

  // Event: Exclude Spaces Toggle
  elChkExcludeSpaces.addEventListener("change", (event) => {
    hasSpaces = !event.target.checked;
    elTotalCharacters.nextElementSibling.textContent = hasSpaces
      ? "Total Characters"
      : "Total Characters (no spaces)";
    textArea.dispatchEvent(new Event("input"));
  });

  // Event: Expand/Collapse Density Chart
  toggleButton.addEventListener("click", () => {
    isExpanded = !isExpanded;
    const wrapper = document.querySelector(".density__items-wrapper");

    wrapper.classList.toggle("expanded", isExpanded);
    wrapper.setAttribute("aria-expanded", isExpanded.toString());
    toggleButton.textContent = isExpanded ? "See less" : "See more";

    if (isExpanded) {
      // Wait for expansion layout changes before scrolling
      const rect = wrapper.getBoundingClientRect();
      const absoluteBottom = window.scrollY + rect.bottom;

      window.scrollTo({
        top: absoluteBottom,
        behavior: "smooth",
      });
    }
  });

  // Prevent form submission
  counterForm.addEventListener("submit", (e) => e.preventDefault());

  // Theme toggle
  initThemeToggle(themeToggle);
});

/* ===== Helper Functions ===== */

function countCharacters(text, includeSpaces) {
  const count = includeSpaces ? text.length : text.replace(/\s/g, "").length;
  return count === 0 ? "00" : count;
}

function countWords(text) {
  const count = text.trim().split(/\s+/).filter(Boolean).length;
  return count === 0 ? "00" : count;
}

function countSentences(text) {
  const count = text
    .split("\n")
    .filter((line) => line.trim().length > 0).length;
  return count === 0 ? "00" : count;
}

function getReadingTime(text) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / 200);
  return `< ${minutes} minute(s)`;
}

function updateDensityChart(text, container) {
  const wrapper = container.querySelector(".density__items-wrapper");
  const toggleButton = container.querySelector("#density-toggle");

  const counts = {};
  total = text.replace(/\s/g, "").length;

  for (const char of text) {
    if (char === " ") continue;
    const upperChar = char.toUpperCase();
    counts[upperChar] = (counts[upperChar] || 0) + 1;
  }

  const sortedEntries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  wrapper.innerHTML = "";

  if (total === 0) {
    wrapper.textContent =
      "No characters found. Start typing to see letter density.";
    wrapper.removeAttribute("style");
    return;
  }

  sortedEntries.forEach(([char, count]) => {
    const percentage = ((count / total) * 100).toFixed(1);
    const item = document.createElement("div");
    item.className = "density__item";
    item.innerHTML = `
      <span class="density__letter">${char}</span>
      <progress class="density__progress" value="${count}" max="${total}"></progress>
      <span class="density__percentage">${count} (${percentage}%)</span>
    `;
    wrapper.appendChild(item);
  });

  toggleButton.hidden = sortedEntries.length <= 5;

  const first5 = Array.from(wrapper.children).slice(0, 5);
  const initialHeight = first5.reduce(
    (sum, el) => sum + (el.offsetHeight + 12),
    0
  );
  const fullHeight = wrapper.scrollHeight;

  wrapper.style.setProperty("--initial-density-height", `${initialHeight}px`);
  wrapper.style.setProperty("--max-density-height", `${fullHeight}px`);
  wrapper.classList.toggle("expanded", isExpanded);
}

function showHideLimitCError() {
  if (textArea.hasAttribute("maxlength") && elChksetCharacterLimit.checked) {
    const maxLength = parseInt(textArea.getAttribute("maxlength"));
    elErrorMessage.hidden =
      total > maxLength - 1
        ? !(elErrorMessage.textContent = `Limit reached! Your text exceeds ${maxLength} characters.`)
        : true;
  } else {
    elErrorMessage.hidden = true;
  }
}

function initThemeToggle(toggleBtn) {
  const mode = localStorage.getItem("mode");
  if (!mode || mode === "light") switchLight();
  if (mode === "dark") switchDark();

  toggleBtn.addEventListener("click", () => {
    const mode = localStorage.getItem("mode");
    mode === "light" ? switchDark() : switchLight();
  });
}

function switchLight() {
  html.classList.remove("dark");
  html.classList.add("light");
  localStorage.setItem("mode", "light");
}

function switchDark() {
  html.classList.remove("light");
  html.classList.add("dark");
  localStorage.setItem("mode", "dark");
}
