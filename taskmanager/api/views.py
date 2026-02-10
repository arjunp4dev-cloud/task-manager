from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .models import Project, Task
from .serializers import RegisterSerializer, ProjectSerializer, TaskSerializer
from django.shortcuts import get_object_or_404

# -------- Register --------
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = []


# -------- Projects --------
class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)


# -------- Tasks --------
class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs['project_id']
        queryset = Task.objects.filter(
            project__id=project_id,
            project__user=self.request.user
        )

        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)

        sort = self.request.query_params.get('sort')
        if sort in ['due_date', 'created_at']:
            queryset = queryset.order_by(sort)

        return queryset

    # ✅ MUST BE INSIDE CLASS (same indentation as get_queryset)
    def perform_create(self, serializer):
        project_id = self.kwargs['project_id']

        project = get_object_or_404(
            Project,
            id=project_id,
            user=self.request.user
        )

        serializer.save(project=project)



class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(project__user=self.request.user)
