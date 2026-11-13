const express = require('express');
const WebTorrent = require('webtorrent');
const cors = require('cors');

const app = express();
const client = new WebTorrent();

app.use(cors());
app.use(express.json());

// Magnet ලින්ක් එක දුන්නම ඒකේ තියෙන ෆයිල්ස් ටික හොයලා දෙන Endpoint එක
app.post('/stream', (req, res) => {
    const magnetURI = req.body.magnet;

    if (!magnetURI) {
        return res.status(400).json({ error: 'Magnet link is required' });
    }

    // Torrent එක Client එකට ඇඩ් කරනවා
    client.add(magnetURI, (torrent) => {
        console.log('Torrent Added:', torrent.infoHash);

        const files = torrent.files.map((file, index) => {
            return {
                id: index.toString(),
                name: file.name,
                size: (file.length / (1024 * 1024)).toFixed(2) + ' MB', // Size in MB
                // මේ ලින්ක් එක තමයි React Native App එකේ Player එකට යවන්නේ
                streamUrl: `http://localhost:3000/play/${torrent.infoHash}/${index}` 
            };
        });

        res.json({ files: files });
    });
});

// React Native Player එකට Video එක Stream කරන Endpoint එක
app.get('/play/:infoHash/:fileIndex', (req, res) => {
    const { infoHash, fileIndex } = req.params;
    
    const torrent = client.get(infoHash);
    if (!torrent) {
        return res.status(404).send('Torrent not found');
    }

    const file = torrent.files[fileIndex];
    if (!file) {
        return res.status(404).send('File not found');
    }

    // වීඩියෝ ෆයිල් එකක් නෙවෙයි නම් ඩවුන්ලෝඩ් වෙන්න දෙනවා, වීඩියෝ එකක් නම් ප්ලේ වෙන්න දෙනවා
    res.setHeader('Content-Disposition', `inline; filename="${file.name}"`);
    
    // HTTP Range Requests සපෝට් කරන විදිහට Stream එක දෙනවා (ඉස්සරහට/පස්සට කරලා බලන්න)
    file.createReadStream().pipe(res);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`StreamX Engine running on port ${PORT}`);
});
