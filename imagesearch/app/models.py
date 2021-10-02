from os import name
from django.db import models

# Create your models here.
class sampletb(models.Model):
    name = models.CharField(max_length=15,default="image")
    image = models.FileField(upload_to='static/media')
