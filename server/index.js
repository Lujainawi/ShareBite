const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Enable CORS if needed
app.use(cors());

// ✅ Serve your client folder as root
app.use(express.static(path.join(__dirname, '../client')));

// ✅ Serve assets and images if they are OUTSIDE client/
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/images', express.static(path.join(__dirname, '../images')));

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running at: http://localhost:${PORT}`);
});