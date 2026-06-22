require("dotenv").config();

const express = require("express");
const cors = require("cors");

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const swaggerDocument = YAML.load("./swagger.yaml");

const authRoutes = require("./routes/auth");
const notesRoutes = require("./routes/notes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
res.status(200).json({
status: "ok"
});
});

app.use("/auth", authRoutes);
app.use("/notes", notesRoutes);

app.use(
"/api-docs",
swaggerUi.serve,
swaggerUi.setup(swaggerDocument)
);

app.get("/", (req, res) => {
res.send("Notes API Running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
console.log(`Server running on port ${PORT}`);
});
