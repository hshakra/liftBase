// Bootstrap Modal component: https://getbootstrap.com/docs/5.3/components/modal/

// render favourites list from storage
function renderFavs() {
  const container = document.getElementById("favourites-container");
  const favs = getFavs();

  // base case / empty list
  if (!favs.length) {
    container.innerHTML = '<p class="text-center">No favourites yet.</p>';
    return;
  }

  // clear container
  container.innerHTML = "";

  favs.forEach((exercise) => {
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

    // render exercise card
    container.innerHTML += `
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
          <button class="btn btn-primary learn-more-btn" data-exercise-id="${exercise.id}">Learn More</button>
          <button class="btn btn-outline-primary remove-favourite-btn" data-exercise-id="${exercise.id}">Remove from Favourites</button>
          <button class="btn btn-outline-secondary btn-sm add-to-workout-btn" data-exercise-id="${exercise.id}">Add to Workout</button>
        </div>
      </div>
    </div>
    `;
  });

  addLearnMoreListeners();
  addRemoveFavouriteListeners();
  addFavouritesWorkoutListeners();
}

// wire Add to Workout on favourites page
function addFavouritesWorkoutListeners() {
  document.querySelectorAll(".add-to-workout-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.currentTarget.dataset.exerciseId, 10);
      const exercise = getFavs().find((ex) => ex.id === id);
      if (exercise && typeof addToWorkout === "function")
        addToWorkout(exercise);
    });
  });
}

// connecting learn more button to modal
function addLearnMoreListeners() {
  document.querySelectorAll(".learn-more-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // get exercise id from button data attribute
      const id = parseInt(e.currentTarget.dataset.exerciseId, 10);
      const exercise = getFavs().find((ex) => ex.id === id);
      if (exercise) showExerciseModal(exercise);
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
  // render modal content
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

  // show modal
  const modalEl = document.getElementById("exampleModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

// wire up remove buttons
function addRemoveFavouriteListeners() {
  document.querySelectorAll(".remove-favourite-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // get exercise id from button data attribute
      const id = parseInt(e.currentTarget.dataset.exerciseId, 10);
      // remove exercise from favourites
      removeFavourite(id);
      renderFavs();
    });
  });
}

renderFavs();
