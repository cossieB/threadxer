export function validation(username: string, password: string, confirmPassword: string, email: string) {
    const errors = {
        username: [] as string[],
        password: [] as string[],
        confirmPassword: [] as string[],
        email: [] as string[]
    };
    if (username.length < 3 || username.length > 15)
        errors.username.push("Username must be between 3 and 15 characters")
    if (/\W/.test(username))
        errors.username.push("Username can only contain letters, numbers and underscores")
    if (password.length < 6)
        errors.password.push("Password must have at least 6 characters")
    if (password != confirmPassword)
        errors.confirmPassword.push("Passwords do not match")
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))
        errors.email.push("Invalid email")
    return errors
}