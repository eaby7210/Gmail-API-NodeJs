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

        console.log("Access Token " + accessToken);
      })
      .catch(function (error) {
        console.log(error);
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
    let threadId = "";

    await axios(config1)
      .then(async function (response) {
        threadId = await response.data["messages"][0].id;

        console.log("ThreadId = " + threadId);
      })
      .catch(function (error) {
        console.log(error);
      });

    return threadId;
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

    await axios(config)
      .then(async function (response) {
        data = await response.data;
      })
      .catch(function (error) {
        console.log(error);
      });

    return data;
  };

  readInboxContent = async (searchText) => {
    const threadId = await this.searchGmail(searchText);
    const message = await this.readGmailContent(threadId);

    const encodedMessage = await message.payload["parts"][0].body.data;

    const decodedStr = Buffer.from(encodedMessage, "base64").toString("ascii");

    console.log(decodedStr);

    return decodedStr;
  };

  sendEmail = async (to, subject, body) => {
    const access_token = await this.getAcceToken();
    console.log("access tokennnnnn", access_token);

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

  // Helper method to create a raw email message
}

module.exports = new GmailAPI();
