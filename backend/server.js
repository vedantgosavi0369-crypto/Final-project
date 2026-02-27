console.log("Server file loaded")
const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")
const { createClient } = require("@supabase/supabase-js")

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

app.get("/api", (req, res) => {
    res.json({ message: "Backend running successfully" })
})

app.use(express.static(path.join(__dirname, "../frontend/dist")))

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"))
})

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(5000, () => {
    console.log("Server running on port 5000")
})