const graderForm = document.getElementById("grader-login-form");
const loginButton = document.getElementById("login-btn");

loginButton.addEventListener("click", async (event) => {
  event.preventDefault();

  const formData = new FormData(graderForm);

  let obj = {
    email: formData.get("email"),
    password: formData.get("password"),
    userType: formData.get("userType"),
  };

  console.log(obj);
  if (obj.userType == "grader") {
    try {
      const response = await fetch("/graderLogin", {
        method: "POST",
        body: JSON.stringify(obj),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.redirected) {
        window.location.href = response.url; // Redirect the browser to the new URL
      } else if (response.ok) {
        alert("Grader Signup Successful!");
        //graderForm.reset();
        window.redirect;
      } else {
        const errorMessage = await response.message.text();
        alert("Error: " + errorMessage);
      }
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert("Error submitting the form. Please try again.");
    }
  } else if (obj.userType == "client") {
    console.log("client");
    try {
      const response = await fetch("/clientLogin", {
        method: "POST",
        body: JSON.stringify(obj),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.redirected) {
        window.location.href = response.url; // Redirect the browser to the new URL
      } else if (response.ok) {
        alert("Grader Signup Successful!");
        //graderForm.reset();
        window.redirect;
      } else {
        const errorMessage = await response.message.text();
        alert("Error: " + errorMessage);
      }
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert("Error submitting the form. Please try again.");
    }
  }
});
