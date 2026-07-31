const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

const db = new sqlite3.Database("urls.db");

db.run(`
CREATE TABLE IF NOT EXISTS urls(
id INTEGER PRIMARY KEY AUTOINCREMENT,
longUrl TEXT,
shortCode TEXT UNIQUE
)
`);

function generateCode() {
    return Math.random().toString(36).substring(2,8);
}

app.post("/shorten",(req,res)=>{

    const {longUrl}=req.body;

    const code=generateCode();

    db.run(
        "INSERT INTO urls(longUrl,shortCode) VALUES(?,?)",
        [longUrl,code],
        function(err){

            if(err){
                return res.status(500).send(err);
            }

            res.json({
                shortUrl:`http://localhost:${PORT}/${code}`
            });

        }
    );

});

app.get("/:code",(req,res)=>{

    db.get(
        "SELECT longUrl FROM urls WHERE shortCode=?",
        [req.params.code],
        (err,row)=>{

            if(row){
                res.redirect(row.longUrl);
            }else{
                res.send("URL Not Found");
            }

        }
    );

});

app.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`);
});