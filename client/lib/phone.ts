/**
 * UK Phone Number Utilities
 * Format: +44 7XXX XXX XXX (11 digits after +44)
 */

// Remove all non-digit characters except +
const cleanPhoneNumber = (phone: string): string => {
    return phone.replace(/[^\d+]/g, "");
};

// Format phone number as +44 7XXX XXX XXX
export const formatUKPhoneNumber = (phone: string): string => {
    const cleaned = cleanPhoneNumber(phone);

    // If empty, return empty
    if (!cleaned) return "";

    // If starts with +44, format it
    if (cleaned.startsWith("+44")) {
        const digits = cleaned.slice(3); // Remove +44
        if (digits.length <= 4) {
            return `+44 ${digits}`;
        } else if (digits.length <= 7) {
            return `+44 ${digits.slice(0, 4)} ${digits.slice(4)}`;
        } else {
            return `+44 ${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
        }
    }

    // If starts with 44, add +
    if (cleaned.startsWith("44")) {
        return formatUKPhoneNumber("+" + cleaned);
    }

    // If starts with 0, convert to +44
    if (cleaned.startsWith("0")) {
        return formatUKPhoneNumber("+44" + cleaned.slice(1));
    }

    // If starts with 7, add +44
    if (cleaned.startsWith("7")) {
        return formatUKPhoneNumber("+44" + cleaned);
    }

    // Otherwise, assume it needs +44
    return formatUKPhoneNumber("+44" + cleaned);
};

// Validate UK phone number
export const isValidUKPhoneNumber = (phone: string): boolean => {
    const cleaned = cleanPhoneNumber(phone);

    // Must start with +44 and have exactly 13 characters (+44 + 10 digits)
    if (!cleaned.startsWith("+44")) return false;

    const digits = cleaned.slice(3);

    // UK mobile numbers start with 7 and have 10 digits
    return digits.length === 10 && digits.startsWith("7");
};

// Get unformatted phone number for storage
export const getCleanPhoneNumber = (phone: string): string => {
    return cleanPhoneNumber(phone);
};

// Phone input handler - limits input and formats as user types
export const handlePhoneInput = (text: string, previousValue: string): string => {
    // Allow deletion
    if (text.length < previousValue.length) {
        const cleaned = cleanPhoneNumber(text);
        if (cleaned.length <= 3) return "+44 ";
        return formatUKPhoneNumber(cleaned);
    }

    // Clean and check length
    const cleaned = cleanPhoneNumber(text);

    // Limit to +44 + 10 digits
    if (cleaned.length > 13) {
        return previousValue;
    }

    return formatUKPhoneNumber(cleaned);
};

// Zod validation for UK phone numbers
export const ukPhoneValidation = {
    required: (value: string) => {
        if (!value || value === "+44 ") return "Phone number is required";
        if (!isValidUKPhoneNumber(value)) return "Please enter a valid UK phone number (+44 7XXX XXX XXX)";
        return true;
    },
    optional: (value: string | undefined) => {
        if (!value || value === "+44 " || value === "") return true;
        if (!isValidUKPhoneNumber(value)) return "Please enter a valid UK phone number (+44 7XXX XXX XXX)";
        return true;
    },
};
