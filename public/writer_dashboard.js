let populateDropdown = async () => {
  fetch("/getWriterDetails")
    .then((response) => response.json())
    .then((data) => {
      console.log("trying to populate");
      console.log("getUserScripts?id=" + data.user_id);
      document.getElementById("greetings").textContent =
        "Hi " + data.first_name;
      return fetch("getUserScripts?id=" + data.user_id);
    })
    .then((response) => {
      let result = response.json();
      console.log("response: ", result);
      return result;
    })
    .then((scripts) => {
      const scriptList = document.getElementById("scriptList");
      scriptList.innerHTML = "";
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

        if (script.num_graders == 0) {
          const rating = document.createElement("div");
          rating.className = "pdf-card-author";
          rating.textContent = "Still being graded!"; // Assuming script has a genre property
          card.appendChild(rating);
        } else {
          const rating = document.createElement("div");
          rating.className = "pdf-card-author";
          rating.textContent =
            "Rating: " + script.total_score / script.num_graders; // Assuming script has a genre property
          card.appendChild(rating);
        }

        scriptList.appendChild(card);

        fetch("/getScriptRating?script_id=" + script.script_id)
          .then((response) => response.json())
          .then((ratings) => {
            const tableBody = document
              .getElementById("scriptsRatingTable")
              .getElementsByTagName("tbody")[0];

            // Clear any existing rows

            // Add each rating as a new row in the table

            const newRow = tableBody.insertRow();

            // Insert cells and set their text content
            newRow.insertCell(0).textContent = script.script_title;
            //newRow.insertCell(1).textContent = ratings.num_graders;
            newRow.insertCell(1).textContent = ratings.overall;
            newRow.insertCell(2).textContent = ratings.concept;
            newRow.insertCell(3).textContent = ratings.plot;
            newRow.insertCell(4).textContent = ratings.characters;
            newRow.insertCell(5).textContent = ratings.dialogue;
            newRow.insertCell(6).textContent = ratings.emotional_impact;
            newRow.insertCell(7).textContent = ratings.conflict;
            newRow.insertCell(8).textContent = ratings.high_stakes;
            newRow.insertCell(9).textContent = ratings.move_story_forward;
            newRow.insertCell(10).textContent = ratings.character_changes;
            newRow.insertCell(11).textContent = ratings.comments;
          })
          .catch((error) => {
            console.error("Error fetching ratings:", error);
          });
      });
    })
    .catch((error) => {
      console.error("Error fetching details:", error);
    });
};

populateDropdown();
