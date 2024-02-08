import { sendMail } from "../nodemailer"

export async function draftVerificationEmail(name: string, code: string, to: string) {
    const message = `
    <!DOCTYPE html>
    <html>
        <body style="background:black; color: white; max-width: 600px; margin-left: auto; margin-right: auto; padding: 5rem 2rem">
            <center>
                <img style="height: 150px" src="${process.env.DOMAIN}/favicon.ico">
            </center>
            <center><h1>Verify your account</h1></center>
            <strong>Hi ${name}, 👋🏾</strong><br />
            <p>
                Thank you for creating an account with Threadxer. Before you can join in on the fun, you first have to verify this email address. Your verification code is
            </p>
            <center>
                <div style="background-color: rgb(29, 155, 240); padding: 1rem; border-radius: 3rem; color: white">
                    <strong>
                        ${code}
                    </strong>
                </div>
            </center>
            <aside style="margin-top: 50px">Be advised this code will expire in 72 hours.</aside>
        </body>
    </html>
    `
    await sendMail(`${code} is your Threadxer verification code`, to, message)
}