import { sendMail } from "../nodemailer"

export async function draftVerificationEmail(name: string, code: string, to: string) {
    const message = `
    <!DOCTYPE html>
    <html>
        <body style="background:black; color: white; max-width: 600px; margin-left: auto; margin-right: auto; padding: 5rem 2rem">
            <center>
                <img style="height:150px" src="/favicon.ico">
            </center>
            <h1><center>Verify your account</center></h1>
            <strong>Hi ${name}, 👋🏾</strong><br />
            <p>
                Thank you for creating an account with Threadxer. Before you can join in on the fun, you first have to verify this email address. Your verification code is
            </p>
            <center>
                <code style="background-color:rgb(29, 155, 240); padding: 1rem; border-radius: 3rem; color: white">
                    <strong>
                        ${code}
                    </strong>
                </code>
            </center>
        </body>
    </html>
    `
    await sendMail(`${code} is your Threadxer verification code`, to, message)
}