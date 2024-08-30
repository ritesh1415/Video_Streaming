// index.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { load } = require('@tensorflow/tfjs');
const cocoSsd = require('@tensorflow-models/coco-ssd');

const app = express();
const port = 5000;

// Setup Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Route to handle video frames
app.post('/analyze', upload.single('frame'), async (req, res) => {
    const model = await cocoSsd.load();
    const img = req.file.buffer;
    const imageTensor = tf.node.decodeImage(img);
    
    // Analyze the image
    const predictions = await model.detect(imageTensor);
    res.json(predictions);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
