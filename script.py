import numpy as np
import tensorflow as tf
import keras
import pickle
import sys
from keras.preprocessing.sequence import pad_sequences

# load model, tokenizer & input
model = keras.models.load_model("<path>")
with open('<path>', 'rb') as handle:
    token = pickle.load(handle)
sentences = [] 
sentences.append(sys.argv[1])

def make_prediction(pred_sentences):
    true_label = []
    
    tf_outputs = model(tf.convert_to_tensor(pred_sentences))
    tf_predictions = tf.nn.softmax(tf_outputs[0], axis=-1)
    label = tf.argmax(tf_predictions,None)
    label = np.array(label)
    true_label.append(label)
    
    # only 1 sentence at a time, for sure
    if true_label[0] == 0:
        return "negative"
    if true_label[0] == 1:
        return "positive"
    
   
pred_sentences = token.texts_to_sequences(sentences)
pred_sentences = pad_sequences(pred_sentences, maxlen=20)
print(make_prediction(pred_sentences), end="")