

const asyncHandler = require("express-async-handler")

const User = require("../models/users-schema");
const Quiz = require("../models/quiz-schema");
const { QuizQuestionModel } = require("../models/question-schema");

const { googleDrive, uploadImageInGoogleDrive } = require('../util/uploadImageInDrive')
const { Buffer } = require("buffer");
const  imageMimeTypes  = require("../util/imagefiletype");
//SECTION -  - Create new Quiz
const createNewQuiz = asyncHandler(async (req, res) => {
    const { Name,
        Description,
        Category,
        Topic,
        NumberOfQuestion,
        TotalScore,
        PassingScore,
        NumberOfAttendByAnyone } = req.body;
    // console.log(req.body);

    //NOTE - set poster file details if its exits 
    const file = req.file;
    // console.log(file);
    let filePath = null;
    let mimetype = null;
    let buffer = null;
    if (file) {
        mimetype = file.mimetype
        buffer = file.buffer
        // console.log({buffer,mimetype,imageMimeTypes});
        if (mimetype && !imageMimeTypes.includes(mimetype)) {
            res.status(400);
            throw new Error("Accept .jpeg, .png, and .webp format.")
        }
    }
    //NOTE - Throw Error if all necessary data not given  
    if (!Name || !Description || !Category || !NumberOfQuestion || !TotalScore) {
        res.status(400);
        if (filePath) {
        }
        throw new Error("Input not valid");
    }

    if (Number(NumberOfQuestion) < 5) {
        res.status(400);
        if (filePath) {
        }
        throw new Error("Number of question must geterr than 4.");
    }
 
    if (Number(TotalScore) < 5) {
        res.status(400);
        if (filePath) {
        }
        throw new Error("Total score must geterr than 4.");
    }
    //NOTE - Check user account exit or not who want to create Quiz.
  
    const userId = req.user.id
    // console.log(userId);
    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        if (filePath) {
        }
        throw new Error("User account not found")
    }
    // console.log("ch1");
    //NOTE - Create new Quiz and save DB
    const newQuiz = await Quiz.create(
        {
            User_Id: userId,
            Name,
            Description,
            Category,
            Topic,
            NumberOfQuestion: Number(NumberOfQuestion),
            TotalScore: Number(TotalScore),
            PassingScore,
            NumberOfAttendByAnyone: Number(NumberOfAttendByAnyone)
        }
    )
   
    await QuizQuestionModel.create(
        { QuizId: newQuiz.id }
    )




    //NOTE - if poster given then save it google drive and update quiz poster id.
    if (buffer && mimetype && newQuiz) {
        const filename = newQuiz.Name + newQuiz.id;
        const folderId = process.env.GOOGLE_DRIVE_QUIZ_POSTER_FOLDER_ID;
        const fileId = await uploadImageInGoogleDrive(filename, mimetype, buffer, folderId, null);
        newQuiz.PosterId = fileId;
        await newQuiz.save();
    }

    res.json({ success: true, message: "Quiz created successfully." })
})

//SECTION - Delete exiting quiz
const deleteQuiz = asyncHandler(async (req, res) => {
    const quizId = req.query.quizId || null
    if (!quizId) {
        res.status(400)
        throw new Error("Missing quiz id.");
    }
    //NOTE - Check user account exit or not who want to delete Quiz.
    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(404);
        throw new Error("User account not found")
    }

    //NOTE - 
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
        res.status(404);
        throw new Error("Quiz details not found.")
    }
    if (quiz.PosterId) {
        googleDrive.files.delete({
            fileId: quiz.PosterId
        })
    }


    const response = await Quiz.deleteOne({ _id: quizId })

    res.status(200).json({ success: true, message: "Quiz deleted.", response })
})

//SECTION - Update like in DB
const updateLike = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const quizId = req.query.quizId;
    if (!user) {
        res.status(404);
        throw new Error("User account not found.");
    }
    const quiz = await Quiz.findById(quizId)
    if (!quiz) {
        res.status(404);
        throw new Error("Quiz not found.");
    }

    quiz.Like += 1;
    await quiz.save();
    res.status(200).json({ success: true, message: "Like added." });
})

//SECTION - Update Unlike in DB
const updateUnlike = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const quizId = req.query.quizId;
    if (!user) {
        res.status(404);
        throw new Error("User account not found.");
    }
    const quiz = await Quiz.findById(quizId)
    if (!quiz) {
        res.status(404);
        throw new Error("Quiz not found.");
    }

    quiz.Unlike += 1;
    await quiz.save();
    res.status(200).json({ success: true, message: "Unlike added." });
});

const submitQuiz = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const quizId = req.query.quizId;
    if (!user) {
        res.status(404);
        throw new Error("User account not found.");
    }
    const quiz = await Quiz.findById(quizId)
    if (!quiz) {
        res.status(404);
        throw new Error("Quiz not found.");
    }
    quiz.TotalNumberOfSubmit += 1;
})

module.exports = {
    createNewQuiz,
    deleteQuiz,
    updateLike,
    updateUnlike,
    submitQuiz
}