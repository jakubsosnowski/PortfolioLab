from django.shortcuts import render, redirect
from django.views import View
from django.core.paginator import Paginator
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.mixins import LoginRequiredMixin

from .models import Donation, Institution, Category
from django.contrib.auth.models import User


class LandingPage(View):
    def get(self, request):
        donations = Donation.objects.all().count
        fundations = Institution.objects.all().count

        fundations_all = Institution.objects.all().filter(type=1).order_by('id')
        fundations_paginator = Paginator(fundations_all, 3)
        fundations_page_number = request.GET.get('fundations_page')
        fundations_page_obj = fundations_paginator.get_page(fundations_page_number)

        organizations_all = Institution.objects.all().filter(type=2).order_by('id')
        organizations_paginator = Paginator(organizations_all, 3)
        organizations_page_number = request.GET.get('organizations_page')
        organizations_page_obj = organizations_paginator.get_page(organizations_page_number)

        collections_all = Institution.objects.all().filter(type=3).order_by('id')
        collections_paginator = Paginator(collections_all, 3)
        collections_page_number = request.GET.get('collections_page')
        collections_page_obj = collections_paginator.get_page(collections_page_number)
        return render(request, 'index.html', {'donations': donations,
                                              'fundations': fundations, 'fundations_page_obj': fundations_page_obj
                                              , 'fundations_all': fundations_all,
                                              'organizations_page_obj': organizations_page_obj, 'organizations_all': organizations_all,
                                              'collections_all': collections_all, 'collections_page_obj': collections_page_obj})


class AddDonation(LoginRequiredMixin, View):
    def get(self, request):
        categories = Category.objects.all()
        organizations = Institution.objects.all()
        return render(request, 'form.html', {'categories': categories, 'organizations': organizations})

    def post(self, request):
        categories = request.POST.getlist('categories')
        bags = request.POST.get('bags')
        organization = request.POST.get('organization')
        address = request.POST.get('address')
        city = request.POST.get('city')
        postcode = request.POST.get('postcode')
        phone = request.POST.get('phone')
        data = request.POST.get('data')
        time = request.POST.get('time')
        more_info = request.POST.get('more_info')
        user = request.user

        donation = Donation.objects.create(
            quantity=bags,
            institution_id=organization,
            address=address,
            phone_number=phone,
            city=city,
            zip_code=postcode,
            pick_up_date=data,
            pick_up_time=time,
            pick_up_comment=more_info,
            user=user
        )
        donation.categories.set(categories)
        donation.save()

        return render(request, 'form-confirmation.html')


class Login(View):
    def get(self, request):
        return render(request, 'login.html')

    def post(self,request):
        email = request.POST.get('email')
        password = request.POST.get('password')

        if not email or not password:
            message = 'Wszystkie pola musza być uzupełnione'
            return render(request, 'login.html', {'message': message})

        user = authenticate(username=email, password=password)

        if user is not None:
            login(request, user)
            return redirect('landing_page')
        else:
            message = 'Niepoprawny login bądź hasło'
            return render(request, 'login.html', {'message': message})

class Register(View):
    def get(self, request):
        return render(request, 'register.html')

    def post(self, request):
        name = request.POST.get('name')
        surname = request.POST.get('surname')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password2 = request.POST.get('password2')

        if not name or not surname or not email or not password2 or not password:
            message = 'Wszystkie pola musza być uzupełnione'
            return render(request, 'register.html', {'message': message})

        if password != password2:
            message = 'Hasła muszą być takie same'
            return render(request, 'register.html', {'message': message})

        user_exists = User.objects.filter(username=email).exists()

        if user_exists:
            message = 'Użytkownik o podanym mailu jest już zarejestrowany w naszym serwisie'
            return render(request, 'register.html', {'message': message})

        user = User.objects.create_user(username=email, password=password)
        user.first_name = name
        user.last_name = surname
        user.email = email
        user.save()

        messages.success(request, 'Konto zostało pomyślnie utworzone')
        return redirect('login')


class LogoutView(View):
    def get(self, request):
        logout(request)
        return redirect('landing_page')


class ProfilView(LoginRequiredMixin, View):
    def get(self, request):
        current_user = request.user
        donations = Donation.objects.filter(user=current_user.id)
        return render(request, 'profil.html', {'current_user': current_user, 'donations': donations })

