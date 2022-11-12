import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;


mongoClient.connect().then(() => {
	db = mongoClient.db("dcComics");
    console.log('mongodb conectado')
});

app.get("/participants", (req, res) => {
	// buscando usuários
	db.collection("participants").find().toArray().then(users => {
		console.log(users); // array de usuários
        res.send(users);
	});
});

app.post("/participants", (req, res) => {
    const {name} = req.body
	db.collection("participants").insertOne({
		name
	})
    .then((response) => {
        console.log(response)
        res.status(201).send()
    } )
});




app.listen(5000, () => console.log("Server running in port: 5000"));