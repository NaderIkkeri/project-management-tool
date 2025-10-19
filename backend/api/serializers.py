from rest_framework import serializers
from .models import User, Project, Task
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['role'] = user.role
        token['id'] = user.id
        # ...

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Add user data to the response
        data['username'] = self.user.username
        data['role'] = self.user.role
        data['id'] = self.user.id

        return data
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # We list fields explicitly to avoid exposing sensitive data
        fields = ['id', 'username', 'role', 'first_name', 'last_name', 'email']

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'  # This means "include all fields from the model"

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'  # This also includes all fields