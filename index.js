let gmail = require("./GmailApi");

const to = "eabythomascu@gmail.com";
const subject = "Test Email tes2";
const body = "Hello, this is a test email!";

gmail.sendEmail(to, subject, body);
// Functions such as:
//   readInboxContent(searchText) seachText=>filters,
// sendEmail (to, subject, body)
//    are available to use
