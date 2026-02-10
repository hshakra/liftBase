// WGER Workout Manager API: https://wger.de/en/software/api
// Bootstrap Modal component: https://getbootstrap.com/docs/5.3/components/modal/

// result set for modal lookups and for workout builder
let currentExercises = [];
window.currentExercisesForWorkout = currentExercises;

// search by muscle on submit (only on exercises page)
const muscleGroupsMenu = document.getElementById("muscle-groups-menu");
const muscleMenuSubmit = document.getElementById("muscle-menu-submit");
if (muscleMenuSubmit && muscleGroupsMenu) {
  muscleMenuSubmit.addEventListener("click", (e) => {
    e.preventDefault();
    displayExercises(muscleGroupsMenu.value);
  });
}

// fetch muscle name - kept for debugging future muscle name display
async function getMuscleName(id) {
  try {
    const resp = await fetch(`https://wger.de/api/v2/muscle/${id}`);

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }
    const data = await resp.json();
    return data.name_en;
  } catch (e) {
    console.error("Error fetching muscle name:", e);
  }
}

// fetch exercises for muscle
async function getExercisesByMuscle(muscleId) {
  try {
    const resp = await fetch(
      `https://wger.de/api/v2/exerciseinfo/?muscles=${muscleId}&language=2`,
    );

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }
    const data = await resp.json();
    console.log("Exercises by muscle: ");
    console.log(data.results);
    return data.results;
  } catch (e) {
    console.error("Error fetching exercises:", e);
  }
}

// render result cards from a list of exercises (full WGER objects)
function renderResultCards(exercises) {
  const resultsContainer = document.getElementById("results-container");
  if (!resultsContainer) return;

  resultsContainer.classList.remove("loading-state");

  if (!exercises || !exercises.length) {
    resultsContainer.innerHTML =
      '<p class="text-center">No exercises match the current filters.</p>';
    return;
  }

  resultsContainer.innerHTML = "";

  exercises.forEach((exercise) => {
    const engName = exercise.translations.find((t) => t.language === 2);
    if (!engName) return;

    const name = engName.name;
    const category = exercise.category.name;
    const description =
      (engName.description || "").replace(/<[^>]*>/g, "").substring(0, 75) +
      "...";
    const eqNames = exercise.equipment.map((eq) => eq.name).join(", ");
    const muscleNames = exercise.muscles
      .map((m) => m.name_en || m.name)
      .join(", ");

    let favLabel;
    if (isFavourite(exercise.id)) {
      favLabel = "Remove from Favourites";
    } else {
      favLabel = "Add to Favourites";
    }

    resultsContainer.innerHTML += `
    <div class="col-md-4 mb-3">
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">${name}</h5>
        <p class="card-text">
          <strong>Category:</strong> ${category}
          <br />
          <strong>Equipment:</strong> ${eqNames}
          <br />
          <strong>Muscles:</strong> ${muscleNames}
        </p>
        <p class="card-text text-muted">
        ${description}
        </p>
        <div class="card-buttons">
          <button class="btn btn-primary learn-more-btn" data-exercise-id="${exercise.id}">
            Learn More
          </button>
          <button class="btn btn-outline-primary favourite-btn" data-exercise-id="${exercise.id}">${favLabel}</button>
          <button class="btn btn-outline-secondary btn-sm add-to-workout-btn" data-exercise-id="${exercise.id}">Add to Workout</button>
        </div>
      </div>
    </div>
    `;
  });

  addLearnMoreListeners();
  addFavouriteListeners();
  // Add to Workout is handled by event delegation on #results-container (see init)
}

// apply filters and re-render (uses filter state from filters.js)
function applyFilters() {
  const filtered = getFilteredExercises(currentExercises);
  renderResultCards(filtered);
  if (typeof updateFilterIndicator === "function") {
    updateFilterIndicator(filtered.length, currentExercises.length);
  }
}

// expose for filters.js
window.applyFilters = applyFilters;

