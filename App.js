const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const cors = require('cors');
const mongoose = require("mongoose");
const multer = require("multer");
require('dotenv').config();

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("Public"));
app.use(cors());

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage: storage });

mongoose.connect("mongodb://127.0.0.1:27017/TaskManager");

const taskSchema = new mongoose.Schema({
    itemid: String,
    Ownername: String,
    ToName: String,
    Descrip: String,
    Note: String,
    Files: [
        {
            filename: String,
            mimetype: String,
            size: Number,
            path: String,
        },
    ],
});

const Task = mongoose.model("Task", taskSchema);

app.post("/form", (req, res) => {
    const task = new Task({
        itemid: req.body.ItemId,
        Ownername: req.body.OwnerName,
        ToName: req.body.ToName,
        Descrip: req.body.Descrip,
        Note: "",
    });

    task.save();
});

app.get("/form", async (req, res) => {
    let itemsArr = await Task.find({});
    res.json(itemsArr);
});

app.delete("/delete/:clickedBtnId", async (req, res) => {
    const clickedBtnId = req.params.clickedBtnId;
    await Task.findOneAndDelete({ _id: clickedBtnId });
});

app.post("/update/:expandBtnId", upload.array("files"), async (req, res) => {
    const expandBtnId = req.params.expandBtnId;
    const files = req.files.map((file) => ({
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
    }));

    const noteData = {
        note: req.body.note,
        files: files,
    };

    console.log(files);

    try {
        const updateData = { Files: noteData.files };
        if (noteData.note.trim().length > 0) {
            updateData.Note = noteData.note;
        }

        await Task.updateOne({ _id: expandBtnId }, { $set: updateData });
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error: "An error occurred while updating the task." });
    }
});

app.get("/update/:expandBtnId", async (req, res) => {
    // console.log(req.param.expandBtnId);
    let formData = await Task.find({ _id: req.params.expandBtnId });
    // console.log("Only from here", formData[0].Files);
    res.json(formData);
})

app.listen(process.env.PORT || 4000, () => {
    console.log("Everything working fine on port 4000");
});
