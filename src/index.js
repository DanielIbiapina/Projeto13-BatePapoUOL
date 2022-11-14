import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from "joi"
import dayjs from 'dayjs';
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

app.get("/participants", async (req, res) => {
	try {
		const dadosPart = await db.collection("participants").find().toArray()
		console.log(dadosPart);
		res.send(dadosPart);

	} catch (err) {
		console.log(err)
		res.status(500).send()
	}
});

app.post('/participants', async (req, res) => {
	try {
		const { name, lastStatus} = req.body; 
		const usuarioRepetido = await db.collection("participants").findOne({ name: name });
        let { erro} = joi.string().min(1).validate(name);
		

		if (erro !== undefined) {
            res.status(422).send(erro.details.message);
            return
        }

        if (usuarioRepetido !== null) {
            res.sendStatus(409);
            return
        }


		await db.collection("participants").insertOne({
			name,
			lastStatus
		});
		await db.collection("messages").insertOne({ 
			from: name,
			to: 'Todos',
			text: 'entra na sala...',
			type: 'status',
			time: dayjs(Date.now()).format('HH:mm:ss') 
		});

		console.log(res)
		res.status(201).send()
	}
	catch (err) {
		console.log(err)
		res.status(500).send()
	}
});

app.get("/messages", async (req, res) => {
	try {
		const {user }= req.headers;
		const dadosMess = await db.collection("messages").find({}).toArray()

		console.log(dadosMess);
		res.send(dadosMess);

	} catch (err) {
		console.log(err)
	}


	


});

app.post('/messages', async (req, res) => {
	try {
		const dadosPostMess = req.body;
		const { user } = req.headers;
		const messageSchema = joi.object({
			from: joi.string(),
			to: joi.string().min(1),
			text: joi.string().min(1),
			type: joi.string().valid('message', 'private_message'),
			time: joi.string()
		  });


		const dadosPostMessValidados = {
			from: user,
			to: dadosPostMess.to,
			text: dadosPostMess.text,
			type: dadosPostMess.type,
			time: dayjs().format('HH:mm:ss')
		}; 
		const validation = messageSchema.validate(dadosPostMessValidados, { abortEarly: false });
		if (validation.error) {
			console.log(validation.error.details)
			return
		  }
		
		  const fromValido = await db.collection("participants").findOne({ name: user });
		  if (!fromValido){
			res.status(422).send()
			return
		  }
		  await db.collection("messages").insertOne(dadosPostMessValidados)

		console.log(res)
		res.status(201).send()
	}
	catch (err) {
		console.log(err)
		res.status(500).send()
	}
});

app.listen(5000, () => console.log("Server running in port: 5000"));


//ver username com headers
//last status , como salvar de um jeito diferente moongo
//