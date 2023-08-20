const express = require("express");
const pgp = require("pg-promise")();
const multer = require("multer"); // For file uploads

const app = express();
const PORT = process.env.PORT || 3000;

// For elephantsql database
const db = pgp(
  "postgres://eqjjyibu:i-oAtxxWqKVro_A7IVro93JKWzOEdppk@bubble.db.elephantsql.com/eqjjyibu"
);

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

//for suthenticated session
const session = require("express-session");

app.use(
  session({
    secret: "your-secret-key", // Choose a random string for encryption
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // For development, keep secure as false. For production, it should be true.
  })
);

function isAuthenticatedGrader(req, res, next) {
  if (req.session && req.session.isAuthenticatedGrader) {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
}

function isAuthenticatedClient(req, res, next) {
  if (req.session && req.session.isAuthenticatedClient) {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
}

// Serve static files
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/homepage.html");
});

// Submit - writer route
app.post(
  "/submit",
  upload.fields([
    { name: "script-file-1", maxCount: 1 },
    { name: "synopsis-file-1", maxCount: 1 },
    { name: "script-file-2", maxCount: 1 },
    { name: "synopsis-file-2", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log("Extracted form data:", req.body);

      const {
        "first-name": first_name,
        "last-name": last_name,
        email,
        phone,
        "street-address": street_address,
        "address-line2": address_line2,
        city,
        state,
        "zip-code": zip_code,
        country,
        "social-media": social_media_url,
        "how-heard": how_heard,
      } = req.body;

      // Insert user data into the Users table
      const newUser = await db.one(
        `
        INSERT INTO users2 (
            first_name, last_name, email, phone,
            street_address, address_line2, city,
            state, zip_code, country,
            social_media_url
        )
        VALUES (
            $1, $2, $3, $4,
            $5, $6, $7,
            $8, $9, $10,
            $11
        )
        RETURNING user_id
      `,
        [
          first_name,
          last_name,
          email,
          phone,
          street_address,
          address_line2,
          city,
          state,
          zip_code,
          country,
          social_media_url,
        ]
      );

      // Insert script data into the Scripts table using the user's ID and the paths to the stored files
      const script_title = req.body["script-title-1"];
      const co_writer = req.body["co-writer-1"];
      const script_type = req.body["script-type-1"];
      const genre = req.body["script-genre-1"];
      const script_file_path = req.files["script-file-1"][0].path.replace(
        "public\\",
        ""
      );
      const synopsis_file_path = req.files["synopsis-file-1"]
        ? req.files["synopsis-file-1"][0].path.replace("public\\", "")
        : null;

      if (req.body["multiple-scripts"] == "Double") {
        const script_title_2 = req.body["script-title-2"];
        const co_writer_2 = req.body["co-writer-2"];
        const script_type_2 = req.body["script-type-2"];
        const genre_2 = req.body["script-genre-2"];
        const script_file_path_2 = req.files["script-file-2"][0].path.replace(
          "public\\",
          ""
        );
        const synopsis_file_path_2 = req.files["synopsis-file-2"]
          ? req.files["synopsis-file-1"][0].path.replace("public\\", "")
          : null;

        await db.none(
          `
        INSERT INTO scripts (
            user_id, script_title, co_writer, script_type, genre, script_file_path, synopsis_file_path
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
          [
            newUser.user_id,
            script_title_2,
            co_writer_2,
            script_type_2,
            genre_2,
            script_file_path_2,
            synopsis_file_path_2,
          ]
        );
      }

      await db.none(
        `
        INSERT INTO scripts (
            user_id, script_title, co_writer, script_type, genre, script_file_path, synopsis_file_path
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
        [
          newUser.user_id,
          script_title,
          co_writer,
          script_type,
          genre,
          script_file_path,
          synopsis_file_path,
        ]
      );

      res.status(200).json({ message: "Data saved successfully", newUser });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "An error occurred" });
    }
  }
);

// Grader Signup route
app.post("/graderSignup", async (req, res) => {
  try {
    console.log("Extracted grader form data:", req.body);
    const {
      name,
      email,
      phone,
      experience,
      password,
      genre_action,
      genre_comedy,
      genre_drama,
      genre_horror,
      genre_historical,
      genre_mystery,
      days_to_grade,
    } = req.body;

    // Insert grader data into the graders table
    await db.none(
      `INSERT INTO graders2 (name, email, password, phone, experience, genre_action, genre_comedy, genre_drama, genre_horror, genre_historical, genre_mystery, days_to_grade)
            VALUES (
            $1, $2, $3, $4,
            $5, $6, $7,
            $8, $9, $10,
            $11, $12
        )`,
      [
        name,
        email,
        password,
        phone,
        experience,
        genre_action,
        genre_comedy,
        genre_drama,
        genre_horror,
        genre_historical,
        genre_mystery,
        days_to_grade,
      ]
    );

    return res.redirect("/grader_login.html");
  } catch (err) {
    console.error("Error inserting grader data:", err);
    res.status(500).send("Server Error");
  }
});

//loggingg in grader
// Grader Authentication Endpoint
app.post("/graderLogin", async (req, res) => {
  const { email, password } = req.body;

  // Query the database to fetch the grader with the provided email
  try {
    const grader = await db.one("SELECT * FROM graders2 WHERE email = $1", [
      email,
    ]);

    // Simple password validation (in a real-world scenario, use hashed passwords with bcrypt or similar)
    if (grader && grader.password === password) {
      //start a session
      req.session.isAuthenticatedGrader = true;
      req.session.graderEmail = grader.email;
      // Redirect to the dashboard.
      console.log("authenticated!");
      return res.redirect("/grader_dashboard.html");

      res.json({ status: "success", message: "Logged in successfully" });
    } else {
      res.status(401).json({ status: "error", message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error during grader login:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Server error during login" });
  }
});

//logging in client
app.post("/clientLogin", async (req, res) => {
  const { email, password } = req.body;

  // Query the database to fetch the grader with the provided email
  try {
    const client = await db.one("SELECT * FROM client WHERE email = $1", [
      email,
    ]);

    // Simple password validation (in a real-world scenario, use hashed passwords with bcrypt or similar)
    if (client && client.password === password) {
      //start a session
      req.session.isAuthenticatedClient = true;
      req.session.clientEmail = client.email;
      // Redirect to the dashboard.
      console.log("authenticated!");
      return res.redirect("/client_dashboard.html");
    } else {
      res.status(401).json({ status: "error", message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error during grader login:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Server error during login" });
  }
});

app.get("/getTopScripts", isAuthenticatedClient, async (req, res) => {
  try {
    const genre = req.query.genre;
    // Fetch the grader's preferred genres from the database

    // Fetch scripts that match the preferred genres
    const scripts = await db.any(
      "SELECT * FROM scripts WHERE genre = $1 ORDER BY total_score DESC LIMIT 10",
      [genre]
    );

    console.log(scripts);

    for (const script of scripts) {
      const author = await db.one(
        "SELECT first_name, last_name FROM users2 WHERE user_id = ($1) LIMIT 1",
        [script.user_id]
      );
      script.author = author.first_name + " " + author.last_name;
    }

    res.json(scripts);
  } catch (error) {
    console.error("Error fetching recommended scripts:", error);
    res.status(500).send("Internal Server Error");
  }
});

//dashboard population
app.get("/getGraderDetails", isAuthenticatedGrader, async (req, res) => {
  try {
    const email = req.session.graderEmail;
    const grader = await db.one("SELECT * FROM graders2 WHERE email = $1", [
      email,
    ]);
    res.json(grader);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Server error fetching grader details",
    });
  }
});

//client details
app.get("/getClientDetails", isAuthenticatedClient, async (req, res) => {
  try {
    const email = req.session.clientEmail;
    const client = await db.one("SELECT * FROM client WHERE email = $1", [
      email,
    ]);
    res.json(client);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Server error fetching grader details",
    });
  }
});

app.get("/getRecommendedScripts", isAuthenticatedGrader, async (req, res) => {
  try {
    const genres = req.query.genres.split(","); // Assuming grader's email is passed as a query parameter
    console.log("made it to recommended", genres);
    // Fetch the grader's preferred genres from the database

    // Fetch scripts that match the preferred genres
    const scripts = await db.any(
      "SELECT * FROM scripts WHERE genre = ANY($1) LIMIT 10",
      [genres]
    );

    console.log(scripts);

    // Randomize and select top 3
    let randomizedScripts = scripts.sort(() => 0.5 - Math.random()).slice(0, 3);

    for (const script of randomizedScripts) {
      const author = await db.one(
        "SELECT first_name, last_name FROM users2 WHERE user_id = ($1) LIMIT 1",
        [script.user_id]
      );

      console.log(author);

      script.author = author.first_name + " " + author.last_name;
    }

    console.log("lmao: ");
    console.log(randomizedScripts);
    res.json(randomizedScripts);
  } catch (error) {
    console.error("Error fetching recommended scripts:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint to handle rating submissions
app.post("/submitRating", async (req, res) => {
  try {
    console.log("Extracted grader form data:", req.body);
    const { script_id, averageRating } = req.body;

    // Fetch the current total_score and num_grader values for the specified script
    const script = await db.one(
      "SELECT total_score, num_graders FROM scripts WHERE script_id = $1",
      [script_id]
    );

    // Calculate the new total score and increment num_grader
    const newTotalScore = script.total_score + averageRating;
    const newNumGrader = script.num_graders + 1;

    // Update the script table with the new values
    await db.none(
      "UPDATE scripts SET total_score = $1, num_graders = $2 WHERE script_id = $3",
      [newTotalScore, newNumGrader, script_id]
    );

    res.status(200).send({ message: "Rating updated successfully!" });
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