// load exercises, then build filter UI and show results
async function displayExercises(id) {
  const resultsContainer = document.getElementById("results-container");
  const filterPanel = document.getElementById("filter-panel");
  if (resultsContainer) {
    resultsContainer.classList.add("loading-state");
    resultsContainer.innerHTML =
      '<p class="text-center">Loading exercises...</p>';
  }
  if (filterPanel) filterPanel.style.display = "none";

  const exercises = await getExercisesByMuscle(id);
  currentExercises = exercises || [];
  window.currentExercisesForWorkout = currentExercises;

  if (!currentExercises.length) {
    if (resultsContainer) {
      resultsContainer.classList.remove("loading-state");
      resultsContainer.innerHTML =
        '<p class="text-center">No exercises found for this muscle group.</p>';
    }
    return;
  }

  const equipmentList = getEquipmentFromExercises(currentExercises);
  if (filterPanel) {
    filterPanel.style.display = "block";
    renderFilterPanel(equipmentList);
  }

  applyFilters();
}

// connect up learn more buttons (by exercise id)
function addLearnMoreListeners() {
  document.querySelectorAll(".learn-more-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.currentTarget.dataset.exerciseId, 10);
      const exercise = currentExercises.find((ex) => ex.id === id);
      if (exercise) showExerciseModal(exercise);
    });
  });
}

// toggle add/remove favourites and update button
function addFavouriteListeners() {
  document.querySelectorAll(".favourite-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.currentTarget.dataset.exerciseId, 10);
      const exercise = currentExercises.find((ex) => ex.id === id);
      if (isFavourite(id)) {
        removeFavourite(id);
        e.currentTarget.textContent = "Add to Favourites";
        e.currentTarget.classList.remove("btn-primary");
        e.currentTarget.classList.add("btn-outline-primary");
      } else if (exercise) {
        addFavourite(exercise);
        e.currentTarget.textContent = "Remove from Favourites";
        e.currentTarget.classList.remove("btn-outline-primary");
        e.currentTarget.classList.add("btn-primary");
      }
    });
  });
}

// open modal with exercise details
function showExerciseModal(exercise) {
  const engName = exercise.translations.find((t) => t.language === 2);
  if (!engName) return;

  const name = engName.name;
  const category = exercise.category.name;
  const fullDesc = engName.description || "No description available.";
  const eqNames = exercise.equipment.map((eq) => eq.name).join(", ") || "None";
  const muscleNames =
    exercise.muscles.map((m) => m.name_en || m.name).join(", ") || "None";

  const modalContent = document.getElementById("modal-content-main");
  modalContent.innerHTML = `
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">${name}</h5>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
    <div class="modal-body">
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Equipment:</strong> ${eqNames}</p>
      <p><strong>Muscles:</strong> ${muscleNames}</p>
      <hr />
      <h6>Description</h6>
      <div class="modal-description">${fullDesc}</div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
    </div>
  `;

  const modalEl = document.getElementById("exampleModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

// search input: debounced filter (wire in HTML or here if filter-search exists)
(function () {
  const searchInput = document.getElementById("filter-search");
  if (!searchInput) return;
  searchInput.addEventListener(
    "input",
    window.debounce(function () {
      setFilterSearchQuery(searchInput.value);
      applyFilters();
    }, 300),
  );
})();

// event delegation for Add to Workout: single listener, no duplicate handlers
(function () {
  const resultsContainer = document.getElementById("results-container");
  if (!resultsContainer) return;
  resultsContainer.addEventListener("click", function (e) {
    const btn = e.target && e.target.closest && e.target.closest(".add-to-workout-btn");
    if (!btn) return;
    e.preventDefault();
    const id = parseInt(btn.getAttribute("data-exercise-id"), 10);
    if (Number.isNaN(id)) return;
    const exercises = window.currentExercisesForWorkout || [];
    const exercise = exercises.find((ex) => ex && ex.id === id);
    if (exercise && typeof addToWorkout === "function") addToWorkout(exercise);
  });
})();
