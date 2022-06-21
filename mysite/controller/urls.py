from . import views
from django.conf import settings
from django.conf.urls.static import static
from controller.views import command, controller, set_mapping, get_mapping
from django.urls import path

urlpatterns = [
    path('', controller),
    path('command/', command, name="command"),
    path('mapping/', set_mapping, name="set_mapping"),
    path('mapping/<str:name>', get_mapping, name="get_mapping")
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)