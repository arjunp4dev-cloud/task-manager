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
    path("", login_view, name="login_page"),
    path("login/", login_view, name="login_page"),
    path("register/", register_view, name="register_page"),
    path("projects/", projects_view, name="projects_page"),
    path("board/", board_view, name="board_page"),

    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
]

