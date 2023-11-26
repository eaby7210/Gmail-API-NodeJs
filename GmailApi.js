const axios = require("axios");
const qs = require("qs");
require("dotenv").config();

class GmailAPI {
  accessToken = "";
  constructor() {
    this.accessToken = this.getAcceToken();
  }

  getAcceToken = async () => {
    let data = qs.stringify({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      refresh_token: process.env.REFRESH_TOKEN,

      grant_type: "refresh_token",
    });
    let config = {
      method: "post",
      url: "https://accounts.google.com/o/oauth2/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };

    let accessToken = "";

    await axios(config)
      .then(async function (response) {
        accessToken = await response.data.access_token;
      })
      .catch(function (error) {
        console.log("Access Token Error :", error);
      });

    return accessToken;
  };

  searchGmail = async (searchItem) => {
    let config1 = {
      method: "get",
      url:
        "https://www.googleapis.com/gmail/v1/users/me/messages?q=" + searchItem,
      headers: {
        Authorization: `Bearer ${await this.accessToken} `,
      },
    };

    let messagesObj = [];
    let emaillist = [];
    await axios(config1)
      .then(async function (response) {
        messagesObj = await response.data.messages;
        messagesObj.forEach((email) => {
          const threadId = email.threadId;
          emaillist.push(threadId);
        });

        console.log("data = " + emaillist);
      })
      .catch(function (error) {
        console.log(error);
      });

    return emaillist;
  };

  readGmailContent = async (messageId) => {
    let config = {
      method: "get",
      url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
      headers: {
        Authorization: `Bearer ${await this.accessToken}`,
      },
    };

    let data = {};
    let message = "";
    let subj = {};

    await axios(config)
      .then(async function (response) {
        data = await response.data;

        if (data.payload["parts"] === undefined) {
          const a = data.payload.body.data;
          console.log(
            "Ignoring message since a seperate thread:  ",
            Buffer.from(a, "base64").toString("ascii")
          );
        } else {
          const encoded = data.payload["parts"][0].body.data;
          subj = data.payload.headers.find(
            (header) => header.name === "Subject"
          );
          message = Buffer.from(encoded, "base64").toString("ascii");
        }
      })
      .catch(function (error) {
        console.log(error);
      });

    return {
      id: messageId,
      subject: subj.value,
      message: message,
    };
  };

  readInboxContent = async (searchText) => {
    const threadIdList = await this.searchGmail(searchText);

    const messages = threadIdList.map(async (threadId) => {
      return await this.readGmailContent(threadId);
    });
    const msgList = await Promise.all(messages);
    return msgList;
  };

  sendEmail = async (to, subject, body) => {
    const access_token = await this.getAcceToken();

    const emailContent = [`To: ${to}`, `Subject: ${subject}`, "", body];
    const rawMessage = emailContent.join("\n");

    const encodedMessage = Buffer.from(rawMessage).toString("base64");
    const config = {
      method: "post",
      url: "https://www.googleapis.com/gmail/v1/users/me/messages/send",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      data: {
        raw: encodedMessage,
      },
    };
    let response;
    try {
      response = await axios(config);
      console.log("Email sent successfully:", response.data);
    } catch (error) {
      console.error(
        "Error sending email:",
        error.response ? error.response.data : error.message
      );
    }
    return response;
  };
  replyEmail = async (messages, to, replyMessageBody) => {
    try {
      const access_token = await this.getAcceToken();
      const replyPromises = messages.map(async (messageData) => {
        const { id, subject, message } = messageData;

        const encodedMessage = Buffer.from(
          JSON.stringify({
            to: [
              {
                emailAddress: "angelmariyathomas10@gmail.com",
              },
            ],
            from: "EABY7210@gmail.com",
            threadId: id,
            subject: `Re: ${subject}`,
            body: {
              text: replyMessageBody,
            },
          })
        ).toString("base64");
        console.log(to);
        const config = {
          method: "post",
          url: "https://www.googleapis.com/gmail/v1/users/me/messages/send",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          data: {
            raw: encodedMessage,
          },
        };
        console.log(config);
        const response = await axios(config);
        console.log(response);
        if (response.status === 200) {
          console.log(
            `Reply to message \n${id}-${message}\n sent successfully`
          );
        } else if (response.status === 404) {
          console.log(`Message ${id} not found. Skipping reply.`);
        } else {
          console.error(
            `Error sending reply to message ${id}: ${response.status}`
          );
        }
      });
    } catch (error) {
      console.log(`Error in sending reply:\n ${error}`);
      throw error.data;
    }
  };
  markEmail = async (id, label) => {
    let config = {
      method: "post",
      url: `https://www.googleapis.com/gmail/v1/users/me/messages/${id}/modify`,
      headers: {
        Authorization: `Bearer ${await this.accessToken}`,
        "Content-Type": "application/json",
      },
      data: {
        addLabelIds: [label],
      },
    };
    try {
      const response = await axios(config);
      console.log(`Message labeled with "${label}":`, response.data);
    } catch (error) {
      console.error(
        "Error labeling message:",
        error.response ? error.response.data : error.message
      );
    }
  };
}
module.exports = new GmailAPI();
