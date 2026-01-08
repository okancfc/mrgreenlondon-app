export const formatNameWithGender = (name: string | null, gender: string | null): string => {
    if (!name) return "";

    const firstName = name.split(" ")[0];

    if (gender === "male") {
        return `Mr ${firstName}`;
    } else if (gender === "female") {
        return `Mrs ${firstName}`;
    }

    return firstName;
};
