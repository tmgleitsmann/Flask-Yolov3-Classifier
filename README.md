# Flask-Yolov3-Classifier
React Application that sends jpg images to run against flask hosted neural network.

GETTING STARTED
1) You will need to get your hands on the yolo.h5 model file (for yolov3). Since it is quite large, I'll provide a link to it:
https://github.com/OlafenwaMoses/ImageAI/releases/download/1.0/yolo.h5
*yolo-tiny.h5 file*
https://github.com/OlafenwaMoses/ImageAI/releases/download/1.0/yolo-tiny.h5

2) You will need to npm install the required packages for the react application.

3) npm run build:prod to build a bundle.js for the react application.

4) npm run dev-server to host a webpack development server for the front-end application.

5) Create a virtual environment to host the flask application in. Install the dependencies provided in the requirements.txt file.

6) Host the flask application on your virtual environment by...
  export FLASK_APP=serverv3.py
  flask run --host=0.0.0.0
  *Note* the flask application loads the yolov3 model on startup. This model is reasonably sized (237mb), so it may take time to load. Can change to the tiny version of yolo, however it will be less accurate.
  
7) You should be good to go! Be sure that your flask server is hosted on http://0.0.0.0:5000, if not then specificy the route in the 
react files.js. 


HOW DOES IT WORK
On the React Side
-Upload a file and React will turn it into a Blob & encode it into a uint8 array. This gives us the file info as "pixel" data.
-Post request to our flask server with the specs of the file.
-Recieve a response json object that should house the name, labels, scores, modified base64 encoded image, etc.
-Stores this json object in redux which will automatically trigger a re-render in our runs components. Runs will show results of flask.

On the Flask Side


-After initializing our flask app, we'll immediately load in our yolo model.
-On our image and video route we'll grab the request object and parse it. Decode our image/video into bytes so we can run it through opencv.
-For every frame in the video or for every image, pre-process and modify into a rank4 tensor of size 416,416 so the yolo model can predict on it. 
-After predicting on our model, we find the coordinates of our classes (with high enough threshold value) and draw those coordinates as rectangles on. 
-Compliment each rectangle with it's corresponding label and return the new image.
-If video, write every frame to output video file and serialize video into response object. If image, serialize into response object.
-Send response object back to front end.


Originally I took a VGG16 model and retrained it to work on 4 classes; dogs, cats, cars and people. The model worked perfectly, however it wasn't capable of detecting multiple classes on one image and it wasn't capable of outputting where the mapped features were on the image. So I decided to copy the yolov3 layers and copy them over to a Keras model. 

About the YoloV3 Model:
It is MUCH larger than the VGG16 model I described perviously and therefore takes a little longer to run. Also, YoloV3 uses ReLU activation function so it is capable of not falsely providing a label when there is none (winner takes all) and can provide multiple labels when detected. The full summary of the YoloV3 model is available in architecture.py.




What's also included:
architecture.py file that you can use to see the architecture of the yolo model. Maybe you'd like to modify it before using it.
yolo-tiny architecture, anchors, and classes file
