from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse


def home(request):
    is_login = False
    if 'uid' in request.session and 'uname' in request.session:
        is_login = True
    return render(request, 'home.html', locals())
