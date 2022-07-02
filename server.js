require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const app = express();

const multer = require("multer");
const FileModel = require("./models/file");

const upload = multer({ dest: "uploads/" });

app.use(express.urlencoded({ extended: true }));

mongoose
    .connect(process.env.DATABSE_URL)
    .then(() => {
        console.log("connection successfull");
    })
    .catch((e) => {
        console.log(e);
    });

app.set("view engine", "ejs");

app.get("/", (req, res) => {

    res.render("index");
});

app.post("/upload", upload.single("file"), async (req, res) => {
    const fileData = {
        filepath: req.file.path,
        originalName: req.file.originalname,
    };

    if (req.body.password != null && req.body.password != "") {
        const salt = bcryptjs.genSaltSync(10);

        fileData.password = await bcryptjs.hashSync(req.body.password, salt);
    }

    const finalFile = await FileModel.create(fileData);

    res.render("filepage", {
        filelink: `${req.headers.origin}/file/${finalFile.id}`,
    });
});

app.route("/file/:id").get(handleDownload).post(handleDownload);

async function handleDownload(req, res) {
    console.log(req.method);

    const file = await FileModel.findById(req.params.id);

    if (file.password != null) {
        console.log("i am password");
        console.log(req.body);
        if (req.body.password == null) {
            res.render("password");
            return;
        }
    }

    if (req.body.password != null && req.body.password != "") {
        const isValidPasswword = await bcryptjs.compareSync(
            req.body.password,
            file.password
        );
        console.log(isValidPasswword);

        if (!isValidPasswword) {
            res.render("password", { error: true });
        }
    }

    file.downloadCount++;

    await file.save();

    console.log(file.downloadCount);

    res.download(file.filepath, file.originalName);
}

app.listen(3000, () => {
    console.log("server is running");
});
