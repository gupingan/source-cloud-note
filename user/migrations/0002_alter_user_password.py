# Generated by Django 4.2.1 on 2023-06-04 08:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='password',
            field=models.CharField(max_length=256, verbose_name='密码'),
        ),
    ]