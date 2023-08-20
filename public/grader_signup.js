const graderForm = document.getElementById("form-grader");
const submitButton = document.getElementById("submit-btn");

submitButton.addEventListener("click", async (event) => {
  event.preventDefault();

  const formData = new FormData(graderForm);

  let obj = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone"),
    experience: formData.get("experience"),
    genre_action: false,
    genre_comedy: false,
    genre_drama: false,
    genre_horror: false,
    genre_historical: false,
    genre_mystery: false,
    days_to_grade: formData.get("days-to-grade"),
  };

  genres = formData.getAll("genres");
  genres.forEach((genre) => {
    if (obj.hasOwnProperty(`genre_${genre}`)) {
      obj[`genre_${genre}`] = true;
    }
  });
  console.log(obj);
  try {
    const response = await fetch("/graderSignup", {
      method: "POST",
      body: JSON.stringify(obj),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      alert("Grader Signup Successful!");
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
