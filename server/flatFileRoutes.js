const express = require('express');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload-csv', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      const columns = Object.keys(results[0]);
      const preview = results.slice(0, 100);
      res.json({ columns, preview });
    });
});

module.exports = router;
