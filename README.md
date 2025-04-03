# Club Website

This is a React application for our club, featuring information about our workshops, executive board, and development team.

## Project Structure

```
ufsec-site-test/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable React components
│   │   ├── Tabs.jsx        # Navigation tabs
│   │   ├── WorkshopTile.jsx # Workshop preview tiles
│   │   └── WorkshopDetail.jsx # Workshop detail page
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx    # Home page
│   │   ├── Workshops.jsx   # Workshops page
│   │   ├── ExecBoard.jsx   # Executive board page
│   │   └── DevTeam.jsx     # Development team page
│   ├── firebase/           # Firebase configuration
│   │   └── firebase.js     # Firebase initialization
│   ├── App.jsx             # Main app component
│   ├── index.js            # Entry point
│   └── index.css           # Global styles
├── .env                    # Environment variables
├── .gitignore              # Git ignore file
├── package.json            # Project metadata and dependencies
└── README.md               # Project documentation
```

## Setup Instructions

1. Clone the repository:

   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```
   cd ufsec-site-test
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
