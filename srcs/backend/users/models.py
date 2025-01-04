from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class CustomUser(AbstractUser):
    name = models.CharField(max_length=20, default='John Doe')
    email = models.EmailField(max_length=255, unique=True)
    username = models.CharField(max_length=150, unique=True)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)
    is_uploadpp = models.BooleanField(default=False)

    # groups ve user_permissions alanlarına related_name ekliyoruz
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='customuser_set',  # Ters ilişki adı
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='customuser_permissions_set',  # Ters ilişki adı
        blank=True
    )