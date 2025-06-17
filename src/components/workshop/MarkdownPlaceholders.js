export const DEFAULT_MARKDOWN = `# Workshop Title

Brief description of the workshop.

## Prerequisites
* Install [Git](https://git-scm.com/downloads) and [Node.js](https://nodejs.org/)
* Basic knowledge of [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## Setup Instructions
1. Clone the repository: \`git clone https://github.com/ufsec/example.git\`
2. Run \`npm install\`

## Code Examples

### Basic Code Block
\`\`\`
console.log("Hello World!");
const sum = (a, b) => a + b;
\`\`\`

### Code Block with Filename
\`\`\`python
# filename: hello.py
def greet(name):
    return f"Hello, {name}!"

print(greet("SEC"))
\`\`\`

### Code Block with Added Section
\`\`\`javascript
// filename: app.js
import React from 'react';

// [add]
function Welcome() {
  return <h1>Welcome to SEC!</h1>;
}
// [/add]

export default App;
\`\`\`

### Code Block with Modified Section
\`\`\`html
<!-- filename: index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>SEC Workshop</title>
</head>
<body>
  <!-- [modify] -->
  <h1>Workshop Demo</h1>
  <!-- [/modify] -->
  <div id="app"></div>
</body>
</html>
\`\`\`

### Code Block with Remove Section
\`\`\`javascript
// filename: utils.js
// [remove]
// This old function will be removed
function oldFunction() {
  console.log("This will be deleted");
}
// [/remove]

function newFunction() {
  console.log("Keep this function");
}
\`\`\`

## Additional Resources
* [SEC Website](https://ufsec.com)
* [Documentation](https://example.com)

---
*Created by the UF SEC team*
`;
