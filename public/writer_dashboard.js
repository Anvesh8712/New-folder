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

        scriptList.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("Error fetching details:", error);
    });
};

populateDropdown();
