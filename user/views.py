import json
import random
import re

from django.contrib.auth.hashers import check_password, make_password
from django.shortcuts import render, redirect
from django.http import JsonResponse
from note.models import Folder
from .models import User


def reg_view(request):
    if request.method == 'GET':
        return render(request, 'user/register.html')
    elif request.method == 'POST':
        post_msg = request.POST
        username = post_msg.get('username')
        password1 = post_msg.get('password1')
        password2 = post_msg.get('password2')
        username_status, password1_status, password2_status = have_reg_value(password1, password2, username)
        if (username_status, password1_status, password2_status) == ('', '', ''):
            if get_double_pwd(password1, password2):
                if len(password1) >= 8:
                    if validate_username(username):
                        if not is_username_exist(username):
                            register_status = '注册成功，请前往登录'
                            User.objects.create(username=username, password=make_password(password2))
                            Folder.objects.create(title='main', is_source=True,
                                                  user=User.objects.get(username=username))  # 注册时创建根目录
                        else:
                            register_status = '用户名已存在，请更换'
                    else:
                        register_status = '用户名只能含字母|数字|下划线'
                else:
                    password1_status = '所设密码至少8位'
            else:
                password2_status = '两次密码不一致'
        return render(request, 'user/register.html', locals())


def login_view(request):
    # 如果之前有用户登录成功，则重定向到主页
    if 'uname' in request.session and 'uid' in request.session:
        user = User.objects.filter(id=request.session['uid'])
        if user:
            source_folder = Folder.objects.filter(user=user[0], is_source=True)
            if source_folder:
                return redirect('note:note_home', folder_id=source_folder[0].id)
    return render(request, 'user/login.html')


def get_double_pwd(password1, password2):
    if password1 == password2:
        return True
    else:
        return False


def validate_username(username):
    pattern = r'^[a-zA-Z0-9_]+$'
    return bool(re.match(pattern, username))


def is_username_exist(username):
    return User.objects.filter(username=username)


def have_reg_value(password1, password2, username):
    username_status, password1_status, password2_status = '', '', ''
    if not username:
        username_status = '请填写用户名'
    if not password1:
        password1_status = '请填写密码'
    elif not password2:
        password2_status = '请再次输入相同密码'
    return username_status, password1_status, password2_status


def captcha_api(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode())
        max_offset_width = data['max-offset-width']
        uname = data['uname']
        offset_width = int(random.uniform(0.5, 1) * max_offset_width)
        try:
            user = User.objects.get(username=uname)
            user.captcha = offset_width
            user.save()
        except:
            login_status = '获取验证码失败，请先去注册'
            return JsonResponse({'status': 'error', 'message': login_status})
        return JsonResponse({
            'status': 'ok',
            'data': {
                'offset-width': offset_width,
            },
        })
    return JsonResponse({
        'status': 'ok',
        'data': 'This is get response'
    })


def login_api(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode())
        try:
            user = User.objects.get(username=data['uname'])
            if user.captcha - 10 <= data['captcha'] <= user.captcha + 10:
                if check_password(data['upwd'], user.password):
                    request.session['uname'] = user.username
                    request.session['uid'] = user.id
                    user = User.objects.filter(id=request.session['uid'])
                    if user:
                        source_folder = Folder.objects.filter(user=user[0], is_source=True)
                        if source_folder:
                            return JsonResponse({'status': 'ok', 'message': str(source_folder[0].id)})
                else:
                    return JsonResponse({'status': 'error', 'message': '登录失败，用户名或者密码有误'})
            else:
                return JsonResponse({'status': 'error', 'message': '验证码不合法'})
        except:
            return JsonResponse({'status': 'error', 'message': '登录失败，用户名或者密码有误'})
    else:
        return JsonResponse({'status': 'error', 'message': 'This is get response'})


def logout_api(request):
    if request.method == 'POST':
        if 'uname' not in request.session or 'uid' not in request.session:
            return JsonResponse({'status': 'error', 'message': '用户已退出登录'})
        del request.session['uname']
        del request.session['uid']
        return JsonResponse({'status': 'ok', 'message': 'logout success'})
    else:
        return JsonResponse({'status': 'error', 'message': 'This is get response'})
