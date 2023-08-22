const express = require("express");
const pgp = require("pg-promise")();

require("dotenv").config();
const fileparser = require("./fileparser");

const app = express();
const PORT = process.env.PORT || 3000;

// For elephantsql database
const db = pgp(
  "postgres://eqjjyibu:i-oAtxxWqKVro_A7IVro93JKWzOEdppk@bubble.db.elephantsql.com/eqjjyibu"
);

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

function isAuthenticatedWriter(req, res, next) {
  if (req.session && req.session.isAuthenticatedWriter) {
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

//upload file
app.post("/api/upload", async (req, res) => {
  await fileparser(req)
    .then((data) => {
      res.status(200).json({
        message: "Success",
        data,
      });
    })
    .catch((error) => {
      res.status(400).json({
        message: "An error occurred.",
        error,
      });
    });
});

// Submit - writer route
app.post("/writerSignup", async (req, res) => {
  try {
    console.log("Extracted form data:", req.body);

    const {
      first_name,
      last_name,
      email,
      password,
      phone,
      street_address,
      address_line2,
      city,
      state,
      zip_code,
      country,
      social_media_url,
      how_heard,
    } = req.body;

    // Insert user data into the Users table
    const newUser = await db.one(
      `
        INSERT INTO users2 (
            first_name, last_name, email, password, phone,
            street_address, address_line2, city,
            state, zip_code, country,
            social_media_url
        )
        VALUES (
            $1, $2, $3, $4,
            $5, $6, $7,
            $8, $9, $10,
            $11, $12
        )
        RETURNING user_id
      `,
      [
        first_name,
        last_name,
        email,
        password,
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

    res.status(201).json({
      message: "New User Created",
      userId: parseInt(newUser["user_id"]),
    });

    //return res.redirect("/grader_login.html");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.detail });
  }
});

//scripts upload
app.post("/scriptUpload", async (req, res) => {
  const {
    script_title,
    co_writer,
    script_type,
    genre,
    script_file_path,
    synopsis_file_path,
    user_id,
  } = req.body;

  await db.none(
    `
        INSERT INTO scripts (
            user_id, script_title, co_writer, script_type, genre, script_file_path, synopsis_file_path
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
    [
      user_id,
      script_title,
      co_writer,
      script_type,
      genre,
      script_file_path,
      synopsis_file_path,
    ]
  );
});

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

app.post("/clientSignup", async (req, res) => {
  try {
    console.log("Extracted grader form data:", req.body);
    const { name, email, phone, password, contact_person, address } = req.body;

    // Insert grader data into the graders table
    await db.none(
      `INSERT INTO client (name, email, password, phone_number, contact_person, address)
            VALUES (
            $1, $2, $3, $4,
            $5, $6
        )`,
      [name, email, password, phone, contact_person, address]
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

//writer login
app.post("/writerLogin", async (req, res) => {
  const { email, password } = req.body;

  // Query the database to fetch the grader with the provided email
  try {
    const writer = await db.one("SELECT * FROM users2 WHERE email = $1", [
      email,
    ]);

    // Simple password validation (in a real-world scenario, use hashed passwords with bcrypt or similar)
    if (writer && writer.password === password) {
      //start a session
      req.session.isAuthenticatedWriter = true;
      req.session.writerEmail = writer.email;
      // Redirect to the dashboard.
      console.log("authenticated!");
      return res.redirect("/writer_dashboard.html");

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

//user scripts
app.get("/getUserScripts", isAuthenticatedWriter, async (req, res) => {
  try {
    const genre = req.query.id;
    // Fetch the grader's preferred genres from the database

    // Fetch scripts that match the preferred genres
    const scripts = await db.any(
      "SELECT * FROM scripts WHERE user_id = $1 ORDER BY total_score DESC LIMIT 10",
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

app.get("/getWriterDetails", isAuthenticatedWriter, async (req, res) => {
  try {
    const email = req.session.writerEmail;
    const writer = await db.one("SELECT * FROM users2 WHERE email = $1", [
      email,
    ]);
    res.json(writer);
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

app.get("/getScriptRating", isAuthenticatedWriter, async (req, res) => {
  try {
    const script_id = req.query.script_id; // Assuming grader's email is passed as a query parameter
    console.log("made it to recommended", script_id);
    // Fetch the grader's preferred genres from the database

    // Fetch scripts that match the preferred genres
    const scripts = await db.oneOrNone(
      "SELECT * FROM script_ratings WHERE script_id = $1 LIMIT 10",
      [script_id]
    );

    if (!scripts) {
      return res.json({
        script_id: script_id,
        num_graders: "not graded",
        overall: "not graded",
        concept: "not graded",
        plot: "not graded",
        characters: "not graded",
        dialogue: "not graded",
        emotional_impact: "not graded",
        conflict: "not graded",
        high_stakes: "not graded",
        move_story_forward: "not graded",
        character_changes: "not graded",
        comments: "not graded",
      });
    }

    console.log("lmao: ");
    console.log(scripts);
    res.json(scripts);
  } catch (error) {
    console.error("Error fetching recommended scripts:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint to handle rating submissions
app.post("/submitRating", async (req, res) => {
  try {
    console.log("Extracted grader form data:", req.body);
    let {
      script_id,
      concept,
      plot,
      characters,
      dialogue,
      emotionalImpact,
      conflict,
      highStakes,
      moveStoryForward,
      characterChanges,
      overallScore,
      comments,
    } = req.body;
    comments = " " + comments;
    console.log(comments);
    const existingRow = await db.oneOrNone(
      "SELECT * FROM script_ratings WHERE script_id = $1",
      [script_id]
    );

    if (existingRow) {
      db.none(
        `
  UPDATE script_ratings
  SET
      num_graders = num_graders + 1,
      overall = overall + $1,
      concept = concept + $2,
      plot = plot + $3,
      characters = characters + $4,
      dialogue = dialogue + $5,
      emotional_impact = emotional_impact + $6,
      conflict = conflict + $7,
      high_stakes = high_stakes + $8,
      move_story_forward = move_story_forward + $9,
      character_changes = character_changes + $10,
      comments = CONCAT(comments, $11::VARCHAR(5000))

  WHERE script_id = $12;
`,
        [
          overallScore,
          concept,
          plot,
          characters,
          dialogue,
          emotionalImpact,
          conflict,
          highStakes,
          moveStoryForward,
          characterChanges,
          comments,
          script_id,
        ]
      )
        .then(() => {
          console.log("Comment inserted successfully.");
        })
        .catch((error) => {
          console.error("Error inserting comment:", error);
        });
    } else {
      await db.none(
        `
      INSERT INTO script_ratings (
        script_id,
        num_graders,
        overall,
        concept,
        plot,
        characters,
        dialogue,
        emotional_impact,
        conflict,
        high_stakes,
        move_story_forward,
        character_changes,
        comments
      )
      VALUES (
        $11,
        1,
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $12
      );
    `,
        [
          overallScore,
          concept,
          plot,
          characters,
          dialogue,
          emotionalImpact,
          conflict,
          highStakes,
          moveStoryForward,
          characterChanges,
          script_id,
          comments,
        ]
      );
    }

    res.status(200).send({ message: "Rating updated successfully!" });
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
