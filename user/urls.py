from django.urls import path
from . import views

app_name = 'user'

urlpatterns = [
    path('reg/', views.reg_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('api/call_captcha', views.captcha_api, name='call_captcha'),
    path('api/login', views.login_api, name='call_login'),
    path('api/logout', views.logout_api, name='call_logout'),
]
