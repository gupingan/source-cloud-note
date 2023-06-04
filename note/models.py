from django.db import models
from user.models import User


class Note(models.Model):
    title = models.CharField('标题', max_length=100)
    content = models.TextField('内容')
    created_time = models.DateTimeField('创建时间', auto_now_add=True)
    updated_time = models.DateTimeField('更新时间', auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_exist = models.BooleanField('是否存在', default=True)
    folder = models.ForeignKey('Folder', on_delete=models.CASCADE, related_name='notes')  # 添加folder字段

    def __str__(self):
        return f'{self.id} - {self.title} - {self.content} - {self.created_time} - {self.updated_time}'


class Folder(models.Model):
    title = models.CharField('标题', max_length=100)
    parent_folder = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True,
                                      related_name='subfolders')
    user = models.ForeignKey(User, on_delete=models.CASCADE, default='')
    is_exist = models.BooleanField('是否存在', default=True)
    is_source = models.BooleanField('是否为根',default=False)
    created_time = models.DateTimeField('创建时间', auto_now_add=True)
    updated_time = models.DateTimeField('更新时间', auto_now=True)

    def __str__(self):
        return f'{self.id} - {self.title}'
