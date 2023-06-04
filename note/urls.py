from django.urls import path
from . import views

app_name = 'note'

urlpatterns = [
    path('page/', views.redirect_home, name='re_home'),
    path('page/<int:folder_id>/', views.home_view, name='note_home'),
    path('page/<int:folder_id>/md/<int:note_id>/', views.md_editor_view, name='md_editor'),
    path('api/create_note', views.create_note_api, name='create_note'),
    path('api/create_folder', views.create_folder_api, name='create_folder'),
    path('api/delete', views.delete_api, name='api_delete'),
    path('api/rename', views.rename_api, name='api_rename'),
    path('api/content/modify', views.modify_content_api, name='api_modify_content'),
]
