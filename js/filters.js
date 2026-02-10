// client-side filtering for exercise results (name + equipment)

// filter state
let filterSearchQuery = "";
let filterEquipmentSelected = [];

// debounce helper (exposed for script.js search input)
function debounce(fn, ms) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}
window.debounce = debounce;

// extract unique equipment names from current exercises (from script.js scope)
function getEquipmentFromExercises(exercises) {
  const set = new Set();
  if (!exercises || !exercises.length) return [];
  exercises.forEach((ex) => {
    (ex.equipment || []).forEach((eq) => {
      if (eq && eq.name) set.add(eq.name);
    });
  });
  return Array.from(set).sort();
}

// return exercises that match current filter state (used by script.js)
function getFilteredExercises(exercises) {
  if (!exercises || !exercises.length) return [];

  let list = exercises;

  // filter by search (name)
  if (filterSearchQuery.trim()) {
    const q = filterSearchQuery.trim().toLowerCase();
    list = list.filter((ex) => {
      const engName = ex.translations && ex.translations.find((t) => t.language === 2);
      const name = (engName && engName.name) || "";
      return name.toLowerCase().includes(q);
    });
  }

  // filter by equipment (if any selected)
  if (filterEquipmentSelected.length > 0) {
    list = list.filter((ex) => {
      const eqNames = (ex.equipment || []).map((eq) => eq.name);
      return filterEquipmentSelected.some((selected) => eqNames.includes(selected));
    });
  }

  return list;
}

// set search query from external (e.g. script.js search input)
function setFilterSearchQuery(q) {
  filterSearchQuery = q || "";
}

// clear all filters and refresh (called from UI)
function clearFilters() {
  filterSearchQuery = "";
  filterEquipmentSelected = [];
  const searchInput = document.getElementById("filter-search");
  if (searchInput) searchInput.value = "";
  document.querySelectorAll(".filter-equipment-checkbox:checked").forEach((cb) => {
    cb.checked = false;
  });
  if (typeof window.applyFilters === "function") window.applyFilters();
}

// build filter panel HTML and wire up listeners (called after results loaded)
function renderFilterPanel(equipmentList) {
  const panel = document.getElementById("filter-panel");
  const collapse = document.getElementById("filter-collapse");
  const indicator = document.getElementById("filter-indicator");
  const countEl = document.getElementById("filtered-count");
  if (!panel || !collapse) return;

  // equipment checkboxes
  const container = document.getElementById("filter-equipment-list");
  if (container) {
    container.innerHTML = equipmentList
      .map(
        (name) => `
      <div class="form-check">
        <input class="form-check-input filter-equipment-checkbox" type="checkbox" value="${name}" id="eq-${name.replace(/\s+/g, "-")}" />
        <label class="form-check-label" for="eq-${name.replace(/\s+/g, "-")}">${name}</label>
      </div>
    `
      )
      .join("");
  }

  // equipment checkbox change
  document.querySelectorAll(".filter-equipment-checkbox").forEach((cb) => {
    cb.addEventListener("change", () => {
      filterEquipmentSelected = Array.from(
        document.querySelectorAll(".filter-equipment-checkbox:checked")
      ).map((el) => el.value);
      if (typeof window.applyFilters === "function") window.applyFilters();
    });
  });

  if (indicator) indicator.style.display = "block";
}

// update active filter count (called from applyFilters in script.js)
function updateFilterIndicator(filteredCount, totalCount) {
  const countEl = document.getElementById("filtered-count");
  const activeBadge = document.getElementById("filter-active-badge");
  if (countEl) countEl.textContent = filteredCount;
  if (activeBadge) {
    const hasActive = filterSearchQuery.trim() || filterEquipmentSelected.length > 0;
    activeBadge.style.display = hasActive ? "inline-block" : "none";
    activeBadge.textContent =
      filterEquipmentSelected.length > 0
        ? (filterSearchQuery.trim() ? "Search + " : "") + filterEquipmentSelected.length + " equipment"
        : "Search";
  }
}
