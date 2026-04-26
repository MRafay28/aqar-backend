import nodemailer from 'nodemailer';
import * as ejs from 'ejs';
import path from 'path';
import config from '../config/default';
import logger from './logger';
const sendEmail = async (to: string, subject: string, template: string, data: Record<string, unknown> = {}): Promise<boolean> => {
    if (!config.emailClient.user || !config.emailClient.pass) {
        logger.error('Missing email client configuration values (SMTP_USER or SMTP_PASS)');
        return false;
    }

    const logoPath = process.env.EMAIL_LOGO || '';

    const htmlData = {
        ...data,
        logoPath,
        clientUrl: config.clientUrl
    };

    try {
        const viewsPath = path.join(__dirname, '..', '..', 'views');
        const html = await ejs.renderFile(path.join(viewsPath, `${template}.ejs`), htmlData, { async: true });

        const transporter = nodemailer.createTransport({
            host: config.emailClient.host,
            port: config.emailClient.port,
            secure: config.emailClient.port === 465, // true for 465, false for other ports
            auth: {
                user: config.emailClient.user,
                pass: config.emailClient.pass
            }
        });

        const mailOptions = {
            from: `"${config.emailClient.senderName}" <${config.emailClient.senderEmail}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent: ${info.messageId}`);
        return true;
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(
                JSON.stringify({
                    type: 'Error',
                    error: error.message,
                    stack: error.stack
                })
            );
        } else {
            logger.error('Unknown error occurred while sending email');
        }
        return false;
    }
};

export { sendEmail };
