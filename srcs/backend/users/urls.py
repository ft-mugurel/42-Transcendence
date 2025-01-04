from django.urls import path
from .views import RegisterView, LoginView, LogoutView, CSRFTokenView, UserProfileView, RefreshTokenView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('get-csrf-token/', CSRFTokenView.as_view(), name='get-csrf-token'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('refresh/', RefreshTokenView.as_view(), name='refresh-token'),
]
