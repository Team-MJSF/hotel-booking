# hotel-booking

first commit

Okay, I ran 'npm create vite@latest' and then selected React as our framework and JavaScript as our variant. Vite is a build tool that makes it easy to install and run the React framework files

Then I ran 'npm init' to create an empty package.json file and ran 'npm install express sequelize cors dotenv mysql2 bcryptjs jsonwebtoken express-validator' to install our dependencies (packages/tools we will be using with Express/Node).

Now that I have initialized our project with React and Express, the package.json files can be used with the 'npm install' command in both the frontend and backend folders during initial installation of a new project.

An .env file will need to be created with the following format:

PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=hotel-booking

Once 'npm install' has been run in both folders, 'npm run dev' can be used in both folders to start the backend and frontend folders