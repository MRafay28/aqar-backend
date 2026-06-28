import axios from 'axios';
import logger from './logger';

import config from '../config/default';

const isSuccessResponse = (data: unknown): boolean => {
    const code = String(data).trim();
    return code === '100' || code === '200';
};

export const sendSMS = async (to: string, message: string): Promise<boolean> => {
    try {
        const formattedNumber = to.startsWith('+965') ? to.slice(4) : to.startsWith('965') ? to.slice(3) : to;

        const params = {
            msg: message,
            number: formattedNumber,
            key: config.sms.apiKey,
            dezsmsid: config.sms.dezSmsId,
            senderid: config.sms.senderId
        };

        if (!config.sms.apiUrl) {
            logger.error('SMS API URL is not configured');
            return false;
        }

        if (!config.sms.apiKey || !config.sms.dezSmsId || !config.sms.senderId) {
            logger.error('SMS API credentials are incomplete (key, dezsmsid, or senderid missing)');
            return false;
        }

        logger.info(`Sending SMS to ${formattedNumber} via ${config.sms.apiUrl}`);

        const response = await axios.get(config.sms.apiUrl, {
            params,
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; MrAqar/1.0)',
                Accept: 'text/plain, */*'
            },
            validateStatus: () => true
        });

        const responseBody = response.data;

        logger.info(
            `SMS API response for ${formattedNumber}: status=${response.status} data=${JSON.stringify(responseBody)}`
        );

        if (response.status === 403) {
            logger.error(
                `DezSMS returned HTTP 403 for ${formattedNumber}. ` +
                    'Usually the VPS IP must be whitelisted in your DezSMS account, or Cloudflare is blocking the server.'
            );
            return false;
        }

        if (response.status >= 400) {
            logger.error(`DezSMS HTTP error for ${formattedNumber}: status=${response.status}`);
            return false;
        }

        if (!isSuccessResponse(responseBody)) {
            logger.error(`DezSMS rejected message for ${formattedNumber}: response=${JSON.stringify(responseBody)}`);
            return false;
        }

        return true;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            logger.error(
                `Failed to send SMS to ${to}: status=${error.response?.status} ` +
                    `data=${JSON.stringify(error.response?.data)} message=${error.message}`
            );
        } else {
            logger.error(`Failed to send SMS to ${to}`, error);
        }
        return false;
    }
};
