import express from 'express';

const app = express();

app.get("/", (req, res) => {
    res.send("Welcome to Express");

});


app.listen(3210, () => {
    console.log("Sttart server port: 3210");
    
});