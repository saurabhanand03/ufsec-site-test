# Club Website

This is a React application for our club, featuring information about our workshops, executive board, and development team.

## Project Structure

```
club-website
├── public
│   ├── index.html         # Main HTML file for the React application
│   └── favicon.ico        # Favicon for the website
├── src
│   ├── components
│   │   ├── Tabs.jsx       # Navigation tabs component
│   │   ├── WorkshopTile.jsx# Component for displaying workshop tiles
│   │   └── WorkshopDetail.jsx # Component for displaying workshop details
│   ├── pages
│   │   ├── HomePage.jsx   # Placeholder for home page content
│   │   ├── Workshops.jsx   # Page displaying all workshops
│   │   ├── ExecBoard.jsx   # Placeholder for executive board content
│   │   └── DevTeam.jsx     # Placeholder for development team content
│   ├── App.jsx            # Main application component
│   ├── index.js           # Entry point for the React application
│   └── index.css          # Global styles and Tailwind CSS imports
├── package.json           # npm configuration file
├── tailwind.config.js     # Tailwind CSS configuration file
└── README.md              # Project documentation
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd club-website
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm start
   ```

5. Open your browser and go to `http://localhost:3000` to view the application.

## Features

- **Home Page**: A placeholder for club information.
- **Workshops**: Displays tiles for each workshop with a preview video, title, and date.
- **Exec Board**: A placeholder for the executive board information.
- **Dev Team**: A placeholder for the development team information.

## Future Enhancements

- Add more detailed content to the Home, Exec Board, and Dev Team pages.
- Implement workshop detail pages with actual content and videos.
- Enhance the styling and animations for a better user experience.