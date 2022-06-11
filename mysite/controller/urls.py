from . import views
from django.conf import settings
from django.conf.urls.static import static
from controller.views import command, controller
from django.urls import path

urlpatterns = [
    path('', controller),
    path('command/', command, name="command")
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)