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

//submit functionality

const graderForm = document.getElementById("form-grader");
const submitButton = document.getElementById("submit-btn");

submitButton.addEventListener("click", async (event) => {
  event.preventDefault();

  const formData = new FormData(graderForm);

  let obj = {
    name: formData.get("name"),
    email: formData.get("email"),
    contact_person: formData.get("contact-person"),
    password: formData.get("password"),
    phone: formData.get("phone"),
    street_address: formData.get("street-address"),
    address_line2: formData.get("address-line2"),
    city: formData.get("city"),
    state: formData.get("state"),
    zipcode: formData.get("zip-code"),
    country: formData.get("country"),
  };
  const address =
    obj.street_address +
    ", " +
    obj.address_line2 +
    ", " +
    obj.city +
    ", " +
    obj.state +
    ", " +
    obj.country +
    ", " +
    obj.zipcode;

  obj["address"] = address;
  console.log(obj);
  try {
    const response = await fetch("/clientSignup", {
      method: "POST",
      body: JSON.stringify(obj),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      alert("Client Signup Successful!");
      window.location.href = response.url;
    } else {
      const errorMessage = await response.text();
      alert("Error: " + errorMessage);
    }
  } catch (error) {
    console.error("Error submitting the form:", error);
    alert("Error submitting the form. Please try again.");
  }
});
