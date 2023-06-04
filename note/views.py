import json

from django.db.models import Q
from django.shortcuts import render, redirect
from django.http import JsonResponse
from user.models import User
from .models import Note, Folder


def check_login(func):
    def exec_(request, *args, **kwargs):
        if 'uname' not in request.session or 'uid' not in request.session:
            return redirect('user:login')
        return func(request, *args, **kwargs)

    return exec_


@check_login
def redirect_home(request):
    user = User.objects.get(id=request.session['uid'])
    folder = Folder.objects.get(user=user, is_source=True)
    return redirect('note:note_home', folder_id=folder.id)


@check_login
def home_view(request, folder_id):
    try:
        user = User.objects.get(id=request.session['uid'])
        notes = Note.objects.filter(user=user)
        folders = Folder.objects.filter(user=user)
        folder_id = folder_id
        cur_folder = Folder.objects.get(id=folder_id)
        if not cur_folder.is_exist or cur_folder.user != user:
            return redirect('user:login')
        if not cur_folder.is_source:
            parent_folder_id = cur_folder.parent_folder.id
    except:
        return redirect('user:login')
    return render(request, 'note/note_home.html', locals())


@check_login
def create_note_api(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode())
        try:
            user = User.objects.get(id=request.session['uid'])
            folder = Folder.objects.get(user=user, id=data['folder-id'])
            Note.objects.create(title=data['file-name'], user=user, folder=folder)
        except:
            return JsonResponse({"status": "error", "message": f"User does not exist"})
        return JsonResponse({"status": "ok", "message": f"created {data['file-name']}"})


@check_login
def create_folder_api(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode())
        try:
            user = User.objects.get(id=request.session['uid'])
            parent_folder = Folder.objects.get(user=user, id=data['parent-folder-id'])
            Folder.objects.create(title=data['folder-name'], user=user, parent_folder=parent_folder)
        except:
            return JsonResponse({"status": "error", "message": f"User does not exist"})
        return JsonResponse({"status": "ok", "message": f"created {data['folder-name']}"})


def update_item_api(func):
    @check_login
    def wrapper(request):
        if request.method == 'POST':
            data = json.loads(request.body.decode())
            try:
                user = User.objects.get(id=request.session['uid'])
                if data['type'] == 'folder':
                    folder = Folder.objects.get(user=user, id=data['id'])
                    func(folder, data)
                else:
                    file = Note.objects.get(user=user, id=data['id'])
                    func(file, data)
                return JsonResponse({"status": "ok", "message": f"{func.__name__} success"})
            except Exception as e:
                print(e)
                return JsonResponse({"status": "error", "message": 'Error'})

    return wrapper


@update_item_api
def delete_api(item, data):
    recursive_delete(item)


def recursive_delete(item):
    item.is_exist = False
    item.save()

    if isinstance(item, Folder) and item.subfolders:
        for sub_folder in item.subfolders.all():
            recursive_delete(sub_folder)
        files = Note.objects.filter(folder=item)
        for file in files:
            file.is_exist = False
            file.save()
            if file.folder.subfolders:
                for sub_folder in file.folder.subfolders.all():
                    recursive_delete(sub_folder)


@update_item_api
def rename_api(item, data):
    item.title = data['new-name']
    item.save()


@check_login
def md_editor_view(request, folder_id, note_id):
    if request.method == 'GET':
        try:
            user = User.objects.get(id=request.session['uid'])
            folder = Folder.objects.get(user=user, id=folder_id)
            source_folder = Folder.objects.get(user=user, is_source=True)
            note = Note.objects.get(id=note_id, user=user, folder=folder)
            if not folder.is_exist or not note.is_exist:
                return redirect('note:note_home', folder_id=source_folder.id)
            title = note.title
            content = note.content
            created_time = note.created_time
            updated_time = note.updated_time
            return render(request, 'note/editor.html', locals())
        except:
            return redirect('note:note_home', folder_id=folder_id)


def update_content_api(func):
    @check_login
    def wrapper(request):
        if request.method == 'POST':
            data = json.loads(request.body.decode())
            try:
                user = User.objects.get(id=request.session['uid'])
                folder = Folder.objects.get(id=data['folder-id'])
                file = Note.objects.get(user=user, id=data['id'], folder=folder)
                func(file, data['content'])
                return JsonResponse({"status": "ok", "message": f"{func.__name__} success"})
            except Exception as e:
                return JsonResponse({"status": "error", "message": 'Error'})

    return wrapper


@update_content_api
def modify_content_api(note, data):
    note.content = data
    note.save()
