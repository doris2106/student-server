# Student Server

A modern, interactive Node.js web application built with Express.js featuring joke generation, student profiles, and responsive design.

## Features

- 🎭 **Joke Generator**: Get personalized random jokes from the JokeAPI
- 👤 **Student Profile**: View student information in a beautiful card layout
- 📧 **Contact Information**: Professional contact page with details
- 🎨 **Modern UI**: Responsive design with glassmorphism effects and smooth animations
- 🚀 **Fast & Lightweight**: Built with Express.js and modern JavaScript

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript
- **Template Engine**: EJS
- **HTTP Client**: Axios
- **Styling**: Custom CSS with gradients and animations
- **Icons**: Font Awesome

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd student-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

- `GET /` - Home page with welcome message
- `GET /about` - Student information page
- `GET /contact` - Contact information page
- `GET /profile` - Student profile with EJS template
- `GET /joke` - Random joke generator
- `POST /joke` - Personalized joke with name input
- `POST /register` - Registration endpoint (returns 201)
- `PUT /update` - Update endpoint (returns 200)

## Project Structure

```
student-server/
├── index.js          # Main server file
├── package.json      # Dependencies and scripts
├── public/
│   └── index.html    # Home page HTML
└── views/
    └── profile.ejs   # Profile template
```

## Development

- Uses ES6 modules (`"type": "module"` in package.json)
- Morgan middleware for HTTP request logging
- Express static middleware for serving public files
- EJS for server-side templating

## License

MIT License - feel free to use this project for learning and development!

## Author

**Doris Alphonso** - Computer Engineering Student
- Email: dorisalphonso21@email.com
- Roll Number: 10642