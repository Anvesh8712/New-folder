//populating the dropdown for states
document
  .getElementById("country")
  .addEventListener("change", async function () {
    const selectedCountry = this.value;
    const stateDropdown = document.getElementById("state");

    // Clear current state options
    stateDropdown.innerHTML = "";

    if (["India", "United States"].includes(selectedCountry)) {
      // Fetch states for the selected country using the provided API endpoint
      try {
        const response = await fetch(
          "https://countriesnow.space/api/v0.1/countries/states",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              country: selectedCountry,
            }),
          }
        );

        const data = await response.json();

        if (!data.error && data.data && Array.isArray(data.data.states)) {
          // Populate the state dropdown
          data.data.states.forEach((stateObj) => {
            const option = document.createElement("option");
            option.value = stateObj.state_code;
            option.textContent = stateObj.name;
            stateDropdown.appendChild(option);
          });
        } else {
          console.error("Error fetching states:", data.msg || "Unknown Error");
        }
      } catch (err) {
        console.error("Error fetching states:", err);
      }
    }
  });

// // Trigger the change event to populate initial states ^
document.getElementById("country").dispatchEvent(new Event("change"));

//logic for checking to sign up one form or two
const signupForm = document.getElementById("signup-form");
const submitButton = document.getElementById("submit-btn");

const multipleScriptsSelect = document.getElementById("multiple-scripts");
const scriptContainer1 = document.getElementById("script-container-1");
const scriptContainer2 = document.getElementById("script-container-2");

multipleScriptsSelect.addEventListener("change", function () {
  if (this.value === "Double") {
    scriptContainer2.style.display = "block";
  } else {
    scriptContainer2.style.display = "none";
  }
});

//submit logic
submitButton.addEventListener("click", async (event) => {
  event.preventDefault();

  //getting all the data
  const first_name = document.getElementById("first-name").value;
  const last_name = document.getElementById("last-name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const phone = document.getElementById("phone").value;
  const country = document.getElementById("country").value;
  const street_address = document.getElementById("street-address").value;
  const address_line2 = document.getElementById("address-line2").value;
  const city = document.getElementById("city").value;
  const state = document.getElementById("state").value;
  const zip_code = document.getElementById("zip-code").value;
  const social_media_url = document.getElementById("social-media").value;
  const how_heard = document.getElementById("how-heard").value;

  let obj = {
    first_name,
    last_name,
    email,
    password,
    phone,
    country,
    street_address,
    address_line2,
    city,
    state,
    zip_code,
    social_media_url,
    how_heard,
  };

  // Using FormData API to collect all the form data including files
  const formData = new FormData(signupForm);

  // Validating email and phone number (same as before)
  //const email = formData.get("email");
  const confirmEmail = formData.get("confirm-email");
  if (email !== confirmEmail) {
    alert(
      "Emails do not match or are invalid. Please check your email entries."
    );
    return;
  }

  //const phone = formData.get("phone");
  console.log("phone: ", phone);
  const phoneRegex = /^[+]?[0-9\\s()-]{10,20}$/;
  if (!phoneRegex.test(phone)) {
    alert("Please enter a valid phone number.");
    return;
  }

  //upload the writer signup adn get the user_id
  let user_id = 0;
  try {
    const response = await fetch("/writerSignup", {
      method: "POST",
      body: JSON.stringify(obj),
      headers: {
        "Content-Type": "application/json",
      }, // No need to set the Content-Type header, fetch does it automatically for FormData
    });

    if (response.ok) {
      const jsonResponse = await response.json();
      user_id = jsonResponse.userId; // Update the user_id with the value from the server response
      console.log("User ID updated:", user_id);
    } else {
      response.text().then((text) => alert("Error: " + text));
    }
  } catch (error) {
    console.error("Error:", error);
  }

  //script 1 submission -> to scripts and upload to aws and get the location
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
      console.error("Error uploading file:", errorData);
      // Handle error, perhaps show a message to the user
    }
  } catch (error) {
    console.error("Network error:", error);
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
        console.error("Error uploading file:", errorData);
        // Handle error, perhaps show a message to the user
      }
    } catch (error) {
      console.error("Network error:", error);
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
      user_id = data.userId; // Update the user_id with the value from the server response
      console.log("User ID updated:", user_id);
    } else {
      response.text().then((text) => alert("Error: " + text));
    }
  } catch (error) {
    console.error("Error:", error);
  }

  //script 2 submission -> to scripts and upload to aws and get the location

  if (multipleScriptsSelect.value === "Double") {
    const fileInput2 = document.getElementById("script-file-2");
    const file2 = fileInput2.files[0]; // Extract the first selected file
    let file_2_location = "";
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: file2,
        headers: {
          "x-filename": file2.name, // Send the filename in a header
        },
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        console.log(jsonResponse);
        file_2_location = jsonResponse.data.Location;
        // Handle successful upload, perhaps update the UI or navigate to another page
      } else {
        const errorData = await response.json();
        console.error("Error uploading file:", errorData);
        // Handle error, perhaps show a message to the user
      }
    } catch (error) {
      console.error("Network error:", error);
      // Handle network errors, perhaps show a message to the user
    }

    const fileSynopsis2 = document.getElementById("synopsis-file-2");
    const synopsis2 = fileSynopsis2.files[0]; // Extract the first selected file
    let synopsis2Location = "";
    if (synopsis2) {
      // A file was submitted
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: synopsis2,
          headers: {
            "x-filename": synopsis2.name, // Send the filename in a header
          },
        });

        if (response.ok) {
          const jsonResponse = await response.json();
          console.log(jsonResponse);
          synopsis2Location = jsonResponse.data.Location;
          // Handle successful upload, perhaps update the UI or navigate to another page
        } else {
          const errorData = await response.json();
          console.error("Error uploading file:", errorData);
          // Handle error, perhaps show a message to the user
        }
      } catch (error) {
        console.error("Network error:", error);
        // Handle network errors, perhaps show a message to the user
      }
    }

    const script_title_2 = document.getElementById("script-title-2").value;
    const co_writer_2 = document.getElementById("co-writer-2").value;
    const script_type_2 = document.getElementById("script-type-2").value;
    const genre_2 = document.getElementById("script-genre-2").value;
    const script_file_path_2 = file_2_location;
    const synopsis_file_path_2 = synopsis2Location;

    scriptObj = {
      script_title_2,
      co_writer_2,
      script_type_2,
      genre_2,
      script_file_path_2,
      synopsis_file_path_2,
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
        user_id = data.userId; // Update the user_id with the value from the server response
        console.log("User ID updated:", user_id);
      } else {
        response.text().then((text) => alert("Error: " + text));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  // Sending form data (including files) to the server
});
