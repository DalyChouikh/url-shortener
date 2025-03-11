
#  GDG ISSATSo URL Shortener

  

<div  align="center">

<img  src="frontend/public/favicon.png"  alt="GDG ISSATSo Logo"  width="120"  height="120">

<h3>Powerful URL Shortening Service Built for Google Developer Group ISSATSo</h3>

</div>

  

##  🚀 Overview

  

This project is a multi-feature web application for Google Developer Group on Campus ISSATSo. It is built with a Go backend that serves a React frontend, embedded directly within the Go binary. The first implemented feature is a powerful URL shortener service that allows users to create custom short links and QR codes.

  

##  ✨ Features

  

###  Currently Implemented

  

-  **URL Shortener**

- Create short, memorable links

- Customize QR code generation (color, size, format)

- Choose between PNG or SVG formats

- Set transparent backgrounds

- Track link click statistics

-  **User Authentication**

- Google OAuth integration

- User profile management

- URL management dashboard

  

###  Coming Soon

  

-  **Real-time Chat**: Connect with community members through instant messaging

-  **Event Management**: Stay updated with upcoming workshops and hackathons

-  **Community Polls**: Voice your opinion and participate in community decisions

-  **Meeting Scheduler**: Organize and coordinate team meetings

-  **Resource Hub**: Access curated learning materials and documentation

  

##  🛠️ Tech Stack

  

-  **Backend**: Go (Golang)

-  **Frontend**: React + TypeScript + Vite

-  **Styling**: TailwindCSS + shadcn/ui

-  **Database**: PostgreSQL

-  **Authentication**: Google OAuth

-  **Deployment**: Embedded frontend in Go binary

  

##  📋 Prerequisites

  

- Go 1.21+

- Node.js 18+ and npm

- PostgreSQL database

-  [goose](https://github.com/pressly/goose) for database migrations

  

##  🔧 Installation & Setup

  

###  Step 1: Clone the repository

  

```bash

git  clone  https://github.com/yourusername/url-shortener.git

cd  url-shortener

```

  

###  Step 2: Environment setup

  

Copy the example environment file and customize it with your own values:

  

```bash

cp  .env.example  .env.development

```

  

Required environment variables:

-  `DATABASE_CONNECTION_STRING`: PostgreSQL connection string

-  `GOOGLE_CLIENT_ID`: OAuth client ID from Google Cloud Console

-  `GOOGLE_CLIENT_SECRET`: OAuth client secret from Google Cloud Console

-  `SESSION_SECRET`: Random string used to encrypt session cookies

-  `ENV`: Set to `development` or `production`

  

###  Step 3: Setup the database

  

Run the database migrations:

  

```bash

make  migrate-local

```

  

For production environments:

  

```bash

make  migrate-production  user=username  password=yourpassword  host=dbhost  dbname=database

```

  

###  Step 4: Build and run the application

  

Build both frontend and backend:

  

```bash

make  build

```

  

Start the server:

  

```bash

make  start

```

  

For development:

  

```bash

make  dev

```

  

##  🔍 Usage

  

1.  **Access the application**: Open your browser and navigate to `http://localhost:8080`

2.  **Sign in**: Use your Google account to log in

3.  **Create short URLs**: Enter a long URL to generate a shortened version

4.  **Customize QR code**: Modify color, size, and format of the generated QR code

5.  **Manage URLs**: View analytics and manage your shortened URLs in the profile section

  

##  🧑‍💻 Development

  

###  Creating new database migrations

  

```bash

make  create-migration  name=your_migration_name

```

  

###  Frontend development

  

The frontend is built with React, TypeScript, and Vite. It's located in the `frontend` directory.

  

To work on the frontend separately:

  

```bash

cd  frontend

npm  install

npm  run  dev

```

  

###  How it works

  

1. The React frontend is built and the resulting assets are embedded in the Go binary at build time

2. The Go application serves these static assets and handles API requests

3. The frontend communicates with the backend through API endpoints

4. PostgreSQL stores user data, URL mappings, and analytics

## 👥 Contributors
- [Daly Chouikh](https://github.com/DalyChouikh)

  

##  🤝 Contributing

  

Contributions are welcome! Please feel free to submit a Pull Request.

  

1. Fork the project

2. Create your feature branch (`git checkout -b feature/amazing-feature`)

3. Commit your changes (`git commit -m 'Add some amazing feature'`)

4. Push to the branch (`git push origin feature/amazing-feature`)

5. Open a Pull Request

  

##  🙏 Acknowledgements

  

- Google Developer Groups for their support and resources

  

<div  align="center">

<img  src="frontend/public/favicon.png"  alt="GDG ISSATSo Logo"  width="120"  height="120">