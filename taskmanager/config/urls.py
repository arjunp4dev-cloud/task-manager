from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def home(request):
    return JsonResponse({"message": "Task Manager API Running"})


urlpatterns = [
    path("", home),                     # Root → /
    path("admin/", admin.site.urls),    # Admin panel
    path("api/", include("api.urls")),  # API routes
]
