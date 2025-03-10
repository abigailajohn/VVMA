# Vulnerable Management API

## Overview
The User Management API provides endpoints for managing users and groups, including authentication, password recovery, and group functionalities.

## Features
### User Management

    Create a new user
    Retrieve user details
    Update user information
    Delete a user
    Forgot Password
    Verify OTP

### Group Management

    Create a group
    Retrieve group details
    Update group information
    Delete a group
    Retreive members of a group
    Delete a group member
    Join a group by ID
    Join a group by invite URL
    Refresh group invite code


## Installation & Setup

### Prerequisites
Ensure you have the following installed on your system:
- Docker
- Docker Compose
- Node.js
- MySQL
- MailHog (for email testing)

### Running with Docker Compose
This method runs the API in a containerized environment.

- Clone the repository
```bash
git clone https://github.com/abigailajohn/user_management_api.git
cd user_management_api
```

- Start the services
```bash
sudo docker-compose up --build -d 
```
This will start the API, database, and MailHog.

- Check running containers
```bash
docker ps
```

- Access the API & Documentation:
```bash
API Base URL: http://localhost:3000
Swagger Docs: http://localhost:3000/api-docs
MailHog UI: http://localhost:8025
```

- Stop services when done:
```bash
sudo docker-compose down
```


### Run Using Docker


### Running Locally
If you prefer running the API without Docker, follow these steps:
- Clone the repository
```bash
git clone https://github.com/abigailajohn/user_management_api.git
cd user_management_api
```

- Install dependencies
```bash
npm install
```
- Set up the database:
Start MySQL and create a database.
Import the database schema
```bash
mysql -u usermanage -p user_management < init.sql
```
If you encounter authentication issues, run
```bash
ALTER USER 'usermanage'@'%' IDENTIFIED WITH mysql_native_password BY 'db_password';
FLUSH PRIVILEGES;
```

- Start MailHog
```bash
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

- Start the API
```bash
npm start
```
OR
```bash
node app.js
```

## Endpoints


## License
This project is licensed under the MIT License.