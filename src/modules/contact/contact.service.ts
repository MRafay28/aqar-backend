import { ContactModel, Contact } from "./models/contact.model";
import { sendEmail } from "../../utils/email-sender";
import config from "../../config/default";
import { UserModel } from "../user/models/user.model";

export const createContact = async (
  data: Partial<Contact>,
): Promise<Contact> => {
  const contact = new ContactModel(data);
  await contact.save();

  let subject = "New Contact Inquiry";
  let template = "contact-form-admin";
  let savedPhoneNumber = "N/A";

  if (data.action === "delete") {
    subject = "Account Deletion Request - Mr aqar";
    template = "account-deletion-admin";

    // Fetch saved phone number if userId is provided
    if (data.userId) {
      const user = await UserModel.findById(data.userId);
      if (user) {
        savedPhoneNumber = user.phoneNumber;
      }
    }
  }

  // Send email to admin
  if (config.adminEmail) {
    const emailData: any = {
      fullName: data.fullName,
      email: data.email || "N/A",
      subject: data.subject,
      message: data.message,
      userId: data.userId ? data.userId.toString() : "Guest",
    };

    if (data.action === "delete") {
      emailData.name = data.fullName;
      emailData.phoneNumber = savedPhoneNumber;
    }

    sendEmail(config.adminEmail, subject, template, emailData).catch((err) =>
      console.error("Error sending contact form email to admin:", err),
    );
  }

  // If it's a deletion request and user provided an email, send them a confirmation
  if (data.action === "delete" && data.email) {
    sendEmail(
      data.email,
      "Account Deletion - Mr aqar",
      "account-deletion-user",
      {
        name: data.fullName || "User",
      },
    ).catch((err) =>
      console.error(
        "Error sending account deletion confirmation to user:",
        err,
      ),
    );
  }

  return contact;
};
