const Quiz =require("../models/quiz-schema");
const asyncHandler =require( "express-async-handler");
 const createNewQuestion = asyncHandler(async (req, res) => {
    const { QuestionNumber, Question,Description, Option, CorrectOption, Marks }= req.body
    const quizId = req.query.quizId
    if (!QuestionNumber ||
        !Question ||
        !Option ||
        !CorrectOption ||
        !Marks ||
        Marks < 1 ||
        !Array.isArray(Option) ||
        Option.length !== 4
    ) {

        res.status(400);
        throw new Error("Input not valid.")
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
        res.status(404);
        throw new Error("Quiz not found");
    }
    //NOTE - Check Quiz crater usr and Who want to add quest are same
        const userId=req.user.id;
    if (userId.toString() !== quiz.User_Id.toString()) {
        res.status(401);
        throw new Error("User nit authorized.")
    }

    const quizQuestion = await QuizQuestionModel.findOne({ QuizId: quizId });
    if (!quizQuestion) {
        res.status(404);
        throw new Error("Quiz not found");
    }

    if(quiz.NumberOfQuestion==quizQuestion.AllQuestion.length){
        res.status(405);
        throw new Error("All questions are created.")
    }

    const questionData = {
        QuestionNumber: QuestionNumber, // Provide appropriate values here
        Question: Question,
        Description:Description,
        Option: Option,
        CorrectOption: CorrectOption,
        Marks: Marks
    };
    const question = new QuestionModel(questionData);
    quizQuestion.AllQuestion.push(question);
    await quizQuestion.save();

    res.json(quizQuestion)
})

//NOTE - get all quiz question
 const getAllQuizQuestion = asyncHandler(async (req, res) => {
    const quizId = req.query.quizId;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
        res.status(404);
        throw new Error("Quiz not found.")
    }
    const quizQuestion = await QuizQuestionModel.findOne({ QuizId: quizId });
    if (!quiz) {
        res.status(404);
        throw new Error("Quiz Question not found.")
    }

    res.status(200).json(quizQuestion?.AllQuestion);
})

module.exports={
    createNewQuestion,
    getAllQuizQuestion
}
