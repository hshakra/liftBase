// WGER Workout Manager API: https://wger.de/en/software/api
// Bootstrap Modal component: https://getbootstrap.com/docs/5.3/components/modal/

// result set for modal lookups
let currentExercises = [];

// search by muscle on submit
const muscleGroupsMenu = document.getElementById("muscle-groups-menu");
document.getElementById("muscle-menu-submit").addEventListener("click", (e) => {
  e.preventDefault();
  displayExercises(muscleGroupsMenu.value);
});

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

// render result cards
async function displayExercises(id) {
  const resultsContainer = document.getElementById("results-container");
  // show loading message
  resultsContainer.innerHTML =
    '<p class="text-center">Loading exercises...</p>';

  const exercises = await getExercisesByMuscle(id);
  currentExercises = exercises || [];
  resultsContainer.innerHTML = "";

  exercises.forEach((exercise, i) => {
    // getting all data
    const engName = exercise.translations.find((t) => t.language === 2);
    console.log(engName.name);

    const name = engName.name;
    const category = exercise.category.name;
    //handling possible description null or undefined
    const description =
      (engName.description || "").replace(/<[^>]*>/g, "").substring(0, 75) +
      "...";
    //array of required equipment
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

    // render exercise card
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
          <button class="btn btn-primary learn-more-btn" data-exercise-index="${i}">
            Learn More
          </button>
          <button class="btn btn-outline-primary favourite-btn" data-exercise-index="${i}" data-exercise-id="${exercise.id}">${favLabel}</button>
        </div>
      </div>
    </div>
    `;
  });

  addLearnMoreListeners();
  addFavouriteListeners();
}

// connect up learn more buttons
function addLearnMoreListeners() {
  document.querySelectorAll(".learn-more-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.currentTarget.dataset.exerciseIndex, 10);
      const exercise = currentExercises[index];
      if (exercise) showExerciseModal(exercise);
    });
  });
}

// toggle add/remove favourites and update button
function addFavouriteListeners() {
  document.querySelectorAll(".favourite-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // get exercise index and id from button data attribute
      const index = parseInt(e.currentTarget.dataset.exerciseIndex, 10);
      const id = parseInt(e.currentTarget.dataset.exerciseId, 10);
      const exercise = currentExercises[index];
      // check if exercise is already in favourites
      if (isFavourite(id)) {
        removeFavourite(id);
        // update button text and class
        e.currentTarget.textContent = "Add to Favourites";
        e.currentTarget.classList.remove("btn-primary");
        e.currentTarget.classList.add("btn-outline-primary");
      } else if (exercise) {
        addFavourite(exercise);
        // update button text and class
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
