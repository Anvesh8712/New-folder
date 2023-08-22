function fetchGenres(data) {
  let array = [];
  if (data.genre_action) {
    array.push("Action");
  }
  if (data.genre_mystery) {
    array.push("Mystery");
  }
  if (data.genre_historical) {
    array.push("Historical");
  }
  if (data.genre_horror) {
    array.push("Horror");
  }
  if (data.genre_drama) {
    array.push("Drama");
  }
  if (data.genre_comedy) {
    array.push("Comedy");
  }
  //genres array
  return array;
}

fetch("/getGraderDetails")
  .then((response) => response.json())
  .then((data) => {
    document.getElementById("greetings").textContent = "Hi " + data.name;
    let genre_array = fetchGenres(data);
    return fetch("getRecommendedScripts?genres=" + genre_array.join(","));
  })
  .then((response) => {
    let result = response.json();
    console.log("response: ", result);
    return result;
  })
  .then((scripts) => {
    const scriptList = document.getElementById("scriptList");
    console.log("scripts: ", scripts);
    scripts.forEach((script, index) => {
      const card = document.createElement("div");
      card.className = "pdf-card";
      card.onclick = () => window.open(script.script_file_path, "_blank");

      const title = document.createElement("div");
      title.className = "pdf-card-title";
      title.textContent = script.script_title; // Assuming script has a name property
      card.appendChild(title);

      const author = document.createElement("div");
      author.className = "pdf-card-author";
      author.textContent =
        "Author: " + script.author + "\nCo-Author: " + script.co_writer; // Assuming script has an author property
      card.appendChild(author);

      const genre = document.createElement("div");
      genre.className = "pdf-card-genre";
      genre.textContent = "Genre: " + script.genre; // Assuming script has a genre property
      card.appendChild(genre);

      scriptList.appendChild(card);

      const scriptDropdown = document.getElementById("scriptDropdown");
      const option = document.createElement("option");
      option.value = script.script_id; // Assuming the script object has an id
      option.textContent = script.script_title;
      scriptDropdown.appendChild(option);
    });
  })
  .catch((error) => {
    console.error("Error fetching details:", error);
  });

document
  .getElementById("submitRating")
  .addEventListener("click", async function () {
    const selectedScript = document.getElementById("scriptDropdown").value;
    if (!selectedScript) {
      alert("Please select a script to rate!");
      return;
    }

    const conceptRating = document.getElementById("conceptRating").value;
    const plotRating = document.getElementById("plotRating").value;
    const charactersRating = document.getElementById("charactersRating").value;
    const dialogueRating = document.getElementById("dialogueRating").value;
    const emotionalImpactRating = document.getElementById(
      "emotionalImpactRating"
    ).value;
    const conflictRating = document.getElementById("conflictRating").value;
    const highStakesRating = document.getElementById("highStakesRating").value;
    const moveStoryForwardRating = document.getElementById(
      "moveStoryForwardRating"
    ).value;
    const characterChangesRating = document.getElementById(
      "characterChangesRating"
    ).value;
    const overallScoreRating =
      document.getElementById("overallscoreRating").value;
    const comments = document.getElementById("comments").value;

    // Create the object containing individual ratings
    const ratingsObject = {
      concept: conceptRating,
      plot: plotRating,
      characters: charactersRating,
      dialogue: dialogueRating,
      emotionalImpact: emotionalImpactRating,
      conflict: conflictRating,
      highStakes: highStakesRating,
      moveStoryForward: moveStoryForwardRating,
      characterChanges: characterChangesRating,
      overallScore: overallScoreRating,
      script_id: selectedScript,
      comments: comments,
    };

    console.log(ratingsObject);

    try {
      const response = await fetch("/submitRating", {
        method: "POST",
        body: JSON.stringify(ratingsObject),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("rating sent successfully!");
      } else {
        const errorMessage = await response.text();
        alert("Error: " + errorMessage);
      }
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert("Error submitting the form. Please try again.");
    }
  });
