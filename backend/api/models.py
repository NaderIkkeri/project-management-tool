from django.db import models
from django.contrib.auth.models import AbstractUser

#
# Part 1: The Custom User Model
#
class User(AbstractUser):
    # We add a 'role' field to Django's built-in User model
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        MANAGER = 'MANAGER', 'Manager'
        DEVELOPER = 'DEVELOPER', 'Developer'

    # The 'base_role' is used to set a default role.
    # We'll set it to DEVELOPER by default.
    base_role = Role.DEVELOPER

    role = models.CharField(max_length=50, choices=Role.choices, default=base_role)

#
# Part 2: The Project Model
#
class Project(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    
    # A project can have many users (team members), 
    # and a user can be on many projects.
    team = models.ManyToManyField(User, related_name="projects")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

#
# Part 3: The Task Model
#
class Task(models.Model):
    class Status(models.TextChoices):
        TODO = 'TODO', 'To Do'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        DONE = 'DONE', 'Done'

    title = models.CharField(max_length=255)
    
    # A task belongs to one project. If the project is deleted,
    # delete the task too (CASCADE).
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
    
    # A task is assigned to one user. If the user is deleted,
    # set the assignee to null (SET_NULL).
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="tasks")
    
    status = models.CharField(max_length=50, choices=Status.choices, default=Status.TODO)
    deadline = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title