function startDownload() {
    const url = document.getElementById('videoUrl').value;
    const btn = document.getElementById('downloadBtn');
    const progContainer = document.getElementById('progressContainer');
    const fill = document.getElementById('progressFill');
    const status = document.getElementById('statusText');

    if (url === "") {
        alert("Please paste a link first!");
        return;
    }

    // UI Updates
    btn.disabled = true;
    btn.innerText = "Processing...";
    progContainer.classList.remove('hidden');

    // Simulating Download Progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            status.innerText = "✅ Download Complete!";
            status.style.color = "#4CAF50";
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> DOWNLOAD AGAIN';
        }
        fill.style.width = progress + "%";
        status.innerText = `Downloading... ${Math.round(progress)}%`;
    }, 500);
}
