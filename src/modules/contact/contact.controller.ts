import { Request, Response } from 'express';
import * as ContactService from './contact.service';
import { formatResponse } from '../../utils/helpers';

export const createContact = async (req: Request, res: Response) => {
    const contactData = req.body;

    // If user is logged in, attach their ID
    if (req.user) {
        contactData.userId = req.user.id;
    }

    const contact = await ContactService.createContact(contactData);
    res.status(201).json(formatResponse(true, 'Contact message sent successfully', contact));
};
