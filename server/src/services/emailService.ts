import { google } from "googleapis";
import { createTransport } from "nodemailer";

export async function draftVerificationEmail(to: string, name: string, code: string ) {
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

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
)

oauth2Client.setCredentials({refresh_token: process.env.GOOGLE_REFRESH_TOKEN})
oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    /** Pass in the scopes array defined above.
      * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
    scope: 'https://mail.google.com/',
    // Enable incremental authorization. Recommended as a best practice.
    include_granted_scopes: true
  });

async function sendMail(subject: string, to: string, message: string) {
    const accessToken = await oauth2Client.getAccessToken()
    const transport = createTransport({
        // @ts-expect-error
        service: 'gmail',
        auth: {
            type: "OAUTH2",
            user: process.env.FROM,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            accessToken
        }
    })

    try {
        await transport.sendMail({
            from: {
                address: process.env.FROM!,
                name: "Threadxer"
            },
            to,
            subject,
            html: message
        });
        transport.close()
    } catch (error) {
        console.error(error)
        throw error
    }
}