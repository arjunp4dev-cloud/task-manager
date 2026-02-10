from django.http import JsonResponse

def home(request):
    return JsonResponse({"message": "Task Manager API Running"})

urlpatterns = [
    path("", home),
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
]
