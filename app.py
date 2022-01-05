from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from flask_socketio import SocketIO, emit
from flask_mqtt import Mqtt
import dialogflow_v2
import os
import json
from selenium import webdriver
from selenium.webdriver import Chrome
from selenium_stealth import stealth
from webdriver_manager.chrome import ChromeDriverManager
import re
import time

async_mode = None
app = Flask(__name__)

#dialogflow
app.secret_key = "Noodang-office-cloud"
# projectID = "smarthomerev2-fjjd"
projectID = "smarthome-project-09-2021-amjc"
sessionID = "NoodangSmarthome"
languageCode = "th_TH"
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = './apikey2.json'

#mqtt
app.config['MQTT_BROKER_URL'] = 'touch-mqtt.touch-ics.com'
app.config['MQTT_BROKER_PORT'] = 1883
mqtt = Mqtt(app)

# socketio = SocketIO(app)
socketio = SocketIO(app, async_mode=async_mode)


#selenium
options = webdriver.ChromeOptions()
options.add_argument("start-maximized")
options.add_argument("user-data-dir=D:\\RandD\\noodang\\noodang_rev6\\ChromeProflie") #Path to your chrome profile
options.add_experimental_option('useAutomationExtension', False)
options.add_experimental_option('excludeSwitches', ['enable-logging'])
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option('useAutomationExtension', False)

@app.route('/')
def Index():
    return render_template("index.html", async_mode=socketio.async_mode)

@app.route('/youtube', methods=['GET', 'POST'])
def Youtube():
    if request.method == 'GET':
        browser = webdriver.Chrome(options=options,executable_path= './chromedriver.exe')
        stealth(browser,
            languages=["en-US", "en"],
            vendor="Google Inc.",
            platform="Win32",
            webgl_vendor="Intel Inc.",
            renderer="Intel Iris OpenGL Engine",
            fix_hairline=True,
        )
        browser.get("https://www.youtube.com/watch?v=aHku2K9G89M") #https://www.youtube.com/watch?v=mZOj_954YQs
    
        browser.find_element_by_xpath("//*[@id='movie_player']/div[34]/div[2]/div[1]/button").click()
        #convert minute to second  
        length_str = browser.find_element_by_class_name("ytp-time-duration").text
        current_time_str = browser.find_element_by_class_name("ytp-time-current").text
        length = re.findall(r'\d+', length_str) 
        current_time = re.findall(r'\d+', current_time_str)
        length_sec = 60 * int(length[0]) + int(length[1])
        current_time_sec = (60 * int(current_time[0]) + int(current_time[1]))
        remaining_time = length_sec - current_time_sec

        print('current_time : '+current_time_str+'  length_time : '+length_str)
        print('remaining_time'+str(remaining_time))
        time.sleep(remaining_time)
        browser.quit()

        resp = jsonify({"message": "youtube"})
        resp.status_code = 200
        return resp  
    else:
        resp = jsonify({"message": "method not allowed"})
        resp.status_code = 404
        return resp

@app.route('/api', methods=['POST'])
def Chatbot():
    if request.method == "POST" :
        msg = request.values["message"]
        #session['msg'] = msg
        answer = detect_intent_texts(projectID, sessionID, msg, languageCode)
        resp = jsonify(answer)
        resp.status_code = 200
        return resp
    else:
        resp = jsonify({"message": "method not allowed"})
        resp.status_code = 404
        return resp


def detect_intent_texts (project_id, session_id, texts, language_code):
    try: 
        session_client = dialogflow_v2.SessionsClient()
        session = session_client.session_path(projectID, sessionID)
        text_input = dialogflow_v2.types.TextInput(text=texts, language_code=language_code)
        query_input = dialogflow_v2.types.QueryInput(text=text_input)
        response = session_client.detect_intent(session=session, query_input=query_input)
        result = response.query_result.fulfillment_text
        print('Fulfillment text: {}\n'.format(result))
        return result
    except Exception as e:
        print("error :  {0}".format(e))
        return "Sorry Can not access"

#mqtt
@mqtt.on_message()
def handle_message(client, userdata, message):
    datas = dict(
        topic=message.topic,
        payload=json.loads(message.payload),
        qos=message.qos,
    )
    #print(datas["topic"])
    socketio.emit('mqtt_message', data=datas)

@mqtt.on_connect()
def handle_connect(client, userdata, flags, rc):
    # mqtt.subscribe('touchHeadOffice/sensor/00101')
    mqtt.subscribe('python/mqtt')
    print("Connected from broker")

@mqtt.on_disconnect()
def handle_disconnect(client, userdata, rc):
    print("Disconnected from broker")

#socketio
@socketio.on('publish')
def handle_publish(topic, message, qos):
    mqtt.publish(topic, message, qos)

@socketio.on('subscribe')
def handle_subscribe(topic, qos):
    mqtt.subscribe(topic, qos)

if __name__ == '__main__':
    #app.run(host='0.0.0.0', port=4500, debug=False, use_reloader=False)
    # app.run(host='127.0.0.1', port=4500, debug=False, use_reloader=False)
    socketio.run(app, host='127.0.0.1', port=4000,use_reloader=False, debug=False)