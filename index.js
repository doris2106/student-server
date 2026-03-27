import express from "express";
import morgan from "morgan";
import axios from "axios";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;
app.use(morgan("combined"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// In-memory movie storage
let movies = [
  {
    id: 1,
    title: "Inception",
    genre: "Sci-Fi",
    rating: 4.8,
    recommendation: "Yes"
  },
  {
    id: 2,
    title: "The Dark Knight",
    genre: "Action",
    rating: 4.9,
    recommendation: "Yes"
  },
  {
    id: 3,
    title: "Pulp Fiction",
    genre: "Crime",
    rating: 4.7,
    recommendation: "Yes"
  },
  {
    id: 4,
    title: "Avengers: Endgame",
    genre: "Action",
    rating: 4.6,
    recommendation: "Yes"
  }
];

// API ENDPOINTS FOR MOVIE RECOMMENDATIONS

// GET /movies - Retrieve all movies with optional rating filter
app.get("/movies", (req, res) => {
  try {
    const { rating } = req.query;
    
    let filteredMovies = movies;
    
    // Filter by rating if provided
    if (rating) {
      const ratingValue = parseFloat(rating);
      if (isNaN(ratingValue)) {
        return res.status(400).json({
          success: false,
          message: "Invalid rating value. Please provide a valid number.",
          data: null
        });
      }
      filteredMovies = movies.filter(movie => movie.rating >= ratingValue);
    }
    
    res.status(200).json({
      success: true,
      message: "Movies retrieved successfully",
      count: filteredMovies.length,
      data: filteredMovies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving movies",
      error: error.message
    });
  }
});

// POST /movies - Create a new movie
app.post("/movies", (req, res) => {
  try {
    const { title, genre, rating, recommendation } = req.body;
    
    // Validation
    if (!title || !genre || rating === undefined || !recommendation) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields. Please provide: title, genre, rating, recommendation",
        data: null
      });
    }
    
    // Validate rating
    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 0 and 5",
        data: null
      });
    }
    
    // Validate recommendation
    if (!['Yes', 'No'].includes(recommendation)) {
      return res.status(400).json({
        success: false,
        message: "Recommendation must be 'Yes' or 'No'",
        data: null
      });
    }
    
    // Create new movie
    const newMovie = {
      id: movies.length > 0 ? Math.max(...movies.map(m => m.id)) + 1 : 1,
      title,
      genre,
      rating,
      recommendation
    };
    
    movies.push(newMovie);
    
    res.status(201).json({
      success: true,
      message: "Movie created successfully",
      data: newMovie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating movie",
      error: error.message
    });
  }
});

// PATCH /movies/:id - Update a specific movie
app.patch("/movies/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { title, genre, rating, recommendation } = req.body;
    
    const movieIndex = movies.findIndex(m => m.id === parseInt(id));
    
    if (movieIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Movie with ID ${id} not found`,
        data: null
      });
    }
    
    // Update only provided fields
    if (title) movies[movieIndex].title = title;
    if (genre) movies[movieIndex].genre = genre;
    if (rating !== undefined) {
      if (typeof rating !== 'number' || rating < 0 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be a number between 0 and 5",
          data: null
        });
      }
      movies[movieIndex].rating = rating;
    }
    if (recommendation) {
      if (!['Yes', 'No'].includes(recommendation)) {
        return res.status(400).json({
          success: false,
          message: "Recommendation must be 'Yes' or 'No'",
          data: null
        });
      }
      movies[movieIndex].recommendation = recommendation;
    }
    
    res.status(200).json({
      success: true,
      message: "Movie updated successfully",
      data: movies[movieIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating movie",
      error: error.message
    });
  }
});

// DELETE /movies/:id - Delete a specific movie
app.delete("/movies/:id", (req, res) => {
  try {
    const { id } = req.params;
    
    const movieIndex = movies.findIndex(m => m.id === parseInt(id));
    
    if (movieIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Movie with ID ${id} not found`,
        data: null
      });
    }
    
    const deletedMovie = movies.splice(movieIndex, 1);
    
    res.status(200).json({
      success: true,
      message: "Movie deleted successfully",
      data: deletedMovie[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting movie",
      error: error.message
    });
  }
});

