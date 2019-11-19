import os
os.environ['KERAS_BACKEND'] = 'tensorflow'
import base64
import numpy as np
import io
from PIL import Image
import keras
from keras import backend as K
from keras.models import Sequential, load_model, model_from_json
from keras.preprocessing.image import ImageDataGenerator
from keras.preprocessing.image import img_to_array
from flask import Flask
from flask import jsonify
from flask import request
from flask_cors import CORS
import tensorflow as tf
from matplotlib import pyplot
from matplotlib.patches import Rectangle
import cv2


app = Flask(__name__)
CORS(app)
class_threshold = 0.6
#THESE ARE OUR 80 LABELS
labels = ["person", "bicycle", "car", "motorbike", "aeroplane", "bus", "train", "truck",
    "boat", "traffic light", "fire hydrant", "stop sign", "parking meter", "bench",
    "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe",
    "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard",
    "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard",
    "tennis racket", "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana",
    "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake",
    "chair", "sofa", "pottedplant", "bed", "diningtable", "toilet", "tvmonitor", "laptop", "mouse",
    "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator",
    "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"]


#YOLO SPECIFIC CLASS TO BOUND BOXES
class BoundBox:
	def __init__(self, xmin, ymin, xmax, ymax, objness = None, classes = None):
		self.xmin = xmin
		self.ymin = ymin
		self.xmax = xmax
		self.ymax = ymax
		self.objness = objness
		self.classes = classes
		self.label = -1
		self.score = -1
 
	def get_label(self):
		if self.label == -1:
			self.label = np.argmax(self.classes)
 
		return self.label
 
	def get_score(self):
		if self.score == -1:
			self.score = self.classes[self.get_label()]
 
		return self.score

#YOLO SIGMOID FUNC
def _sigmoid(x):
	return 1. / (1. + np.exp(-x))


def decode_netout(netout, anchors, obj_thresh, net_h, net_w):
	grid_h, grid_w = netout.shape[:2]
	nb_box = 3
	netout = netout.reshape((grid_h, grid_w, nb_box, -1))
	nb_class = netout.shape[-1] - 5
	boxes = []
	netout[..., :2]  = _sigmoid(netout[..., :2])
	netout[..., 4:]  = _sigmoid(netout[..., 4:])
	netout[..., 5:]  = netout[..., 4][..., np.newaxis] * netout[..., 5:]
	netout[..., 5:] *= netout[..., 5:] > obj_thresh
 
	for i in range(grid_h*grid_w):
		row = i / grid_w
		col = i % grid_w
		for b in range(nb_box):
			# 4th element is objectness score
			objectness = netout[int(row)][int(col)][b][4]
			if(objectness.all() <= obj_thresh): continue
			# first 4 elements are x, y, w, and h
			x, y, w, h = netout[int(row)][int(col)][b][:4]
			x = (col + x) / grid_w # center position, unit: image width
			y = (row + y) / grid_h # center position, unit: image height
			w = anchors[2 * b + 0] * np.exp(w) / net_w # unit: image width
			h = anchors[2 * b + 1] * np.exp(h) / net_h # unit: image height
			# last elements are class probabilities
			classes = netout[int(row)][col][b][5:]
			box = BoundBox(x-w/2, y-h/2, x+w/2, y+h/2, objectness, classes)
			boxes.append(box)
	return boxes


#LOAD IN OUR MODEL TO GLOBAL VAR MODEL
def get_model():

	###########################################
	#UNDER IS FOR YOLO MODEL
	###########################################

	global model
	K.clear_session()
	json_file = open('yolo_v3_model_architecture.json', 'r')
	loaded_model_json = json_file.read()
	json_file.close()
	model = model_from_json(loaded_model_json)

	model.load_weights('yolo.h5')
	print(" *Model Loaded!")
	model.summary()



#YOLOv3
def correct_yolo_boxes(boxes, image_h, image_w, net_h, net_w):
	new_w, new_h = net_w, net_h
	for i in range(len(boxes)):
		x_offset, x_scale = (net_w - new_w)/2./net_w, float(new_w)/net_w
		y_offset, y_scale = (net_h - new_h)/2./net_h, float(new_h)/net_h
		boxes[i].xmin = int((boxes[i].xmin - x_offset) / x_scale * image_w)
		boxes[i].xmax = int((boxes[i].xmax - x_offset) / x_scale * image_w)
		boxes[i].ymin = int((boxes[i].ymin - y_offset) / y_scale * image_h)
		boxes[i].ymax = int((boxes[i].ymax - y_offset) / y_scale * image_h)

# YOLOv3 get all of the results above a threshold
def get_boxes(boxes, labels, thresh):
	v_boxes, v_labels, v_scores = list(), list(), list()
	# enumerate all boxes
	for box in boxes:
		# enumerate all possible labels
		for i in range(len(labels)):
			# check if the threshold for this label is high enough
			if box.classes[i] > thresh:
				v_boxes.append(box)
				v_labels.append(labels[i])
				v_scores.append(box.classes[i]*100)
				# don't break, many labels may trigger for one box
	return v_boxes, v_labels, v_scores



