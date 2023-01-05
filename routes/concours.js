var express = require("express");
var router = express.Router();

const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
// Connection URL
const url = "mongodb://localhost:27017";
// Database Name
const dbName = "projets";
const collectionName = "concours";
const collectionName1 = "responses";

/* GET concours listing. */
router.get("/", async function (req, res, next) {
  let list = [];
  const client = new MongoClient(url);
  await client.connect();
  const db = client.db(dbName);
  console.log("Connected correctly to server");
  // find all concours
  const concours = await db.collection(collectionName).find();
  await concours.forEach((ccr) => {
    list.push(ccr);
  });

  // send the result as JSON
  res.send(JSON.stringify(list));
  //close the connection
  await client.close();
});

/* Add new Concours */
router.post("/", async function (req, res, next) {
  let name = req.body.name;
  let start_at = req.body.start_at;
  let end_at = req.body.end_at;
  let duration = req.body.duration;

  let concoursAdd = {
    id: Date.now(),
    name: name,
    start_at: new Date(start_at),
    end_at: new Date(end_at),
    duration: duration,
    questions: [
      {
        id: Date.now(),
        content: "Quelle est la capitale du Burkina ?",
        responses: ["Ouagadougou", "Bobo Dioulasso"],
        answer: "Ouagadougou",
      },
      {
        id: Date.now(),
        content: "Quelle est la capitale du Mali ?",
        responses: ["Dori", "Bamako", "Léo"],
        answer: "Bamako",
      },
      {
        id: Date.now(),
        content: "Quelle est la capitale de la France ?",
        responses: ["Paris", "Lyon"],
        answer: "Paris",
      },
    ],
    created_at: Date.now(),
    updated_at: Date.now(),
  };
  // let questions = [
  //   {
  //     id : Date.now(),
  //     content : "Quelle est la capitale du Burkina ?",
  //     responses : [
  //       "Ouagadougou", "Bobo Dioulasso"
  //     ],
  //     answer : "Ouagadougou"
  //   },
  //   {
  //     id : Date.now(),
  //     content : "Quelle est la capitale du Mali ?",
  //     responses : [
  //       "Dori", "Bamako", "Léo"
  //     ],
  //     answer : "Bamako"
  //   },
  //   {
  //     id : Date.now(),
  //     content : "Quelle est la capitale de la France ?",
  //     responses : [
  //       "Paris", "Lyon"
  //     ],
  //     answer : "Paris"
  //   },
  // ];

  const client = new MongoClient(url);
  await client.connect();
  const db = client.db(dbName);
  console.log("Connected correctly to server");
  // insert in concours collections
  await db.collection(collectionName).insertOne(concoursAdd);
  // await db.collection(collectionName1).insertOne(questions);
  res.send(JSON.stringify(concoursAdd));
  //close the connection
  await client.close();
});

/* GET concour from search by id. */
router.get("/show/:id", async function (req, res, next) {
  let concoursList = [];
  let newCr;
  // Get id of concours
  let id = Number(req.params.id);

  const client = new MongoClient(url);
  await client.connect();
  const db = client.db(dbName);

  // find concours by id
  const concours = await db.collection(collectionName).find({ id: id });

  await concours.forEach((concour) => {
    concoursList.push(concour);
  });

  if (concoursList.length > 0) {
    newCr = concoursList[0];
  }

  // send the result as JSON
  res.send(JSON.stringify(newCr));
  //close the connection
  await client.close();
});

/* Delete concours by id. */
router.delete("/:id", async function (req, res, next) {
  // Get id of concours
  let id = Number(req.params.id);
  const client = new MongoClient(url);
  await client.connect();
  const db = client.db(dbName);
  console.log("Connected correctly to server");
  // find all concours
  await db.collection(collectionName).deleteOne({ id: id });

  // send the result as JSON
  res.send(JSON.stringify("Concours " + id + " successfully delete"));
  //close the connection
  await client.close();
});

/* Save concours answers. */
router.post("/save/:id", async function (req, res, next) {
  let name = req.body.name; // Name of the user
  let start_at = req.body.start_at;
  let end_at = req.body.end_at;
  let duration = req.body.duration;
  let cr_id = req.body.concourse_id;

  let responses = {
    id: Date.now(),
    cr_id: cr_id,
    name: name,
    start_at: new Date(start_at),
    end_at: new Date(end_at),
    duration: duration,
    answers: [],
    created_at: Date.now(),
    updated_at: Date.now(),
  };

  const client = new MongoClient(url);
  await client.connect();
  const db = client.db(dbName);

  // insert in concours collections
  await db.collection(collectionName1).insertOne({ responses });
  res.send("ok");
  //close the connection
  await client.close();
});

/* Correct concours answers. */
router.get("/answer/:id", async function (req, res, next) {
  let note = 0;
  let concoursList = [];
  let newCr;
  let answsersList = [];
  let newAnswer;

  let id = Number(req.params.id);

  const client = new MongoClient(url);
  await client.connect();
  const db = client.db(dbName);

  // Find the anwsers of performer
  const answers = await db.collection(collectionName1).find({ id: id });

  await answers.forEach((answer) => {
    answsersList.push(answer);
  });

  if (answsersList.length > 0) {
    newAnswer = answsersList[0];
  }

  // find concours by id
  const concours = await db
    .collection(collectionName)
    .find({ id: newAnswer.cr_id });

  await concours.forEach((concour) => {
    concoursList.push(concour);
  });

  if (concoursList.length > 0) {
    newCr = concoursList[0];
  }

  // now let make correction

  res.send(note);
  //close the connection
  await client.close();
});

module.exports = router;
