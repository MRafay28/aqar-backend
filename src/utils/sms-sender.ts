import axios from 'axios';
import logger from './logger';

import config from '../config/default';

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

        const response = await axios.get(config.sms.apiUrl, { params });

        logger.info(`SMS sent response for ${formattedNumber}: ${JSON.stringify(response.data)}`);

        return true;
    } catch (error) {
        logger.error(`Failed to send SMS to ${to}`, error);
        return false;
    }
};
