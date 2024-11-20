require("dotenv").config()

// Google Gemini Stuff
const { GoogleGenerativeAI } = require("@google/generative-ai")
const { GoogleAIFileManager } = require("@google/generative-ai/server")

function createModelManager() {
    let modelIndex = Math.floor(Math.random() * 4)
    const geminiModels = [
        new GoogleGenerativeAI(process.env.GEMINI_API_KEY1).getGenerativeModel({ model: "gemini-1.5-flash" }),
        new GoogleGenerativeAI(process.env.GEMINI_API_KEY2).getGenerativeModel({ model: "gemini-1.5-flash" }),
        new GoogleGenerativeAI(process.env.GEMINI_API_KEY3).getGenerativeModel({ model: "gemini-1.5-flash" }),
        new GoogleGenerativeAI(process.env.GEMINI_API_KEY4).getGenerativeModel({ model: "gemini-1.5-flash" }),
    ]

    const fileManagers = [
        new GoogleAIFileManager(process.env.GEMINI_API_KEY1),
        new GoogleAIFileManager(process.env.GEMINI_API_KEY2),
        new GoogleAIFileManager(process.env.GEMINI_API_KEY3),
        new GoogleAIFileManager(process.env.GEMINI_API_KEY4),
    ]

    function cycleIndex() {
        modelIndex++
        if (modelIndex >= geminiModels.length) {
            modelIndex = 0
        }
    }

    function getModel() {
        cycleIndex()
        return { model: geminiModels[modelIndex], fileManager: fileManagers[modelIndex] }
    }

    return { getModel }
}
const modelManager = createModelManager()
const promptPrefix = `Pretend you are a book library AI assistant with capabilities like book recommendation. It is absolutely vital that you respond with nothing but JSON string. You will be given a JSON string delimited by the second pair of triple backticks as well as a prompt delimited by the third pair of triple backticks. The JSON string delimited by the second pair of triple backticks contains data about the books that the user has already read. The prompt will be a search the user passes to you, the library assistant. It is up to you to decide what the user wants. For example, the user might be simply searching up books online by title name, author name, ISBN13, etc. In this case, books you find do not have to be related to the user's bookshelf. Or, the user could be asking you for recommendations based on books in their bookshelf, like if the user prompts "provide me books similar to titles book1, book2, etc". In any way, you will search the internet for books that match the user's prompt and you will provide your results purely in JSON string with no extra text, in the same form as the sample JSON string provided to you delimited by the first pair of triple backticks. It is preferred if you provide new books that the user has not read before. Leave the "isbn", "cover", "tags", and "dateadded" fields as an empty string. Make sure you fill in the other fields with the correct information from the books that you have found online. If no books were found, please respond with only the following in JSON format: {"books": []}. If you deem the prompt to be irrelevant to books, offensive or inappropriate, please respond with only the following in JSON format: {"books": []} \n\n\`\`\`{"books":[{"title":"book1","author":"author1","published":"2024","isbn":"123456789","genre":"romance, horror","summary":"a book about blah blah blah","tags":"tag1 tag2","dateadded":"1"},{"title":"book2","author":"author2","published":"2023","isbn":"123456790","genre":"comedy","summary":"a book2 about blah blah blah","tags":"tag1 tag2","dateadded":"2"}]}\`\`\``
const imagePrefix = `Pretend you are a library book assistant that looks at an image and identifies all books in the image. Given the attached image below, identify all books inside the image and return your results in a JSON string in the same format as the template given delimited by the first pair of triple backticks. Leave the "isbn", "cover", "tags", and "dateadded" fields as an empty string. Make sure you fill in all of the other fields with the correct information from the books that you have identified in the image, getting information such as the publication date and summary from the internet if needed. Do not reply with any extra text before or after the JSON that you provide. If no books were found, please respond with the JSON template with no elements in the books array. If you deem the image to be irrelevant to books, offensive or inappropriate, please respond with the JSON template with no elements in the books array. \n\n\`\`\`{ "books": [{ "title":"book1", "author":"author1", "published":"2024", "isbn":"123456789", "genre":"romance, horror", "summary":"a book about blah blah blah", "tags":"tag1 tag2", "dateadded":"1"}, { "title":"book2", "author":"author2", "published":"2023", "isbn":"123456790", "genre":"comedy", "summary":"a book2 about blah blah blah", "tags":"tag1 tag2", "dateadded":"2"}] }\`\`\``

const multer = require("multer")
const upload = multer({ dest: "uploads/" })
const fs = require("fs").promises
const validateJWT = require("../middleware/validateJWT.js")
const { rateLimit } = require("express-rate-limit")
const express = require("express")
const router = express.Router()

// Rate limiter to prevent abuse
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 10, // limit each IP to 10 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { response: "Too many requests! Please slow down and try again in a minute." }
})

router.use(limiter)

router.post("/prompt", validateJWT, async (req, res) => {
    // Validate request body
    if (req.body === null || req.body.bookshelf === null || req.body.prompt === null) {
        req.json({
            response: "Invalid request body."
        })
        return
    }

    const bookshelfJson = String(req.body.bookshelf)
    const prompt = String(req.body.prompt)

    // Check if the provided bookshelf data is valid JSON
    try {
        JSON.parse(bookshelfJson)
        String(prompt)
    } catch {
        res.json({
            response: "Invalid JSON."
        })
        return
    }

    try {
        // prompt model
        const model = modelManager.getModel().model
        const result = await model.generateContent(`${promptPrefix} \n\n\`\`\`${bookshelfJson}\`\`\` \n\n\`\`\`${prompt}\`\`\``)
        let generatedText = result.response.text()
        generatedText = generatedText.replaceAll("```json\n", "")
        generatedText = generatedText.replaceAll("```json", "")
        generatedText = generatedText.replaceAll("```", "")

        // clean up escape sequences
        while (true) {
            try {
                generatedText = JSON.parse(generatedText)
            }
            catch {
                generatedText = JSON.stringify(generatedText)
                break
            }
        }

        res.json({
            response: generatedText
        })
    } catch (error) {
        console.log(error)
        res.json({
            response: "An error occurred while generating content."
        })
    }
})

router.post("/image", validateJWT, upload.single("image"), async (req, res) => {
    // validate request body
    if (req.file === null) {
        res.json({
            response: "Please upload an image."
        })
        return
    }

    // upload image to google file manager
    const modelData = modelManager.getModel()
    const fileManager = modelData.fileManager
    const model = modelData.model

    try {
        const uploadResult = await fileManager.uploadFile(
            req.file.path,
            {
                mimeType: req.file.mimetype,
                displayName: "Image Recognition Prompt",
            },
        )

        const result = await model.generateContent([
            imagePrefix,
            {
                fileData: {
                    fileUri: uploadResult.file.uri,
                    mimeType: uploadResult.file.mimeType
                }
            }
        ])

        let generatedText = result.response.text()
        generatedText = generatedText.replaceAll("```json\n", "")
        generatedText = generatedText.replaceAll("```json", "")
        generatedText = generatedText.replaceAll("```", "")

        // clean up escape sequences
        while (true) {
            try {
                generatedText = JSON.parse(generatedText)
            }
            catch {
                generatedText = JSON.stringify(generatedText)
                break
            }
        }

        res.json({
            response: generatedText
        })

    } catch (error) {
        console.log(error)
        res.json({
            response: "An error occurred while generating content."
        })
    }
})

module.exports = router