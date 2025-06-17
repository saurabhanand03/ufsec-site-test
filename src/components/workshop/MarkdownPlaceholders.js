export const DEFAULT_MARKDOWN = `# Workshop Instructions

## Overview
Brief description of what this workshop covers.

## Prerequisites
* Item 1
* Item 2

## Setup Instructions
1. First step
2. Second step

## Code Examples

\`\`\`python
# filename: app.py
def hello_world():
    print("Hello, SEC!")
\`\`\`

\`\`\`javascript
// filename: index.js
function greeting() {
  console.log("Welcome to SEC workshop!");
  return "Hello, developer!";
}
\`\`\`

## Step 1: Create Your HTML File

\`\`\`html
<!-- filename: index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>SEC Workshop</title>
</head>
<body>
  <h1>Web Development with SEC</h1>
  <div id="app"></div>
  <script src="index.js"></script>
</body>
</html>
\`\`\`

## Step 2: Add Some Styling

\`\`\`html
<!-- filename: index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>SEC Workshop</title>
  <!-- [highlight] -->
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    
    h1 {
      color: #0021A5; /* UF Blue */
    }
    
    #app {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  </style>
  <!-- [/highlight] -->
</head>
<body>
  <h1>Web Development with SEC</h1>
  <div id="app"></div>
  <script src="index.js"></script>
</body>
</html>
\`\`\`

## Step 3: Update JavaScript Functionality

\`\`\`javascript
// filename: index.js
function greeting() {
  console.log("Welcome to SEC workshop!");
  return "Hello, developer!";
}

// [highlight]
// Add event listener when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const appDiv = document.getElementById('app');
  
  // Create a new element
  const messageElement = document.createElement('p');
  messageElement.textContent = greeting();
  
  // Add it to the DOM
  appDiv.appendChild(messageElement);
});
// [/highlight]
\`\`\`

## Step 4: Python Example with Highlights

\`\`\`python
# filename: data_processor.py
import pandas as pd

def load_data(file_path):
    return pd.read_csv(file_path)

# [highlight]
# Add a new function to process data
def process_data(data):
    # Remove missing values
    data = data.dropna()
    
    # Normalize numeric columns
    numeric_cols = data.select_dtypes(include=['float64', 'int64']).columns
    data[numeric_cols] = (data[numeric_cols] - data[numeric_cols].mean()) / data[numeric_cols].std()
    
    return data
# [/highlight]

if __name__ == "__main__":
    data = load_data("data.csv")
    print("Data loaded successfully")
\`\`\`

## Additional Resources
* [Link Description](https://example.com)
* [Another Resource](https://example.com)

## Common Issues & Solutions
**Issue**: Description of common issue
**Solution**: How to fix it

---
*Created by the UF SEC team*
`;
