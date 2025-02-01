// Only return an object with fields that are not undefined
export function filterDefinedFields(fields: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
        Object.entries(fields).filter(([, value]) => value !== undefined)
    );
}


// Only return the array of strings from AI response
export function getCleanedArrayFromAiResponse(rawContent: string): string[] {
    // Clean the response: remove the markdown formatting (backticks and newlines)
    const cleanedContent = rawContent.replace(/```json|```|\n/g, '').trim();

    // Parse the cleaned content into a JavaScript array
    let interviewQuestions = [];
    interviewQuestions = JSON.parse(cleanedContent);
    return interviewQuestions;
}

// Generate a random digit key
export function generateOTP(length = 6) {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}