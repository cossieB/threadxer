import { google } from "googleapis";
import { createTransport } from "nodemailer";
import { type Options } from "nodemailer/lib/mailer";

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

export async function sendMail(subject: string, to: string, message: string) {
    const accessToken = await oauth2Client.getAccessToken()
    const transport = createTransport({
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
    const options: Options = {
        from: {
            address: process.env.FROM!,
            name: "Threadxer"
        },
        to,
        subject,
        html: message
    }
    try {
        await transport.sendMail(options);
        transport.close()
    } catch (error) {
        console.log(error)
        throw error
    }
}

// export async function sendMail(subject: string, to: string, message: string) {
//         const transport = createTransport({
//         service: 'gmail',
//         host: 'smtp.gmail.com',
//         port: 587,
//         secure: process.env.NODE_ENV == 'production',
//         auth: {
//             user: process.env.FROM,
//             pass: process.env.APP_PASSWORD
//         }
//     })
//     const options: Options = {
//         from: {
//             name: "Threadxer",
//             address: process.env.FROM!
//         },
//         to,
//         subject,
//         html: message
//     }
//     try {
//         await transport.sendMail(options)
//     } catch (error) {
//         console.log(error)
//     }
// }