const express = require("express");
const app = express();
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require('./routes/routes')
const db = require("./utils/db");

const PORT = 8080

app.use(
	cors({
		origin: "*",
		credentials:true,
		optionsSuccessStatus: 200
	})
);
app.use(bodyParser.json());

db.connect()
    .then(() => {
        console.log("Database Connected!");
    })
    .catch(console.log);

app.use(routes)

app.listen(PORT,()=>{
    console.log(`http://localhost:${PORT}`)
})