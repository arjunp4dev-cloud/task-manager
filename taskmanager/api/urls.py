from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView,
    ProjectListCreateView,
    ProjectDetailView,
    TaskListCreateView,
    TaskDetailView
)
from django.http import JsonResponse


def api_home(request):
    return JsonResponse({"message": "API Root Working"})


urlpatterns = [
    path("", api_home),

    path('register/', RegisterView.as_view()),
    path('login/', TokenObtainPairView.as_view()),
    path('refresh/', TokenRefreshView.as_view()),

    path('projects/', ProjectListCreateView.as_view()),
    path('projects/<int:pk>/', ProjectDetailView.as_view()),

    path('projects/<int:project_id>/tasks/', TaskListCreateView.as_view()),
    path('tasks/<int:pk>/', TaskDetailView.as_view()),
]
