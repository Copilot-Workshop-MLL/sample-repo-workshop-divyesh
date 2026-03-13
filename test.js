// Import the functions to be tested
const { firstNonRepeatedCharacter, validateEmail } = require('./start');

// Test cases for firstNonRepeatedCharacter
describe('firstNonRepeatedCharacter', () => {
    it('should return the first non-repeated character', () => {
        expect(firstNonRepeatedCharacter('abcabd')).toBe('c');
        expect(firstNonRepeatedCharacter('aabbccdde')).toBe('e');
        expect(firstNonRepeatedCharacter('aabbcc')).toBe(null);
    });
});

// Test cases for validateEmail
describe('validateEmail', () => {
    it('should return true for valid email addresses', () => {
        expect(validateEmail('example@example.com')).toBe(true);
        expect(validateEmail('user.name+tag+sorting@example.com')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
        expect(validateEmail('plainaddress')).toBe(false);
        expect(validateEmail('@missingusername.com')).toBe(false);
        expect(validateEmail('username@.com')).toBe(false);
    });
});