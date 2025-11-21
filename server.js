import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json({ limit: "500mb" }));

const __dirname = path.resolve();
const dataPath = path.join(__dirname, "src/assets/memories.json");

const PORT = process.env.PORT || 3000;

// GET - devolver todas las memorias
app.get("/memories", (req, res) => {
  try {
    const data = fs.readFileSync(dataPath, "utf-8");
    res.json(JSON.parse(data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error reading data file" });
  }
});

// POST - añadir o sobrescribir memorias
app.post("/memories", (req, res) => {
  try {
    const memories = req.body;
    fs.writeFileSync(dataPath, JSON.stringify(memories, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error saving data file" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
