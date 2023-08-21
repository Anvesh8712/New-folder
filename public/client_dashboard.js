let populateDropdown = async () => {
  fetch("/getClientDetails")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("greetings").textContent = "Hi " + data.name;
      let genre = document.getElementById("genreSelect").value;
      console.log("genre: ", genre);
      return fetch("getTopScripts?genre=" + genre);
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
      });
    })
    .catch((error) => {
      console.error("Error fetching details:", error);
    });
};

populateDropdown();

const dropdown = document
  .getElementById("genreSelect")
  .addEventListener("change", async function () {
    console.log("change");
    populateDropdown();
  });
