from keras.models import load_model

model = load_model('yolo.h5')

model.summary()

# serialize model to JSON
model_json = model.to_json()
with open("yolo_v3_model_architecture.json", "w") as json_file:
    json_file.write(model_json)

