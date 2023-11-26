let gmail = require("./GmailApi");

const to = "angelmariyathomas10@gmail.com";
const subject = "New Test Email message";
const body = "Hello, this is a test email!";
const replyBody = "Thank you for your email. This is an automated reply.";
func = async () => {
  const unreadThreads = await gmail.readInboxContent(
    "is:unread from:(angelmariyathomas10@gmail.com)"
  );
  await gmail.sendEmail(to, subject, body);
  await gmail.replyEmail(unreadThreads, to, replyBody);
};
func();
