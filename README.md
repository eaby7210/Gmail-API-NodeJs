# Gmail_API_NodeJS

## How to Run:

Clone this repo > Run command `npm install` > Then run `npm run test`

Note: Also make sure you change your client id, refresh token, client secrets, etc...

## Environment Configuration

Before running the application, make sure to set up your environment variables using a `.env` file. Copy the `.env.example` file and fill in your Gmail API credentials.

```plaintext
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
REFRESH_TOKEN=your_refresh_token
ACCESS_TOKEN=your_access_token
```

## API Functions

`readInboxContent(searchText)`
This function allows you to retrieve inbox content based on a search text. Provide your search criteria in the `searchText` parameter.

`sendEmail(to, subject, body)`
Use this function to send an email. Replace `to`, `subject`, and `body` with your desired values.