// API Documentation endpoint
app.get("/api/docs", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Movie API Documentation</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          min-height: 100vh;
          padding: 2rem;
        }
        
        .container {
          max-width: 900px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 25px 50px rgba(0,0,0,0.15);
        }
        
        h1 {
          color: #f093fb;
          margin-bottom: 0.5rem;
          font-size: 2.5rem;
        }
        
        .subtitle {
          color: #718096;
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }
        
        .endpoint {
          background: #f8fafc;
          border-left: 4px solid #f093fb;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border-radius: 8px;
        }
        
        .method {
          display: inline-block;
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.85rem;
          margin-right: 1rem;
          color: white;
        }
        
        .get { background: #48bb78; }
        .post { background: #4299e1; }
        .patch { background: #ed8936; }
        .delete { background: #f56565; }
        
        .path {
          font-family: 'Courier New', monospace;
          background: #edf2f7;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-weight: 600;
          display: inline-block;
          color: #2d3748;
        }
        
        .description {
          color: #4a5568;
          margin-top: 1rem;
          line-height: 1.6;
        }
        
        .params, .body, .response {
          margin-top: 1rem;
          font-size: 0.95rem;
        }
        
        .params h4, .body h4, .response h4 {
          color: #2d3748;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }
        
        .code {
          background: #2d3748;
          color: #68d391;
          padding: 1rem;
          border-radius: 6px;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          font-size: 0.85rem;
          line-height: 1.5;
          margin-top: 0.5rem;
        }
        
        .feature-list {
          background: #f0fff4;
          border-left: 4px solid #48bb78;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }
        
        .feature-list li {
          margin: 0.5rem 0;
          margin-left: 1.5rem;
          color: #22543d;
        }
        
        a {
          color: #f093fb;
          text-decoration: none;
          font-weight: 500;
        }
        
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1><i class="fas fa-film"></i> Movie Recommendation API</h1>
        <p class="subtitle">Complete REST API Documentation for Movie Management</p>
        
        <div class="feature-list">
          <strong>✨ Features:</strong>
          <ul>
            <li>Create, Read, Update, and Delete movies</li>
            <li>Filter movies by rating threshold</li>
            <li>Comprehensive error handling</li>
            <li>JSON response format</li>
            <li>Input validation</li>
          </ul>
        </div>
        
        <!-- GET MOVIES -->
        <div class="endpoint">
          <span class="method get">GET</span>
          <span class="path">/movies</span>
          <p class="description">Retrieve all movies with optional rating filter</p>
          
          <div class="params">
            <h4>Query Parameters:</h4>
            <strong>rating</strong> (optional) - Filter movies with rating >= specified value
            <div class="code">GET /movies<br>GET /movies?rating=4</div>
          </div>
        </div>
        
        <!-- POST MOVIES -->
        <div class="endpoint">
          <span class="method post">POST</span>
          <span class="path">/movies</span>
          <p class="description">Create a new movie recommendation</p>
          
          <div class="body">
            <h4>Request Body:</h4>
            <div class="code">{
  "title": "Inception",
  "genre": "Sci-Fi",
  "rating": 4.8,
  "recommendation": "Yes"
}</div>
          </div>
          
          <div class="params">
            <h4>Requirements:</h4>
            <ul style="margin-left: 1.5rem;">
              <li><strong>title</strong> (string, required) - Movie title</li>
              <li><strong>genre</strong> (string, required) - Movie genre</li>
              <li><strong>rating</strong> (number, required) - Rating 0-5</li>
              <li><strong>recommendation</strong> (string, required) - 'Yes' or 'No'</li>
            </ul>
          </div>
        </div>
        
        <!-- PATCH MOVIES -->
        <div class="endpoint">
          <span class="method patch">PATCH</span>
          <span class="path">/movies/:id</span>
          <p class="description">Update an existing movie (partial update)</p>
          
          <div class="body">
            <h4>Request Body (any field optional):</h4>
            <div class="code">{
  "rating": 4.9,
  "recommendation": "Yes"
}</div>
          </div>
          
          <div class="params">
            <h4>URL Parameters:</h4>
            <strong>id</strong> - Movie ID
          </div>
        </div>
        
        <!-- DELETE MOVIES -->
        <div class="endpoint">
          <span class="method delete">DELETE</span>
          <span class="path">/movies/:id</span>
          <p class="description">Delete a specific movie</p>
          
          <div class="params">
            <h4>URL Parameters:</h4>
            <strong>id</strong> - Movie ID to delete
            <div class="code">DELETE /movies/1</div>
          </div>
        </div>
        
        <hr style="margin: 2rem 0; border: none; border-top: 1px solid #e2e8f0;">
        
        <div style="background: #ebf8ff; border-left: 4px solid #4299e1; padding: 1rem; border-radius: 8px; color: #1a365d;">
          <strong>📝 Example Usage with cURL:</strong>
          <div class="code" style="margin-top: 0.5rem; color: #48bb78; background: #2d3748;">
            # Get all movies<br>
            curl http://localhost:3000/movies<br><br>
            # Get movies with rating >= 4.5<br>
            curl http://localhost:3000/movies?rating=4.5<br><br>
            # Create a new movie<br>
            curl -X POST http://localhost:3000/movies \\<br>
            &nbsp;&nbsp;-H "Content-Type: application/json" \\<br>
            &nbsp;&nbsp;-d '{"title":"Avatar","genre":"Sci-Fi","rating":4.7,"recommendation":"Yes"}'<br><br>
            # Update a movie<br>
            curl -X PATCH http://localhost:3000/movies/1 \\<br>
            &nbsp;&nbsp;-H "Content-Type: application/json" \\<br>
            &nbsp;&nbsp;-d '{"rating":4.9}'<br><br>
            # Delete a movie<br>
            curl -X DELETE http://localhost:3000/movies/1
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});


app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Student Server - Home</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow-x: hidden;
          padding: 2rem;
        }

        .bg-element {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          animation: float 8s ease-in-out infinite;
        }

        .bg-element:nth-child(1) {
          width: 120px;
          height: 120px;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .bg-element:nth-child(2) {
          width: 80px;
          height: 80px;
          top: 70%;
          right: 15%;
          animation-delay: 2s;
        }

        .bg-element:nth-child(3) {
          width: 100px;
          height: 100px;
          bottom: 20%;
          left: 20%;
          animation-delay: 4s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        .welcome-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          padding: 3rem;
          border-radius: 24px;
          text-align: center;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 25px 50px rgba(0,0,0,0.15);
          border: 1px solid rgba(255,255,255,0.2);
          position: relative;
          z-index: 1;
        }

        .logo {
          font-size: 4rem;
          color: #667eea;
          margin-bottom: 1rem;
        }

        h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          font-size: 1.2rem;
          color: #718096;
          margin-bottom: 2rem;
          font-weight: 400;
        }

        .description {
          font-size: 1rem;
          color: #4a5568;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .features {
          display: grid;
          gap: 1rem;
          margin-bottom: 2rem;
          text-align: left;
        }

        .feature {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
          border-left: 3px solid #667eea;
          font-size: 0.9rem;
          color: #2d3748;
        }

        .actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          font-family: inherit;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          min-width: 120px;
          justify-content: center;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .btn-secondary {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .btn-secondary:hover {
          box-shadow: 0 10px 25px rgba(240, 147, 251, 0.3);
        }

        .footer {
          margin-top: 2rem;
          font-size: 0.9rem;
          color: #a0aec0;
        }

        @media (max-width: 480px) {
          .welcome-card {
            padding: 2rem;
            margin: 1rem;
          }

          h1 {
            font-size: 2rem;
          }

          .actions {
            flex-direction: column;
            align-items: center;
          }

          .btn {
            width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="bg-element"></div>
      <div class="bg-element"></div>
      <div class="bg-element"></div>

      <div class="welcome-card">
        <div class="logo">
          <i class="fas fa-server"></i>
        </div>

        <h1>Welcome to Joke Generator</h1>
        <p class="subtitle">A fun and interactive web application</p>

        <p class="description">
          This server provides various features including joke generation, student profile management,
          and contact information. Built with Node.js and Express for learning purposes.
        </p>

        <div class="features">
          <div class="feature">🎭 Generate random jokes with personalized responses</div>
          <div class="feature">👤 View student profile and academic information</div>
          <div class="feature">📧 Contact information and details</div>
          <div class="feature">🚀 Modern, responsive web design</div>
        </div>

        <div class="actions">
          <a href="/joke" class="btn">
            <i class="fas fa-laugh-beam"></i> Get Joke
          </a>
          <a href="/profile" class="btn btn-secondary">
            <i class="fas fa-user"></i> Profile
          </a>
        </div>

        <div class="footer">
          <p>Created by Doris • Computer Engineering</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get("/about", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>About - Student Server</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
        }

        .about-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 3rem;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 25px 50px rgba(0,0,0,0.15);
          border: 1px solid rgba(255,255,255,0.2);
          text-align: center;
        }

        .avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
          font-size: 3rem;
          color: white;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }

        h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          font-size: 1.2rem;
          color: #718096;
          margin-bottom: 2rem;
          font-weight: 400;
        }

        .info-grid {
          display: grid;
          gap: 1.5rem;
          margin-bottom: 2rem;
          text-align: left;
        }

        .info-item {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 12px;
          border-left: 4px solid #667eea;
        }

        .info-label {
          font-size: 0.9rem;
          color: #a0aec0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .info-value {
          font-size: 1.1rem;
          color: #2d3748;
          font-weight: 500;
        }

        .btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          font-family: inherit;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        @media (max-width: 480px) {
          .about-card {
            padding: 2rem;
            margin: 1rem;
          }

          h1 {
            font-size: 2rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="about-card">
        <div class="avatar">
          <i class="fas fa-user-graduate"></i>
        </div>

        <h1>Doris</h1>
        <p class="subtitle">Computer Engineering Student</p>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">
              <i class="fas fa-id-card"></i> Roll Number
            </div>
            <div class="info-value">10642</div>
          </div>

          <div class="info-item">
            <div class="info-label">
              <i class="fas fa-graduation-cap"></i> Course
            </div>
            <div class="info-value">Computer Engineering</div>
          </div>

          <div class="info-item">
            <div class="info-label">
              <i class="fas fa-code"></i> Skills
            </div>
            <div class="info-value">Node.js, Express, JavaScript, HTML, CSS</div>
          </div>
        </div>

        <a href="/" class="btn">
          <i class="fas fa-home"></i> Back to Home
        </a>
      </div>
    </body>
    </html>
  `);
});

app.get("/contact", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Contact - Student Server</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
        }

        .contact-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 3rem;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 25px 50px rgba(0,0,0,0.15);
          border: 1px solid rgba(255,255,255,0.2);
          text-align: center;
        }

        .contact-icon {
          font-size: 4rem;
          color: #f093fb;
          margin-bottom: 1rem;
        }

        h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          font-size: 1.1rem;
          color: #718096;
          margin-bottom: 2rem;
          font-weight: 400;
        }

        .contact-info {
          display: grid;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .contact-item {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 12px;
          border-left: 4px solid #f093fb;
          text-align: left;
          transition: transform 0.3s ease;
        }

        .contact-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .contact-label {
          font-size: 0.9rem;
          color: #a0aec0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .contact-value {
          font-size: 1.1rem;
          color: #2d3748;
          font-weight: 500;
        }

        .contact-value a {
          color: #f093fb;
          text-decoration: none;
          font-weight: 600;
        }

        .contact-value a:hover {
          text-decoration: underline;
        }

        .btn {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          font-family: inherit;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(240, 147, 251, 0.3);
        }

        @media (max-width: 480px) {
          .contact-card {
            padding: 2rem;
            margin: 1rem;
          }

          h1 {
            font-size: 2rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="contact-card">
        <div class="contact-icon">
          <i class="fas fa-envelope"></i>
        </div>

        <h1>Get In Touch</h1>
        <p class="subtitle">Feel free to reach out!</p>

        <div class="contact-info">
          <div class="contact-item">
            <div class="contact-label">
              <i class="fas fa-envelope"></i> Email
            </div>
            <div class="contact-value">
              <a href="mailto:dorisalphonso21@email.com">dorisalphonso21@email.com</a>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-label">
              <i class="fas fa-user"></i> Name
            </div>
            <div class="contact-value">Doris Alphonso</div>
          </div>

          <div class="contact-item">
            <div class="contact-label">
              <i class="fas fa-graduation-cap"></i> Student
            </div>
            <div class="contact-value">Computer Engineering</div>
          </div>
        </div>

        <a href="/" class="btn">
          <i class="fas fa-home"></i> Back to Home
        </a>
      </div>
    </body>
    </html>
  `);
});

app.post("/register", (req, res) => {
  res.sendStatus(201);
});

app.put("/update", (req, res) => {
  res.sendStatus(200);
});
app.get("/profile", (req, res) => {
  res.render("profile", {
    name: "Doris",
    branch: "Computer Engineering",
    year: "SE"
  });
});
app.get("/joke", async (req, res) => {
  try {
    const response = await axios.get("https://v2.jokeapi.dev/joke/Programming,Miscellaneous?blacklistFlags=nsfw,religious,political,racist,sexist,explicit");

    const jokeData = response.data;

    let joke;

    // Some jokes have 2 parts
    if (jokeData.type === "twopart") {
      joke = jokeData.setup + " 😂 " + jokeData.delivery;
    } else {
      joke = jokeData.joke;
    }

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Random Joke - Student Server</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            overflow-x: hidden;
            padding: 2rem;
          }

          .bg-decoration {
            position: absolute;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
            animation: float 6s ease-in-out infinite;
          }

          .bg-decoration:nth-child(1) {
            width: 100px;
            height: 100px;
            top: 15%;
            left: 15%;
          }

          .bg-decoration:nth-child(2) {
            width: 80px;
            height: 80px;
            top: 75%;
            right: 20%;
            animation-delay: 2s;
          }

          .bg-decoration:nth-child(3) {
            width: 60px;
            height: 60px;
            bottom: 25%;
            left: 25%;
            animation-delay: 4s;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(180deg); }
          }

          .joke-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            padding: 3rem;
            border-radius: 24px;
            text-align: center;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
            border: 1px solid rgba(255,255,255,0.2);
            position: relative;
            z-index: 1;
          }

          .joke-icon {
            font-size: 4rem;
            color: #ff758c;
            margin-bottom: 1rem;
          }

          h1 {
            font-size: 2.2rem;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 0.5rem;
          }

          .greeting {
            font-size: 1.1rem;
            color: #718096;
            margin-bottom: 2rem;
            font-weight: 400;
          }

          .joke-content {
            background: #f8fafc;
            padding: 2rem;
            border-radius: 16px;
            margin: 2rem 0;
            border-left: 4px solid #ff758c;
            position: relative;
          }

          .joke-content::before {
            content: '"';
            position: absolute;
            top: -10px;
            left: 20px;
            font-size: 4rem;
            color: #ff758c;
            opacity: 0.3;
            font-family: serif;
          }

          .joke-text {
            font-size: 1.2rem;
            color: #2d3748;
            line-height: 1.6;
            font-weight: 500;
          }

          .emoji {
            font-size: 1.5rem;
            margin: 0 0.2rem;
          }

          .actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 2rem;
          }

          .btn {
            background: linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%);
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 12px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            font-family: inherit;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
            min-width: 140px;
            justify-content: center;
          }

          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(255, 117, 140, 0.3);
          }

          .btn-secondary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          .btn-secondary:hover {
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
          }

          .footer {
            margin-top: 2rem;
            font-size: 0.9rem;
            color: #a0aec0;
          }

          .footer a {
            color: #ff758c;
            text-decoration: none;
            font-weight: 500;
          }

          .footer a:hover {
            text-decoration: underline;
          }

          @media (max-width: 480px) {
            .joke-card {
              padding: 2rem;
              margin: 1rem;
            }

            h1 {
              font-size: 1.8rem;
            }

            .joke-content {
              padding: 1.5rem;
            }

            .actions {
              flex-direction: column;
              align-items: center;
            }

            .btn {
              width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="bg-decoration"></div>
        <div class="bg-decoration"></div>
        <div class="bg-decoration"></div>

        <div class="joke-card">
          <div class="joke-icon">
            <i class="fas fa-laugh-squint"></i>
          </div>

          <h1>Random Joke</h1>
          <p class="greeting">Here's a joke for you! <i class="fas fa-smile-beam" style="color: #ff758c;"></i></p>

          <div class="joke-content">
            <p class="joke-text">${joke}</p>
          </div>

          <div class="actions">
            <form action="/joke" method="GET" style="display: inline;">
              <button type="submit" class="btn">
                <i class="fas fa-redo"></i> Another One
              </button>
            </form>
            <a href="/" class="btn btn-secondary">
              <i class="fas fa-home"></i> Home
            </a>
          </div>

          <div class="footer">
            <p>Powered by <a href="https://v2.jokeapi.dev/" target="_blank">JokeAPI</a></p>
          </div>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    res.send("Error fetching joke");
  }
});
app.post("/joke", async (req, res) => {
  try {
    const name = req.body.name;

    const response = await axios.get("https://v2.jokeapi.dev/joke/Any");

    const jokeData = response.data;

    let joke;

    if (jokeData.type === "twopart") {
      joke = jokeData.setup + " 😂 " + jokeData.delivery;
    } else {
      joke = jokeData.joke;
    }

 res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Joke - Student Server</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      overflow-x: hidden;
      padding: 2rem;
    }

    .bg-decoration {
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.1);
      animation: float 6s ease-in-out infinite;
    }

    .bg-decoration:nth-child(1) {
      width: 100px;
      height: 100px;
      top: 15%;
      left: 15%;
    }

    .bg-decoration:nth-child(2) {
      width: 80px;
      height: 80px;
      top: 75%;
      right: 20%;
      animation-delay: 2s;
    }

    .bg-decoration:nth-child(3) {
      width: 60px;
      height: 60px;
      bottom: 25%;
      left: 25%;
      animation-delay: 4s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-15px) rotate(180deg); }
    }

    .joke-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      padding: 3rem;
      border-radius: 24px;
      text-align: center;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 25px 50px rgba(0,0,0,0.15);
      border: 1px solid rgba(255,255,255,0.2);
      position: relative;
      z-index: 1;
    }

    .joke-icon {
      font-size: 4rem;
      color: #ff758c;
      margin-bottom: 1rem;
    }

    h1 {
      font-size: 2.2rem;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 0.5rem;
    }

    .greeting {
      font-size: 1.1rem;
      color: #718096;
      margin-bottom: 2rem;
      font-weight: 400;
    }

    .joke-content {
      background: #f8fafc;
      padding: 2rem;
      border-radius: 16px;
      margin: 2rem 0;
      border-left: 4px solid #ff758c;
      position: relative;
    }

    .joke-content::before {
      content: '"';
      position: absolute;
      top: -10px;
      left: 20px;
      font-size: 4rem;
      color: #ff758c;
      opacity: 0.3;
      font-family: serif;
    }

    .joke-text {
      font-size: 1.2rem;
      color: #2d3748;
      line-height: 1.6;
      font-weight: 500;
    }

    .emoji {
      font-size: 1.5rem;
      margin: 0 0.2rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 2rem;
    }

    .btn {
      background: linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%);
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 12px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      font-family: inherit;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      min-width: 140px;
      justify-content: center;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(255, 117, 140, 0.3);
    }

    .btn-secondary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .btn-secondary:hover {
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    }

    .footer {
      margin-top: 2rem;
      font-size: 0.9rem;
      color: #a0aec0;
    }

    .footer a {
      color: #ff758c;
      text-decoration: none;
      font-weight: 500;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .joke-card {
        padding: 2rem;
        margin: 1rem;
      }

      h1 {
        font-size: 1.8rem;
      }

      .joke-content {
        padding: 1.5rem;
      }

      .actions {
        flex-direction: column;
        align-items: center;
      }

      .btn {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="bg-decoration"></div>
  <div class="bg-decoration"></div>
  <div class="bg-decoration"></div>

  <div class="joke-card">
    <div class="joke-icon">
      <i class="fas fa-laugh-squint"></i>
    </div>

    <h1>Your Joke</h1>
    <p class="greeting">Hello ${name}! <i class="fas fa-wave" style="color: #ff758c;"></i></p>

    <div class="joke-content">
      <p class="joke-text">${joke}</p>
    </div>

    <div class="actions">
      <form action="/" method="GET" style="display: inline;">
        <button type="submit" class="btn">
          <i class="fas fa-redo"></i> Another Joke
        </button>
      </form>
      <a href="/profile" class="btn btn-secondary">
        <i class="fas fa-user"></i> Profile
      </a>
    </div>

    <div class="footer">
      <p>Powered by <a href="https://v2.jokeapi.dev/" target="_blank">JokeAPI</a></p>
    </div>
  </div>
</body>
</html>
`);
  } catch (error) {
    res.send("Error fetching joke");
  }
});

// Export for Vercel serverless functions
export default app;

// Local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}