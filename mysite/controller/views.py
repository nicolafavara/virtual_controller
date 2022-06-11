from django.shortcuts import render
import json
from django.http import HttpResponseBadRequest, JsonResponse
from django.shortcuts import get_object_or_404, render
import controller.utils.mqttClient as mqttClient


def controller(request):
    return render(request, 'controller/controller.html')

def command(request):
    # request.is_ajax() is deprecated since django 3.1
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