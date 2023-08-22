let user_id = 0;

let populateDropdown = async () => {
  fetch("/getWriterDetails")
    .then((response) => response.json())
    .then((data) => {
      console.log("trying to populate");
      console.log("getUserScripts?id=" + data.user_id);
      user_id = data.user_id;
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

const submitButton = document.getElementById("submit-btn");

submitButton.addEventListener("click", async (event) => {
  event.preventDefault();

  const fileInput1 = document.getElementById("script-file-1");
  const file1 = fileInput1.files[0]; // Extract the first selected file
  let file_1_location = "";
  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: file1,
      headers: {
        "x-filename": file1.name, // Send the filename in a header
      },
    });

    if (response.ok) {
      const jsonResponse = await response.json();
      console.log(jsonResponse);
      file_1_location = jsonResponse.data.Location;
      // Handle successful upload, perhaps update the UI or navigate to another page
    } else {
      const errorData = await response.json();
      console.log("Error uploading file:", errorData);
      // Handle error, perhaps show a message to the user
    }
  } catch (error) {
    return console.log("Network error:", error);
    // Handle network errors, perhaps show a message to the user
  }

  const fileSynopsis1 = document.getElementById("synopsis-file-1");
  const synopsis1 = fileSynopsis1.files[0]; // Extract the first selected file
  let synopsis1Location = "";
  if (synopsis1) {
    // A file was submitted
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: synopsis1,
        headers: {
          "x-filename": synopsis1.name, // Send the filename in a header
        },
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        console.log(jsonResponse);
        synopsis1Location = jsonResponse.data.Location;
        // Handle successful upload, perhaps update the UI or navigate to another page
      } else {
        const errorData = await response.json();
        return console.log("Error uploading file:", errorData);
        // Handle error, perhaps show a message to the user
      }
    } catch (error) {
      return console.log("Network error:", error);
      // Handle network errors, perhaps show a message to the user
    }
  }

  const script_title = document.getElementById("script-title-1").value;
  const co_writer = document.getElementById("co-writer-1").value;
  const script_type = document.getElementById("script-type-1").value;
  const genre = document.getElementById("script-genre-1").value;
  const script_file_path = file_1_location;
  const synopsis_file_path = synopsis1Location;

  scriptObj = {
    script_title,
    co_writer,
    script_type,
    genre,
    script_file_path,
    synopsis_file_path,
    user_id,
  };

  try {
    const response = await fetch("/scriptUpload", {
      method: "POST",
      body: JSON.stringify(scriptObj),
      headers: {
        "Content-Type": "application/json",
      }, // No need to set the Content-Type header, fetch does it automatically for FormData
    });

    if (response.ok) {
      console.log("User ID updated:", user_id);
    } else {
      return response.text().then((text) => alert("Error: " + text));
    }
  } catch (error) {
    return console.error("Error:", error);
  }
});
