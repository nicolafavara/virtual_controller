from django.db import models
import json

# Table containing mapping of calibrated controllers
class Mapping(models.Model):
    controller_name = models.CharField(max_length=255);
    yaw_axis = models.IntegerField();
    roll_axis = models.IntegerField();
    throttle_axis = models.IntegerField();
    pitch_axis = models.IntegerField();

    def __str__(self):
        return self.controller_name

    def toJson(self):
        return json.dumps(self, default=lambda o: o.__dict__)
