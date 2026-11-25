
let knowledgeBase = [];
let totalQuestions = 0;

const fileInput = document.getElementById("fileInput");
const fileName = document.getElementById("fileName");
const documentText = document.getElementById("documentText");
const questionInput = document.getElementById("questionInput");
const answer = document.getElementById("answer");
const answerStatus = document.getElementById("answerStatus");

const stopWords = new Set([
    "what", "is", "are", "was", "were", "the",
    "a", "an", "of", "in", "on", "to", "for",
    "and", "or", "how", "why", "when", "where",
    "who", "which", "does", "do", "did", "can",
    "could", "tell", "me", "about", "explain"
]);

// Document Upload
fileInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".txt")) {
        alert("Please upload a .txt file.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {

        const text = event.target.result;

        if (!text.trim()) {
            alert("The uploaded document is empty.");
            return;
        }

        documentText.textContent = text;
        fileName.textContent = "📄 " + file.name;

        // Construct Knowledge Base
        knowledgeBase = text
            .replace(/\s+/g, " ")
            .split(/(?<=[.!?])\s+/)
            .map(sentence => sentence.trim())
            .filter(sentence => sentence.length > 0);

        // Update statistics
        document.getElementById("wordCount").textContent =
            text.trim().split(/\s+/).length;

        document.getElementById("sentenceCount").textContent =
            knowledgeBase.length;

        answer.textContent =
            "Document successfully processed. You can now ask questions.";

        answerStatus.textContent = "Knowledge Base Ready";
    };

    reader.onerror = function () {
        alert("Unable to read this file.");
    };

    reader.readAsText(file);
});


// Extract Question Keywords
function extractKeywords(question) {

    return question
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(word =>
            word.length > 1 && !stopWords.has(word)
        );
}


// Search Knowledge Base
function findAnswer(question) {

    const keywords = extractKeywords(question);

    if (keywords.length === 0) {
        return null;
    }

    let bestSentence = "";
    let highestScore = 0;

    knowledgeBase.forEach(sentence => {

        const sentenceWords = new Set(
            sentence.toLowerCase()
                .replace(/[^a-z0-9\s]/g, " ")
                .split(/\s+/)
        );

        let score = 0;

        keywords.forEach(keyword => {
            if (sentenceWords.has(keyword)) {
                score++;
            }
        });

        if (score > highestScore) {
            highestScore = score;
            bestSentence = sentence;
        }
    });

    // Require at least one matching keyword
    if (highestScore === 0) {
        return null;
    }

    return bestSentence;
}


// Ask Question Button
document.getElementById("askButton")
    .addEventListener("click", function () {

        const question = questionInput.value.trim();

        if (knowledgeBase.length === 0) {
            answer.textContent =
                "Please upload a document first.";

            answerStatus.textContent = "Document Required";
            return;
        }

        if (!question) {
            answer.textContent =
                "Please enter a question.";

            answerStatus.textContent = "Question Required";
            return;
        }

        totalQuestions++;

        document.getElementById("questionCount")
            .textContent = totalQuestions;

        const result = findAnswer(question);

        if (result) {

            answer.textContent = result;
            answerStatus.textContent = "Relevant Information Found";

        } else {

            answer.textContent =
                "Sorry, no relevant information was found in the uploaded document.";

            answerStatus.textContent = "No Match Found";
        }
    });


// Enter key support
questionInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        document.getElementById("askButton").click();
    }

});
