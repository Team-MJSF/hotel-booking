# hotel-booking

Okay, I ran 'npm create vite@latest' and then selected React as our framework and JavaScript as our variant. Vite is a build tool that makes it easy to install and run the React framework files

Then I ran 'npm init' in the backend folder to create an empty package.json file and ran 'npm install express sequelize cors dotenv mysql2 bcryptjs jsonwebtoken express-validator' to install our dependencies (packages/tools we will be using with Express/Node).

Now that I have initialized our project with React and Express, the package.json files can be used with the 'npm install' command in both the frontend and backend folders during initial installation of a new project.


An .env file will need to be created with the following format:

PORT=5000

DB_HOST=localhost

DB_USER=root

DB_PASS=

DB_NAME=hotel-booking



Once 'npm install' has been run in both folders, 'npm run dev' can be used in both folders to start the backend and frontend folders


Here are some resources for our frontend and backend that may be helpful to work through when we are not working on the project itself:

React - JavaScript frontend framework: https://react.dev/learn

Express - Node.js (JavaScript) backend framework: https://www.linkedin.com/learning-login/share?account=76216298&forceAccount=false&redirect=https%3A%2F%2Fwww.linkedin.com%2Flearning%2Fexpress-essentials-build-powerful-web-apps-with-node-js%3Ftrk%3Dshare_ent_url%26shareId%3DkC0KM9j1RwGbhobPLwd%252F7A%253D%253D

Sequelize - Node.js tool that will allow us to interact with the MySQL database using JavaScript instead of raw SQL: https://sequelize.org/docs/v6/getting-started/
=======
Once 'npm install' has been run in both folders, 'npm run dev' can be used in both folders to start the backend and frontend folders

