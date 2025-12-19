const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());

// Enable Cross-Origin Isolation for SharedArrayBuffer
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
});

app.use('/outputs', express.static(path.join(__dirname, 'outputs')));

// Configure storage
const uploadDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'outputs');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.post('/api/predict', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const inputPath = req.file.path;
    const inputFilename = path.parse(req.file.filename).name;
    const resultDir = path.join(outputDir, inputFilename);

    if (!fs.existsSync(resultDir)) fs.mkdirSync(resultDir);

    // Path to the virtual environment's sharp executable
    const sharpBin = path.join(__dirname, '..', 'venv', 'bin', 'sharp');

    // Command to run SHARP inference
    const cmd = `${sharpBin} predict -i "${inputPath}" -o "${resultDir}"`;

    console.log(`Running: ${cmd}`);

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: 'Prediction failed', details: stderr });
        }

        // Look for the .ply file in the output dir
        // SHARP typically saves as <original_name>.ply or the output folder structure.
        // Based on CLI behavior: sharp predict -i file.jpg -o output -> output/file.ply
        const plyFilename = `${path.parse(req.file.filename).name}.ply`;
        const plyPath = path.join(resultDir, plyFilename);

        if (fs.existsSync(plyPath)) {
            res.json({ success: true, filename: `${inputFilename}/${plyFilename}` });
        } else {
            // Fallback: search for any .ply inside the folder
            const files = fs.readdirSync(resultDir);
            const firstPly = files.find(f => f.endsWith('.ply'));
            if (firstPly) {
                res.json({ success: true, filename: `${inputFilename}/${firstPly}` });
            } else {
                res.status(500).json({ error: 'Output file not found' });
            }
        }
    });
});

app.get('/api/download/:folder/:file', (req, res) => {
    const filePath = path.join(outputDir, req.params.folder, req.params.file);
    if (fs.existsSync(filePath)) {
        res.setHeader('Content-Disposition', `attachment; filename="${req.params.file}"`);
        res.download(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
