from django.shortcuts import render
import json
from django.http import HttpResponseBadRequest, JsonResponse
from django.shortcuts import get_object_or_404, render
import controller.utils.mqttClient as mqttClient
from .models import Mapping


def controller(request):
    return render(request, 'controller/controller.html')

def command(request):

    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if is_ajax:

        if request.method == 'POST':
            data = json.load(request)
            command = data.get('command')
            mqttClient.publish_command(command)
            return JsonResponse({'status': 'command sent.'})

        return JsonResponse({'status': 'Invalid request'}, status=400)
    else:
        return HttpResponseBadRequest('Invalid request')


def set_mapping(request):
    
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if is_ajax:

        if request.method == 'POST':
            data = json.load(request)
            name = data.get('name')
            yaw_axis = data.get('yaw_axis')
            throttle_axis = data.get('throttle_axis')
            roll_axis = data.get('roll_axis')
            pitch_axis = data.get('pitch_axis')

            mapping = Mapping(controller_name = name, yaw_axis = yaw_axis, throttle_axis = throttle_axis, roll_axis = roll_axis, pitch_axis = pitch_axis)
            mapping.save()

            return JsonResponse({'status': 'command sent.'})
        
        return JsonResponse({'status': 'Invalid request'}, status=400)
    else:
        return HttpResponseBadRequest('Invalid request')


def get_mapping(request, name):

    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if is_ajax:
        if request.method == 'GET':

            try:
                response = Mapping.objects.get(controller_name=name)
                return JsonResponse({'status': 'mapping found', 'data': response.toJson()});
            except Mapping.DoesNotExist:
                return JsonResponse({'status': 'mapping not found.', 'data': None})
    
        return JsonResponse({'status': 'Invalid request'}, status=400)
    else:
        return HttpResponseBadRequest('Invalid request')
