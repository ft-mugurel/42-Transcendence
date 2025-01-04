import jwt
from datetime import datetime, timedelta
from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import CustomUser
from .serializers import CustomUserSerializer
from rest_framework import status, generics
from django.middleware.csrf import get_token
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication


class CSRFTokenView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        csrf_token = get_token(request)  # Django CSRF token'ı oluştur
        response = Response({'csrfToken': csrf_token})
        response.set_cookie('csrftoken', csrf_token, httponly=True, secure=True, samesite='None')
        response.headers["Acces-Control-Allow-Origin"] = 'https://localhost'
        response.headers["Acces-Control-Allow-Credentials"] = 'true'
        return response

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        csrf_token = request.COOKIES.get('csrftoken')  # CSRF token çerezden alınıyor
        if not csrf_token:
            return Response({'error': 'CSRF token missing'}, status=403)
        
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User registered successfully'}, status=201)
        return Response(serializer.errors, status=400)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Please provide both username and password'}, status=400)

        user = CustomUser.objects.filter(username=username).first()
        if user is None or not user.check_password(password):
            raise AuthenticationFailed("Invalid credentials")

        # JWT Token oluşturma
        access_payload = {
            'id': user.id,
            'exp': datetime.utcnow() + timedelta(minutes=15),
        }
        access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm='HS256')

        refresh_payload = {
            'id': user.id,
            'exp': datetime.utcnow() + timedelta(days=7),
        }
        refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm='HS256')

        response = Response({
            'access': access_token,  # Access token response'da döndürülüyor
            'message': 'Login successful'
        })

        response.set_cookie(
            key='refresh',
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite='None'
        )
        return response

class LogoutView(APIView):
    def post(self, request):
        response = Response()
        response.delete_cookie('jwt')  # Çerezi sil
        response.data = {
            'message': 'Logged out successfully'
        }
        return response

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user = request.user
        serializer = CustomUserSerializer(user)
        return Response(serializer.data)

class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh')

        if not refresh_token:
            return Response({'error': 'Refresh token not found'}, status=400)

        try:
            payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Refresh token expired'}, status=401)

        # Yeni access token oluştur
        new_access_payload = {
            'id': payload['id'],
            'exp': datetime.utcnow() + timedelta(minutes=15),
        }
        new_access_token = jwt.encode(new_access_payload, settings.SECRET_KEY, algorithm='HS256')

        return Response({
            'access': new_access_token
        })



