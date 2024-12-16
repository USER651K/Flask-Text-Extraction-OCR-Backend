from flask import Flask, request, render_template, jsonify, send_file
from flask_cors import CORS
import pytesseract
from pytesseract import Output
import cv2
import numpy as np
import tempfile
import os

app = Flask(__name__)
CORS(app)

# Route for the index page
@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

# Route for uploading the image
@app.route('/', methods=['POST'])
def upload_image():
    try:
        file = request.files['image']
        if file and file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            temp_filename = os.path.join(tempfile.gettempdir(), file.filename)
            file.save(temp_filename)
            
            # Perform OCR processing using Tesseract and OpenCV
            image = cv2.imread(temp_filename)
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            text = pytesseract.image_to_string(gray)
            
            # Save the output image with bounding boxes
            output_filename = os.path.join(os.getcwd(), 'output.jpg')
            output_image = draw_bounding_boxes(image, text)
            cv2.imwrite(output_filename, output_image)
            
            # Return JSON response with text and image URL
            return jsonify({
                'text': text,
                'image_url': '/output.jpg'
            })
        else:
            return jsonify({'error': 'Invalid file format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        # Clean up temporary file
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

# Route for serving the output image
@app.route('/output.jpg', methods=['GET'])
def serve_output_image():
    output_filename = os.path.join(os.getcwd(), 'output.jpg')
    return send_file(output_filename, mimetype='image/jpeg')

def draw_bounding_boxes(img, text):
    d = pytesseract.image_to_data(img, output_type=Output.DICT)
    n_boxes = len(d['text'])
    for i in range(n_boxes):
        if int(d['conf'][i]) > 60:
            (x, y, w, h) = (d['left'][i], d['top'][i], d['width'][i], d['height'][i])
            img = cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)
    return img

if __name__ == '__main__':
    app.run(debug=True)
