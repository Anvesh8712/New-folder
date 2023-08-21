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

// // Trigger the change event to populate initial states
document.getElementById("country").dispatchEvent(new Event("change"));

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

submitButton.addEventListener("click", async (event) => {
  event.preventDefault();

  // Using FormData API to collect all the form data including files
  const formData = new FormData(signupForm);

  // Validating email and phone number (same as before)
  const email = formData.get("email");
  const confirmEmail = formData.get("confirm-email");
  if (email !== confirmEmail) {
    alert(
      "Emails do not match or are invalid. Please check your email entries."
    );
    return;
  }

  const phone = formData.get("phone");
  console.log("phone: ", phone);
  const phoneRegex = /^[+]?[0-9\\s()-]{10,20}$/;
  if (!phoneRegex.test(phone)) {
    alert("Please enter a valid phone number.");
    return;
  }

  // Sending form data (including files) to the server
  try {
    const response = await fetch("/writerSignup", {
      method: "POST",
      body: formData, // No need to set the Content-Type header, fetch does it automatically for FormData
    });

    if (response.redirected) {
      window.location.href = response.url;
    }
    if (response.ok) {
      window.redirect;
    } else {
      response.text().then((text) => alert("Error: " + text));
    }
  } catch (error) {
    console.error("Error:", error);
  }
});
