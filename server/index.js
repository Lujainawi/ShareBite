const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// השתמש ב-CORS אם צריך API
app.use(cors());

// מגיש את הקבצים הסטטיים (index.html ועוד)
app.use(express.static(path.join(__dirname, '../')));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});