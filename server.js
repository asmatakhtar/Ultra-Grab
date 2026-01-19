const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

app.use(express.static('public'));
app.use('/assets', express.static('assets'));
app.use(express.urlencoded({ extended: true }));

const downloadDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

io.on('connection', (socket) => {
    console.log('Client connected for download');

    socket.on('start-download', (videoUrl) => {
        const fileName = `UltraGrab_Asmat_${Date.now()}.mp4`;
        const filePath = path.join(downloadDir, fileName);

        // Python module based execution (Stable for Windows)
        const process = spawn('python', [
            '-m', 'yt_dlp',
            '-o', filePath,
            '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            '--newline',
            '--no-check-certificate',
            videoUrl
        ]);

        process.stdout.on('data', (data) => {
            const output = data.toString();
            const match = output.match(/(\d+\.\d+)%/);
            if (match) {
                socket.emit('progress', match[1]); // Sending % to frontend
            }
        });

        process.on('close', (code) => {
            if (code === 0 && fs.existsSync(filePath)) {
                socket.emit('finished', { fileName });
            } else {
                socket.emit('error', 'Download failed. Check link or FFmpeg.');
            }
        });
    });
});

// Auto-trigger Download Route
app.get('/get-file/:name', (req, res) => {
    const fileName = req.params.name;
    const filePath = path.join(downloadDir, fileName);
    if (fs.existsSync(filePath)) {
        res.download(filePath, fileName, (err) => {
            if (!err) {
                setTimeout(() => { if(fs.existsSync(filePath)) fs.unlinkSync(filePath); }, 120000);
            }
        });
    }
});

server.listen(PORT, () => console.log(`🚀 UltraGrab Pro: http://localhost:${PORT}`));