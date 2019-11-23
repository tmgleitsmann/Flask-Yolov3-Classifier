import os
os.environ['KERAS_BACKEND'] = 'tensorflow'
os.environ['CUDA_VISIBLE_DEVICES'] = '0'
import base64
import numpy as np

#may not need. 
import io
import sys
import colorsys
from PIL import Image
import keras
from keras import backend as K
from keras.models import Sequential, load_model, model_from_json
from keras.layers import Input

from flask import Flask
from flask import jsonify
from flask import request
from flask_cors import CORS

from model import yolo_eval, yolo_body, tiny_yolo_body
from utils import image_preporcess

import tensorflow as tf
from tensorflow.python.client import device_lib

# from matplotlib import pyplot
# from matplotlib.patches import Rectangle
import cv2
#import tempfile


app = Flask(__name__)
CORS(app)

class YOLO():

	@classmethod
	def get_defaults(cls, n):
		if n in cls.defaults:
			return cls._defaults[n]
		else:
			return "unrecognized attribute name '"+n+"'"

	def __init__(self, **kwargs):
		self.model_path = 'model_data/yolo.h5'
		self.anchors_path = 'model_data/yolo_anchors.txt'
		self.json_path = 'model_data/yolo_v3_model_architecture.json'
		self.classes_path = 'model_data/classes.txt'
		self.model_image_size = (416, 416)
		self.text_size = 1
		self.iou = 0.5
		self.score = 0.7
		self.class_names = self._get_classes()
		self.anchors = self._get_anchors()
		self.sess = K.get_session()
		self.boxes, self.scores, self.classes = self.generate()

	def _get_classes(self):
		classes_path = os.path.expanduser(self.classes_path)
		with open(classes_path) as f:
			class_names = f.readlines()
		class_names = [c.strip() for c in class_names]
		return class_names

	def _get_anchors(self):
		#anchors_path = 'tiny_yolo_anchors.txt'
		# anchors_path = 'yolo_anchors.txt'
		with open(self.anchors_path) as f:
			anchors = f.readline()
		anchors = [float(x) for x in anchors.split(',')]
		return np.array(anchors).reshape(-1, 2)

	def generate(self):
		model_path = self.model_path
		#assert self.model_path.endswith('.h5') #model must be a h5 file

		#load model/construct model & load weights
		num_anchors = len(self.anchors)
		num_classes = len(self.class_names)
		print(num_classes)
		is_tiny_version = num_anchors==6 #checking to see if yolov3-tiny
		try:
			json_file = open(self.json_path, 'r')
			loaded_model_json = json_file.read()
			json_file.close()
			model = model_from_json(loaded_model_json)
			model.load_weights(model_path)
			self.yolo_model = model
			
		except:
			assert self.yolo_model.layers[-1].output_shape[-1] == \
				num_anchors/len(self.yolo_model.output)*(num_classes +5), \
				'Mismatch between model and given anchor & class sizes'

		#Generate colors for drawing bounding boxes.
		hsv_tuples = [(x / len(self.class_names), 1., 1.)
			for x in range(len(self.class_names))]
		self.colors = list(map(lambda x: colorsys.hsv_to_rgb(*x), hsv_tuples))
		self.colors = list(
			map(lambda x: (int(x[0] * 255), int(x[1]*255), int(x[2]*255)), self.colors))

		np.random.shuffle(self.colors) #shuffling colors to decorrelate classes

		#Generate output tensor targets for filtered bounding boxes.
		self.input_image_shape = K.placeholder(shape=(2, ))
		boxes, scores, classes = yolo_eval(self.yolo_model.output, self.anchors,
			len(self.class_names), self.input_image_shape, score_threshold=self.score,
			iou_threshold=self.iou)

		return boxes, scores, classes

	def detect_image(self, image):
		print(self.model_image_size, ' : self.model_image_size')
		if self.model_image_size != (None, None):
			assert self.model_image_size[0]%32 == 0, 'Multiples of 32 required'
			assert self.model_image_size[1]%32 == 0, 'Multiples of 32 required'
			boxed_image = image_preporcess(np.copy(image), tuple(reversed(self.model_image_size)))
			image_data = boxed_image

 		
		#prediction = self.yolo_model.predict(image_data, 416,416)
		#CODE IS BREAKING HERE...
		print(self.boxes, self.scores, self.classes)
		print(self.input_image_shape)
		print(image.shape)
		out_boxes, out_scores, out_classes = self.sess.run([self.boxes, self.scores, self.classes],
			feed_dict={
				self.yolo_model.input: image_data,
				self.input_image_shape: [image.shape[0], image.shape[1]]
			})

		thickness = (image.shape[0] + image.shape[1] // 600)
		fontScale = 1
		ObjectsList = []

		for i, c in reversed(list(enumerate(out_classes))):
			predicted_class = self.class_names[c]
			box = out_boxes[i]
			score = out_scores[i]
			label = '{} {:.2f}'.format(predicted_class, score)
			scores = '{:.2f}'.format(score)

			top, left, bottom, right = box
			top = max(0, np.floor(top+0.5).astype('int32'))
			left = max(0, np.floor(left+0.5).astype('int32'))
			bottom = min(image.shape[0], np.floor(bottom+0.5).astype('int32'))
			right = min(image.shape[1], np.floor(right + 0.5).astype('int32'))

			# We probs won't need mid_h mid_v. We'll leave for now though.
			mid_h = (bottom-top)/2+top
			mid_v = (right-left)/2+left

			#put object rectangle
			cv2.rectangle(image, (left, top), (right, bottom), self.colors[c], 3)#thickness is 3 for now
			#get text size and put text
			#(test_width, text_height), baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, thickness/self.text_size, 1)
			#cv2.rectangle(image, (left, top), (left+test_width, top-text_height-baseline), self.colors[c], thickness=cv2.FILLED)
			cv2.putText(image, label, (left, top-2), cv2.FONT_HERSHEY_SIMPLEX, .8, (0, 0, 0), 2)
			ObjectsList.append([top, left, bottom, right, mid_v, mid_h, label, scores])

		return image, ObjectsList

	def close_session(self):
		self.sess.close()
	def open_session(self):
		self.sess = K.get_session()

	def detect_img(self, image):
		self.open_session()
		r_image, ObjectsList = self.detect_image(image)

		return r_image, ObjectsList



#print(device_lib.list_local_devices())
K.tensorflow_backend._get_available_gpus()
print(" * Loading Keras Model...")
#get_model()
K.clear_session()
graph = tf.get_default_graph()
print('grabbing yolo model')
yolo = YOLO()
print('grabbed')



@app.route('/image', methods=['POST'])
def image():
	response = {
		'name':"",
		'size':0,
		'processed':False
	}

	global graph
	with graph.as_default():
		try:
			parse_req = request.get_json()
			decoded = base64.b64decode(parse_req['Uint8array'])
			image = np.fromstring(decoded, np.uint8)
			image = cv2.imdecode(image, cv2.IMREAD_COLOR)
			image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
			r_image, ObjectsList = yolo.detect_img(image)

			#Serialize and b64 encode our pic to send back.
			r_image = Image.fromarray(r_image.astype("uint8"))
			rawBytes = io.BytesIO()
			r_image.save(rawBytes, "jpeg")
			rawBytes.seek(0)  # return to the start of the file
			r_image = base64.b64encode(rawBytes.read())
			#Create our response object and return it.
			response = {
				'name':'modified-'+parse_req['name'],
				'size':sys.getsizeof(rawBytes),
				'ext':'image/jpeg',
				'processed':'true',
				'prediction_image':r_image,
			}			

		except Exception as e:
			print(e)
			print('some error occured')
			return jsonify({
				'name':"",
				'size':0,
				'processed':'false',
			})

	return jsonify(response)




@app.route('/video', methods=['POST'])
def video():

	response = {
		'name':"",
		'size':0,
		'processed':False
	}

	#Try Except with our video loop
	global graph
	with graph.as_default():
		try:
			print('inside try')
			#Grab our request object and decode it.
			parse_req = request.get_json()
			decoded = base64.b64decode(parse_req['Uint8array'])
			print('grabbed decoded')

			#We need to write this decoded video so opencv can read it properly.
			with open(parse_req['name'], 'wb') as wfile:
				wfile.write(decoded)

			print('writing attribs')
			#Build video capture object and grab video properties.
			cap = cv2.VideoCapture(parse_req['name'])
			fps = cap.get(cv2.CAP_PROP_FPS)
			width = int(cap.get(3))
			height = int(cap.get(4))
			print('writing videowriter obj')
			#if we want to sample, that will go here. Leaving out for now.
			fourcc = cv2.VideoWriter_fourcc(*'mp4v')
			out = cv2.VideoWriter('modified-'+parse_req['name'], fourcc, fps, (width, height))
			print('wrote the videowriter object')

			while True:
				success, frame = cap.read()
				if success:
					print(type(frame), 'frame type')
					#we'll pre-process, predict and draw here
					frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
					r_image, ObjectsList = yolo.detect_img(frame)
					# for i in range(len(ObjectsList)):
					# 	print(ObjectsList[i])
					print('detected frame')
					frame = cv2.cvtColor(r_image, cv2.COLOR_RGB2BGR)
					out.write(frame.astype(np.uint8))
					
				else:
					break

			#Release cap and out capture/writer objects.
			cap.release()
			out.release()
			#Remove the file we had to write in the beginning
			print('cleanup original file')
			os.remove(parse_req['name'])
			#read the modified video as bytes so we can base64 encode it. setting data so we can use in our response object
			with open('modified-'+parse_req['name'], "rb") as videoFile:
				data = videoFile.read()
				print(len(data), 'length at end')
				encoded_data = base64.b64encode(data)


			#Create our response object and return it.
			response['name'] = 'modified-'+parse_req['name']
			response['size'] = os.path.getsize('modified-'+parse_req['name'])
			response['ext'] = 'video/mp4'
			response['prediction_video'] = encoded_data
			response['processed'] = True

			#Remove the modified video file we wrote and destory any cv2 windows
			cv2.destroyAllWindows()
			print('cleanup modified file')
			os.remove('modified-'+parse_req['name'])

		except Exception as e:
			return jsonify(response)

	return jsonify(response)