#YOLOv3 supress the boxes we aren't interested in
def do_nms(boxes, nms_thresh):
	if len(boxes) > 0:
		nb_class = len(boxes[0].classes)
	else:
		return
	for c in range(nb_class):
		sorted_indices = np.argsort([-box.classes[c] for box in boxes])
		for i in range(len(sorted_indices)):
			index_i = sorted_indices[i]
			if boxes[index_i].classes[c] == 0: continue
			for j in range(i+1, len(sorted_indices)):
				index_j = sorted_indices[j]
				if bbox_iou(boxes[index_i], boxes[index_j]) >= nms_thresh:
					boxes[index_j].classes[c] = 0

#YOLO HELPER FUNC
def bbox_iou(box1, box2):
	intersect_w = _interval_overlap([box1.xmin, box1.xmax], [box2.xmin, box2.xmax])
	intersect_h = _interval_overlap([box1.ymin, box1.ymax], [box2.ymin, box2.ymax])
	intersect = intersect_w * intersect_h
	w1, h1 = box1.xmax-box1.xmin, box1.ymax-box1.ymin
	w2, h2 = box2.xmax-box2.xmin, box2.ymax-box2.ymin
	union = w1*h1 + w2*h2 - intersect
	return float(intersect) / union

#YOLO HELPER FUNC
def _interval_overlap(interval_a, interval_b):
	x1, x2 = interval_a
	x3, x4 = interval_b
	if x3 < x1:
		if x4 < x1:
			return 0
		else:
			return min(x2,x4) - x1
	else:
		if x2 < x3:
			 return 0
		else:
			return min(x2,x4) - x3

#YOLOv3 DRAW
# draw all results
def draw_boxes(imfile, v_boxes, v_labels, v_scores):
	# load the image
	#data = pyplot.imread(filename)
	# plot the image
	image = img_to_array(imfile)

	for i in range(len(v_boxes)):
		box = v_boxes[i]
		y1, x1, y2, x2 = box.ymin, box.xmin, box.ymax, box.xmax
		width, height = x2 - x1, y2 - y1
		rect = Rectangle((x1, y1), width, height, fill=False, color='white')
		cv2.rectangle(image, (x1, y1), (x2, y2), (255, 0, 0), 3)
		label = "%s (%.3f)" % (v_labels[i], v_scores[i])
		cv2.putText(image, label, (x1+10, y1-25), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (200, 0, 255), 2)

	return image


#PRE-PROCESS IMAGE
def preprocess_image(image, target_size):
	width, height = image.size

	if image.mode != "RGB":
		image = image.convert("RGB")
	image = image.resize(target_size)
	#YOLO LINE

	image = img_to_array(image)
	image = np.expand_dims(image, axis=0)

	##FOR YOLO
	#Scale pixel values to [0, 1]
	image = image.astype('float32')
	image/=255.0
	#YOLO LINE
	return image, width, height

	#return image

print(" * Loading Keras Model...")
get_model()
graph = tf.get_default_graph()
#YOLO SPECIFIC ANCHORS
anchors = [[116,90, 156,198, 373,326], [30,61, 62,45, 59,119], [10,13, 16,30, 33,23]]

@app.route('/image', methods=['POST'])
def image():   

	if request.method == 'POST':
		global graph
		with graph.as_default():
			try:	
				#Grab json request and apply pre-processing.
				parse_req = request.get_json()
				encoded = parse_req['Uint8array']
				decoded = base64.b64decode(encoded)
				image = Image.open(io.BytesIO(decoded))
				processed_image, image_w, image_h = preprocess_image(image, target_size=(416, 416))

				#Begin predictions once pre-processed
				prediction = model.predict(processed_image)

				#Append boxes to empty boxes list.
				boxes = list()
				for i in range(len(prediction)):
					# decode the output of the network
					boxes += decode_netout(prediction[i][0], anchors[i], class_threshold, 416, 416)

				# correct the sizes of the bounding boxes for the shape of the image
				correct_yolo_boxes(boxes, image_h, image_w, 416, 416)
				# suppress non-maximal boxes
				do_nms(boxes, 0.5)

				# get the details of the detected objects
				v_boxes, v_labels, v_scores = get_boxes(boxes, labels, class_threshold)

				# draw what we found, if we've found anything.
				pred_image = draw_boxes(image, v_boxes, v_labels, v_scores)

				#We need to serialize our image so we can send it back to our application.
				#change it to array of uint8, then base64 encode it. 
				pred_image = Image.fromarray(pred_image.astype("uint8"))
				rawBytes = io.BytesIO()
				pred_image.save(rawBytes, "jpeg")
				rawBytes.seek(0)  # return to the start of the file
				pred_image = base64.b64encode(rawBytes.read())
				

				#Create our response object and return it.
				response = {
					'name':parse_req['name'],
					'size':parse_req['size'],
					'ext':'image/'+parse_req['ext'],
					'processed':'true',
					'prediction_image':pred_image,
					'prediction_labels':v_labels,
					'prediction_scores':v_scores
				}			
				return jsonify(response)

			#If any problems arise in our try, return a failed response.
			except Exception as e:
				print(e)
				return jsonify({
					'name':"",
					'size':0,
					'processed':'false',
				})

	#Will be the default if, for some reason we're not a POST request.
	response = {
			'name':"",
			'size':0,
			'processed':False
		}
	return jsonify(response)