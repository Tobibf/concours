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
router.get("/", async function (req, res) {
  let list = [];
  const client = new MongoClient(url);
  await client.connect();
  const db = client.db(dbName);

  // find all concours
  const concours = await db.collection(collectionName).find();
  await concours.forEach((ccr) => {
    list.push(ccr);
  });

  // send the result as JSON
  if (list.length > 0) {
    res.send(JSON.stringify(list));
  } else {
    res.send("Please create a new concour");
  }

  //close the connection
  await client.close();
});

/* Add new Concours */
router.post("/addConcours", async function (req, res) {
  let name = String(req.body.name);
  let description = String(req.body.description);
  let start_at = req.body.start_at;
  let end_at = req.body.end_at;
  let duration = req.body.duration;

  let questions = [
    {
      id: Date.now(),
      content: "Quelle est la capitale du Burkina ?",
      responses: ["Ouagadougou", "Bobo Dioulasso"],
      answer: "Ouagadougou",
      mark: 2,
    },
    {
      id: Date.now(),
      content: "Quelle est la capitale du Mali ?",
      responses: ["Dori", "Bamako", "Léo"],
      answer: "Bamako",
      mark: 3,
    },
    {
      id: Date.now(),
      content: "Quelle est la capitale de la France ?",
      responses: ["Paris", "Lyon"],
      answer: "Paris",
      mark: 5,
    },
  ];

  let concoursAdd = {
    id: Date.now(),
    name: name,
    description: description,
    start_at: new Date(start_at),
    end_at: new Date(end_at),
    duration: duration,
    questions: questions,
    created_at: Date.now(),
    updated_at: Date.now(),
  };

  const client = new MongoClient(url);
  await client.connect();
  const db = client.db(dbName);
  console.log("Connected correctly to server");

  // insert in concours collections
  await db.collection(collectionName).insertOne(concoursAdd);

  res.send(JSON.stringify(concoursAdd));
  //close the connection
  await client.close();
});

/* GET concours from search by id. */
router.get("/show/:id", async function (req, res) {
  let concoursList = [];
  let newCr;
  // Get id of concours
  let id = Number(req.params.id);

  const client = new MongoClient(url);
  await client.connect();
  const db = client.db(dbName);

  // find concours by id
  const concours = await db.collection(collectionName).find({ id: id });

  await concours.forEach((cr) => {
    concoursList.push(cr);
  });

  if (concoursList.length > 0) {
    newCr = concoursList[0];
    // send the result as JSON
    res.send(JSON.stringify(newCr));
  } else {
    res.send("This concour does not exist");
  }
  //close the connection
  await client.close();
});

/* Delete concours by id. */
router.delete("/delete/:id", async function (req, res) {
  let id = Number(req.params.id); // Get id of concours

  const client = new MongoClient(url);
  await client.connect();
  const db = client.db(dbName);

  // find all concours
  const result = await db.collection(collectionName).deleteOne({ id: id });

  if (result.deletedCount > 0) {
    // send the result as JSON
    res.send(JSON.stringify("Concour " + id + " successfully delete"));
  } else {
    res.send("Concour doest not exist!");
  }

  //close the connection
  await client.close();
});

/* Save concours answers. */
router.post("/save/answers", async function (req, res) {
  let name = req.body.name; // Name of the user
  let start_at = req.body.start_at;
  let end_at = req.body.end_at;
  let duration = req.body.duration;
  let cr_id = Number(req.body.cr_id);
  let user_id = Number(req.body.user_id);
  let answersList = [];
  let concoursList = [];
  let newCr;

  const client = new MongoClient(url);
  await client.connect();
  const db = client.db(dbName);

  // find concours by id which is performing
  const concours = await db.collection(collectionName).find({ id: cr_id });

  await concours.forEach((cr) => {
    concoursList.push(cr);
  });
 
  if (concoursList.length > 0) {
    newCr = concoursList[0];
    let questionsList = req.body.questions;

    let answer = null;
    // Get all answers of user
    for (let i = 0; i < newCr.questions.length; i++) {
      // Put the responses of each question
      for (let j = 0; j < newCr.questions[i].responses.length; j++) {
        // Verify if answer is checked
        if (questionsList[i][j] == "on") {
          answer = newCr.questions[i].responses[j];
        }
      }

      answersList.push(answer);
    }

    // Create user answers
    let responses = {
      id: Date.now(),
      cr_id: cr_id,
      name: name,
      user_id: user_id,
      start_at: new Date(start_at),
      end_at: new Date(end_at),
      duration: duration,
      answers: answersList,
      note: 0,
      created_at: Date.now(),
      updated_at: Date.now(),
    };
    // insert in concours collections
    await db.collection(collectionName1).insertOne(responses);
    res.send(JSON.stringify(responses));
  } else {
    res.send("Concour does not exist");
  }
  //close the connection
  await client.close();
});

// Correct a concour
router.get("/answer/:id/:user_id", async function (req, res) {
  let note = 0;
  let concoursList = [];
  let newCr;
  let answersList = [];
  let newAnswer;

  let id = Number(req.params.id); // ID of the answers of performer
  let user_id = Number(req.params.user_id);

  const client = new MongoClient(url);
  await client.connect();
  const db = client.db(dbName);

  // Find the answers of performer
  const answers = await db
    .collection(collectionName1)
    .find({ id: id, user_id: user_id });

  await answers.forEach((answer) => {
    answersList.push(answer);
  });

  if (answersList.length > 0) {
    newAnswer = answersList[0];

    // Find the answers of performer
    const concours = await db
      .collection(collectionName)
      .find({ id: newAnswer.cr_id });

    await concours.forEach((cr) => {
      concoursList.push(cr);
    });

    if (concoursList.length > 0) {
      newCr = concoursList[0];

      // now let make correction
      for (let i = 0; i < newCr.questions.length; i++) {
        if (newCr.questions[i].answer == newAnswer.answers[i]) {
          note += newCr.questions[i].mark;
        }
      }

      // Update Answer note
      let answer = await db
        .collection(collectionName1)
        .findOneAndUpdate(
          { id: id },
          { $set: { note: note, updated_at: new Date() } },
          { new: true }
        );

      res.send(JSON.stringify(answer));
    } else {
      res.send("Contact the administrator");
    }
  } else {
    res.send("Answer doest not exist");
  }

  //close the connection
  await client.close();
});

/* View of All concours answers of a specific User. */
router.get("/answers/:user_id", async function (req, res) {
  let answersList = [];
  let user_id = Number(req.params.user_id);

  const client = new MongoClient(url);
  await client.connect();
  const db = client.db(dbName);

  // Find the answers of performer
  const answers = await db
    .collection(collectionName1)
    .find({ user_id: user_id });

  await answers.forEach((answer) => {
    answersList.push(answer);
  });

  if (answersList.length > 0) {
    res.send(JSON.stringify(answersList));
  } else {
    res.send("No answer found for this user");
  }
  //close the connection
  await client.close();
});

/* Get result of Performer. */
router.get("/result/:id", async function (req, res) {
  let answersList = [];
  let newAnswer;

  let id = Number(req.params.id); // Id of the answer

  const client = new MongoClient(url);
  await client.connect();
  const db = client.db(dbName);

  // Find the answers of performer
  const answers = await db.collection(collectionName1).find({ id: id });

  await answers.forEach((answer) => {
    answersList.push(answer);
  });

  if (answersList.length > 0) {
    newAnswer = answersList[0];
    // Send the answers of the user
    res.send(JSON.stringify(newAnswer));
  } else {
    res.send("No results found");
  }

  //close the connection
  await client.close();
});

module.exports = router;
