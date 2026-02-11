from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render


def home(request):
    return render(request, "frontend/login.html")


urlpatterns = [
    path("", home),  # Root shows login page
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
]
