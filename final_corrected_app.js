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
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Serve static files
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/scriptUpload.html");
});

// Submit - writer route
app.post(
  "/submit",
  upload.fields([
    { name: "script-file", maxCount: 2 },
    { name: "synopsis-file", maxCount: 2 },
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
      const script_title = req.body["script-title"];
      const co_writer = req.body["co-writer"];
      const script_type = req.body["script-type"];
      const genre = req.body["script-genre"];
      const script_file_path = req.files["script-file"][0].path;
      const synopsis_file_path = req.files["synopsis-file"]
        ? req.files["synopsis-file"][0].path
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
