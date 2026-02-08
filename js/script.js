console.log("script loaded succes!");

//searching for excersizes using button and form
const muscleGroupsMenu = document.getElementById("muscle-groups-menu");
document.getElementById("muscle-menu-submit").addEventListener("click", (e) => {
  e.preventDefault();
  const selectedMuscle = muscleGroupsMenu.value;

  console.log("Muscle Id: ", selectedMuscle);
  getMuscleName(selectedMuscle).then((name) => {
    console.log("Muscle name: ", name);
  });
  console.log("Displaying Exercises: ");
  displayExercises(selectedMuscle);
});

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

async function getExercisesByMuscle(muscleId) {
  try {
    const resp = await fetch(
      `https://wger.de/api/v2/exerciseinfo/?muscles=${muscleId}&language=2&limit=6`
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

async function displayExercises(id) {
  //getting and clearing container
  //   const resultsContainer = document.getElementById("results-container");
  //   resultsContainer.innerHTML = "";

  const exercises = await getExercisesByMuscle(id);
  exercises.forEach((exercise) => {
    const engName = exercise.translations.find((t) => t.language === 2);
    console.log(engName.name);
  });

  /**
   <div class="col-md-4 mb-3">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Bench Press</h5>

                <p class="card-text">
                  <strong>Category:</strong> Chest<br />
                  <strong>Equipment:</strong> Barbell<br />
                  <strong>Muscles:</strong> Pectoralis major
                </p>

                <p class="card-text text-muted">
                  This is a sample description that would be shortened...
                </p>
                <a href="#" class="btn btn-sm btn-primary">Save</a>
              </div>
            </div>
          </div>
   */
}
