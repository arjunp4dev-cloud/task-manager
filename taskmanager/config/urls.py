from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render


def login_view(request):
    return render(request, "frontend/login.html")

def register_view(request):
    return render(request, "frontend/register.html")

def projects_view(request):
    return render(request, "frontend/projects.html")

def board_view(request):
    return render(request, "frontend/board.html")


urlpatterns = [
    path("", login_view),
    path("register/", register_view),
    path("projects/", projects_view),
    path("board/", board_view),

    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
]
