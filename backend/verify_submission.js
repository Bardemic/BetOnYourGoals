const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

const validSubmission = async ({ photo, prompt }) => {
    const schema = {
        type: SchemaType.OBJECT,
        properties: {
            odds: {
                type: SchemaType.NUMBER,
                description: "Is this submission correct based off the prompt? (only 0 for invalid, 1 for valid)",
            }
        },
        required: ["odds"]
    };

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });

    const promptParts = [
        { text: "You are an expert at verifying submissions. You will be given a photo and a prompt. You will then verify if the photo is a valid proof of the prompt. Only return 0 for invalid, 1 for valid. If it is very obviously not proof, you better not return a 1. If you think it probably is proof, fine, return a 1 for all I care. Just don't let someone submit a photo of a wall for proof of them exercising, or studying, or anything like that. You're better than that gemini. In your first rendition, I was submitting my resume for proof of me working out, and you PASSED IT. What is that??? Anyways, this is the prompt: " + prompt },
        {
            inlineData: {
                mimeType: "image/jpeg",
                data: photo
            }
        }
    ];

    const result = await model.generateContent(promptParts);
    const response = result.response.text();
    const { odds } = JSON.parse(response);
    return odds === 1;
};

module.exports = { validSubmission };