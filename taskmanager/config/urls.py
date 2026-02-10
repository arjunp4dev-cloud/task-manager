from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),

    # Frontend Pages
    path("", TemplateView.as_view(template_name="frontend/login.html")),
    path("login.html", TemplateView.as_view(template_name="frontend/login.html")),
    path("register.html", TemplateView.as_view(template_name="frontend/register.html")),
    path("projects.html", TemplateView.as_view(template_name="frontend/projects.html")),
    path("board.html", TemplateView.as_view(template_name="frontend/board.html")),
]
