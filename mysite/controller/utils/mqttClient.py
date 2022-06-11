"""
Python script representing a MQTT client that publish commands to the broker when publish_command() method is called.
"""
import paho.mqtt.client as mqtt
import json
import sys

Broker = "127.0.0.1"
pub_topic = "mqtt/commands"

client = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    print("connected with result code "  + str(rc))

def on_publish(client, userdata, mid):
    print("message published.")

#publish message 
def publish_command(cmd):
    cmd_string = json.dumps(cmd)
    print("sending command: " + cmd_string)
    client.publish(pub_topic, payload=cmd_string)

client = mqtt.Client()
client.on_connect = on_connect
client.on_publish = on_publish

try:
    client.connect(Broker, 1883, 60)
except ConnectionRefusedError:
    print("connection refused.");
    sys.exit()

# Calling loop_start() once, before or after connect*(), runs a thread 
# in the background to call loop() automatically. This frees up 
# the main thread for other work that may be blocking. 
client.loop_start()