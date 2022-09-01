"""
Python script representing a MQTT client that publish commands to the broker when publish_command() method is called.
"""
import paho.mqtt.client as mqtt
import json
import sys

BROKER_ADDRESS = "127.0.0.1"
#BROKER_ADDRESS = "34.221.60.243"
PUB_TOPIC = "mqtt/commands"
MQTT_PORT = 1883

client = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connection successful.")
        print("Waiting for messages...")
    else:
        print("Connection failed with returned code: ", rc)

def on_publish(client, userdata, mid):
    print("message published.")

#publish message to the broker
def publish_command(cmd):
    cmd_string = json.dumps(cmd)
    print("sending command: " + cmd_string)
    client.publish(PUB_TOPIC, payload=cmd_string)

def start_client(BROKER_ADDRESS):
    client.on_connect = on_connect
    client.on_publish = on_publish

    try:
        client.connect(BROKER_ADDRESS, MQTT_PORT)
    except ConnectionRefusedError:
        print("connection refused.");
        sys.exit()

    # Calling loop_start() once, before or after connect*(), runs a thread 
    # in the background to call loop() automatically. This frees up 
    # the main thread for other work that may be blocking. 
    client.loop_start()

start_client(BROKER_ADDRESS)
