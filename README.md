# Chat App

Welcome to the Tele-Chat App repository! This is a simple chat application built using M-E-A-N stack and socket-IO.

## Features
- Real-time messaging: Instantly send and receive messages in real-time.
- User authentication: Securely log in and authenticate users.
- Multi-user support: Chat with multiple users in different rooms or channels.

## Technologies Used
- Frontend: Angular
- Backend: Node.js with Express.js
- Database: MongoDB
- Deployment:  No specific deployment platform or service used

## Getting Started

To get started with the Chat App locally, follow these steps:

1. Clone this repository to your local machine:

git clone https://github.com/Mukulwith7BitGit/Tele-Chat.git

2. Install dependencies:

    - Ensure your system already has git, node ,express, mongoDB and any other dependencies needed.

3. Configure node with mongoDB:

    - Install mongoDB, download MongoDB Compass and configure it.
    - Search for mongodb port in backend index.js and use the localhost IP.
    - Eg: mongodb://127.0.0.1:27017

3. Frontend Deployment:

    ```cd Tele-Chat/frontend/FrontendTelechat```
    ```npm i```
    ```npm start```

4. Backend Deployment:

    ```cd Tele-Chat/backend```
    ```node index.js```

5. Open your browser and navigate to [Tele-Chat](http://localhost:4200) to view the app.

## Contributing

We welcome contributions from the community! If you'd like to contribute to the Chat App project, please follow these guidelines:

1. Fork the repository and create a new branch for your feature or bug fix.
2. Make your changes and ensure that the code follows the project's coding standards.
3. Test your changes thoroughly.
4. Submit a pull request with a clear description of your changes.