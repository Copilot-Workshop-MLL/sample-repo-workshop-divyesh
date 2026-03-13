// Implement a function that will return the first non-repeated character in a string. For example, given the string "abcabd", the function should return "c".

function firstNonRepeatedCharacter(str) {
    const charCount = {};

    // Count the occurrences of each character
    for (let char of str) {
        if (charCount[char]) {
            charCount[char]++;
        } else {
            charCount[char] = 1;
        }
    }

    // Find the first non-repeated character
    for (let char of str) {
        if (charCount[char] === 1) {
            return char;
        }
    }

    return null; // Return null if there is no non-repeated character
}

// Optimized function to find the first non-repeated character
function firstNonRepeatedCharacterOptimized(str) {
    const charMap = new Map();

    // Iterate through the string once
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (charMap.has(char)) {
            charMap.set(char, { count: charMap.get(char).count + 1, index: i });
        } else {
            charMap.set(char, { count: 1, index: i });
        }
    }

    // Find the first character with a count of 1
    for (let [char, { count, index }] of charMap) {
        if (count === 1) {
            return char;
        }
    }

    return null; // Return null if no non-repeated character exists
}

// Example usage:
const input = "abcabd";
const result = firstNonRepeatedCharacter(input);
console.log(result); // Output: "c"

// Export the functions for testing
module.exports = { firstNonRepeatedCharacter, validateEmail };

// Implement a class that represents a calculator. The class should have basic methods for addition, subtraction, multiplication, and division.

// Document the class and its methods using JSDoc comments.**
/**
 * A simple calculator class that provides basic arithmetic operations.
 */

class Calculator {
    /**
     * Adds two numbers.
     * @param {number} a - The first number.
     * @param {number} b - The second number.
     * @returns {number} The sum of the two numbers.
     */
    add(a, b) {
        return a + b;
    }

    /**
     * Subtracts the second number from the first number.
     * @param {number} a - The first number.
     * @param {number} b - The second number.
     * @returns {number} The difference between the two numbers.
     */
    subtract(a, b) {
        return a - b;
    }

    /**
     * Multiplies two numbers.
     * @param {number} a - The first number.
     * @param {number} b - The second number.
     * @returns {number} The product of the two numbers.
     */
    multiply(a, b) {
        return a * b;
    }
    /**
     * Divides the first number by the second number.
     * @param {number} a - The first number.
     * @param {number} b - The second number.
     * @returns {number} The quotient of the two numbers.
     * @throws Will throw an error if division by zero is attempted.
     */

    divide(a, b) {
        if (b === 0) {
            throw new Error("Division by zero is not allowed.");
        }
        return a / b;
    }
}

// Example usage:
const calculator = new Calculator();
console.log(calculator.add(5, 3)); // Output: 8
console.log(calculator.subtract(5, 3)); // Output: 2
console.log(calculator.multiply(5, 3)); // Output: 15
console.log(calculator.divide(5, 3)); // Output: 1.6666666666666667

// Implement a utility function which will greet the user with a personalized message. The function should take the user's name as an argument and return a greeting string.

function greetUser(name) {
    return `Hello, ${name}! Welcome to our platform.`;
}

// Example usage:
const userName = "Alice";
const greeting = greetUser(userName);
console.log(greeting); // Output: "Hello, Alice! Welcome to our platform."

function welcomeMessage(name) {
    return `Welcome, ${name}! We're glad to have you here.`;
}

// Example usage:
const welcome = welcomeMessage("Bob");
console.log(welcome); // Output: "Welcome, Bob! We're glad to have you here."

// Function to validate an email address
function validateEmail(email) {
    /**
     * Validates an email address.
     * @param {string} email - The email address to validate.
     * @returns {boolean} True if the email address is valid, false otherwise.
     */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Example usage of validateEmail
const email1 = "example@example.com";
const email2 = "invalid-email";

console.log(validateEmail(email1)); // Output: true
console.log(validateEmail(email2)); // Output: false