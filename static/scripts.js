document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('mycanvas');
    const fileInput = document.getElementById('fileInput');
    const chooseFileButton = document.getElementById('chooseFileButton');
    const scanButton = document.getElementById('scanButton'); // Updated ID
    const fileNameDisplay = document.getElementById('fileName');
    const textarea = document.getElementById('textarea');
    let selectedFile = null;

    chooseFileButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', function(event) {
        selectedFile = event.target.files[0];
        if (selectedFile) {
            fileNameDisplay.textContent = selectedFile.name;

            // Create a new image and draw it on the canvas
            const img = new Image();
            img.onload = function() {
                fitImageOnCanvas(img, canvas);
            }
            img.src = URL.createObjectURL(selectedFile); // Use Object URL to display the selected file
            scanButton.disabled = false; // Enable the scan button
        }
    });

    scanButton.addEventListener('click', () => {
        if (selectedFile) {
            const formData = new FormData();
            formData.append('image', selectedFile);

            fetch('/', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                textarea.value = data.text;
            })
            .catch(error => console.error('Error:', error));
        }
    });

    function setCanvasResolution(canvas, width, height) {
        const devicePixelRatio = window.devicePixelRatio || 1;
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        const ctx = canvas.getContext('2d');
        ctx.scale(devicePixelRatio, devicePixelRatio);
    }

    function fitImageOnCanvas(image, canvas) {
        const ctx = canvas.getContext('2d');
        const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = canvas.height / (window.devicePixelRatio || 1);

        // Calculate aspect ratios
        const imageAspectRatio = image.width / image.height;
        const canvasAspectRatio = canvasWidth / canvasHeight;

        let drawWidth, drawHeight, xOffset, yOffset;

        // Determine the dimensions to fit the image within the canvas
        if (imageAspectRatio > canvasAspectRatio) {
            drawWidth = canvasWidth;
            drawHeight = canvasWidth / imageAspectRatio;
            xOffset = 0;
            yOffset = (canvasHeight - drawHeight) / 2;
        } else {
            drawHeight = canvasHeight;
            drawWidth = canvasHeight * imageAspectRatio;
            xOffset = (canvasWidth - drawWidth) / 2;
            yOffset = 0;
        }

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Disable image smoothing for crisp pixels when scaling up
        ctx.imageSmoothingEnabled = false;

        // Draw the image
        ctx.drawImage(image, xOffset, yOffset, drawWidth, drawHeight);
    }

    // Set the initial canvas resolution
    const container = document.getElementById('canvasContainer');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    setCanvasResolution(canvas, containerWidth, containerHeight);
});
