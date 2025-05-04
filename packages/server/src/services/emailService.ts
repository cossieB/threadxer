import { google } from "googleapis";
import { createTransport } from "nodemailer";
import { verificationEmailTemplate } from "#server/emailTemplates/verification.js";

export async function draftVerificationEmail(to: string, name: string, code: string) {
    const message = verificationEmailTemplate(name, code);
    if (process.env.NODE_ENV == "production")
        await sendMail(`${code} is your Threadxer verification code`, to, message)
    else
        console.log(code);
}

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
)

oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
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