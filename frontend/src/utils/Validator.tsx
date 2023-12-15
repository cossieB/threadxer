export class Validator {
    private _errors = {
        username: [] as string[],
        password: [] as string[],
        confirmPassword: [] as string[],
        email: [] as string[]
    };
    get errors() {
        return this._errors;
    }
    validateUsername = (username: string) => {
        if (username.length < 3 || username.length > 15)
            this._errors.username.push("Username must be between 3 and 15 characters");
        if (/\W/.test(username))
            this._errors.username.push("Username can only contain letters, numbers and underscores");
    };
    validatePassword = (password: string, confirmPassword: string) => {
        if (password.length < 6)
            this._errors.password.push("Password must have at least 6 characters");
        if (password != confirmPassword)
            this._errors.confirmPassword.push("Passwords do not match");
    };
    validateEmail = (email: string) => {
        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/.test(email))
            this.errors.email.push("Invalid email");
    };
    validate = (username: string, password: string, confirmPassword: string, email: string) => {
        this.validateUsername(username);
        this.validatePassword(password, confirmPassword);
        this.validateEmail(email);
        return this._errors
    };
    get isInvalid() {
        return Object.values(this._errors).flat().length > 0;
    }
}
