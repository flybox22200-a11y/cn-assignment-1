# University Research Opportunity Portal

A web application where faculty members can post, view, update, close and delete research opportunities in one place. It has a Node.js/Express REST API, a MySQL database and a simple HTML/CSS/JavaScript frontend.

**GitHub Repository:** https://github.com/flybox22200-a11y/cn-assignment-1

**Demo Video:** _add link here_

| | |
|---|---|
| Name | _your name_ |
| Reg. No | _your reg. no_ |
| Program | BS (AI 5A) |
| Course | Computer Networks |

## Technologies Used

- **Backend:** Node.js, Express
- **Database:** MySQL (`mysql2` driver)
- **Frontend:** HTML, CSS, JavaScript (Fetch API)
- **API Testing:** Postman

## Project Structure

```
cn-assignment-1/
├── backend/
│   ├── server.js          Express server, REST routes and validation
│   ├── db.js              MySQL connection pool
│   ├── package.json
│   └── .env.example       Template for database settings
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── database/
│   └── schema.sql         Creates the database and table
├── postman/
│   └── Research-Opportunity-Portal.postman_collection.json
├── package.json           Root scripts used for deployment
└── README.md
```

## Setup and Run Instructions

### 1. Requirements

- [Node.js](https://nodejs.org/) (v18 or newer)
- [MySQL Server](https://dev.mysql.com/downloads/) 8.x (MySQL Workbench is optional)

### 2. Create the database

Open MySQL Workbench and run `database/schema.sql`, or run this from the project folder:

```bash
mysql -u root -p < database/schema.sql
```

This creates the `research_portal` database and the `opportunities` table.

### 3. Configure the backend

```bash
cd backend
npm install
```

Copy `.env.example` to a new file named `.env`, then put your own MySQL password in it:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=research_portal
PORT=3000
```

The `.env` file is listed in `.gitignore`, so your password is never uploaded to GitHub.

### 4. Start the server

```bash
npm start
```

You should see `Server running on http://localhost:3000`.

### 5. Open the application

Go to **http://localhost:3000** in your browser. The Express server serves both the frontend and the API, so nothing else needs to be started.

## Deployment (Railway)

**Live URL:** _add link here_

1. Create a new Railway project and add a **MySQL** database.
2. Add a service from this GitHub repository (leave the root directory empty). Railway runs `npm install` and `npm start` from the root `package.json`.
3. In the app service **Variables** tab, add:
   ```
   DB_HOST=${{MySQL.MYSQLHOST}}
   DB_PORT=${{MySQL.MYSQLPORT}}
   DB_USER=${{MySQL.MYSQLUSER}}
   DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
   DB_NAME=research_portal
   ```
4. Load the schema into the Railway database using the public connection details from the MySQL service **Connect** tab:
   ```
   mysql -h <public host> -P <public port> -u root -p --protocol=TCP
   SOURCE path/to/database/schema.sql;
   ```
5. In the app service **Settings → Networking**, click **Generate Domain** to get a public URL.

## Database Table: `opportunities`

| Column | Type | Description |
|---|---|---|
| id | INT, auto increment | Unique ID |
| title | VARCHAR(200) | Research title |
| description | TEXT | Research description |
| research_area | VARCHAR(100) | Research area |
| faculty_name | VARCHAR(100) | Faculty member's name |
| department | VARCHAR(100) | Department |
| required_skills | VARCHAR(255) | Required skills (comma separated) |
| positions | INT | Number of available positions |
| deadline | DATE | Application deadline |
| status | ENUM('Open','Closed') | Status |
| created_at | TIMESTAMP | Date and time the record was created |

## API Endpoints

Base URL: `http://localhost:3000/api`

| Method | Endpoint | Description | Success | Errors |
|---|---|---|---|---|
| POST | `/opportunities` | Create a research opportunity | 201 Created | 400, 500 |
| GET | `/opportunities` | Get all research opportunities | 200 OK | 500 |
| GET | `/opportunities/:id` | Get one research opportunity | 200 OK | 400, 404, 500 |
| PUT | `/opportunities/:id` | Update a research opportunity | 200 OK | 400, 404, 500 |
| DELETE | `/opportunities/:id` | Delete a research opportunity | 200 OK | 400, 404, 500 |

### Example request body (POST and PUT)

```json
{
  "title": "Deep Learning for Medical Image Analysis",
  "description": "Develop CNN models to detect diseases from X-ray and MRI scans.",
  "research_area": "Artificial Intelligence",
  "faculty_name": "Dr. Ahmed Khan",
  "department": "Computer Science",
  "required_skills": "Python, PyTorch, Image Processing",
  "positions": 3,
  "deadline": "2026-12-15",
  "status": "Open"
}
```

All fields are required for both POST and PUT. To close an opportunity, send a PUT request with the same data and `"status": "Closed"`.

### Validation rules

- Every field must be filled in.
- `positions` must be a whole number of at least 1.
- `deadline` must be a valid date (`YYYY-MM-DD`).
- `status` must be `Open` or `Closed`.
- The `:id` in the URL must be a positive whole number.

### Example error responses

```json
{ "message": "Validation failed", "errors": ["Title is required"] }
```

```json
{ "message": "Opportunity not found" }
```

All SQL queries use `?` placeholders, so user input is never inserted directly into SQL (this protects against SQL injection).

## Postman Collection

1. Open Postman, click **Import** and select `postman/Research-Opportunity-Portal.postman_collection.json`.
2. Start the server with `npm start`.
3. Run the requests in order (or use **Run collection**):

| # | Request | Expected |
|---|---|---|
| 1–3 | Create three opportunities | 201 |
| 4 | Get all opportunities | 200 |
| 5 | Get one opportunity by ID | 200 |
| 6 | Update an opportunity | 200 |
| 7 | Change status from Open to Closed | 200 |
| 8 | Delete an opportunity | 200 |
| 9 | Get the deleted opportunity | 404 |
| 10 | Create with invalid/missing data | 400 |

The create requests save the new IDs in collection variables (`id1`, `id2`, `id3`), so the later requests always use the correct IDs.

## Frontend Features

- View all research opportunities in a table
- View complete details of a selected opportunity
- Create a new opportunity with a form
- Edit an existing opportunity
- Close an open opportunity with one click
- Delete an opportunity (with confirmation)
- Success and error messages
- Required field validation before sending the form
