from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Category(models.Model):
    name = models.CharField(max_length=255)


class Institution(models.Model):
    TYPE_CHOICES = (
        (1, 'Fundacja'),
        (2, 'Organizacja pozarządowa'),
        (3, 'Zbiórka lokalna')
    )

    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    type = models.CharField(choices=TYPE_CHOICES, default=1)
    categories = models.ManyToManyField(Category)


class Donation(models.Model):
    quantity = models.IntegerField
    categories = models.ManyToManyField(Category)
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, null=True)
    address = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    city = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=10)
    pick_up_date = models.DateField
    pick_up_time = models.TimeField
    pick_up_comment = models.CharField(max_length=255)
    user = models.ForeignKey(User, null=True, on_delete=models.CASCADE)
