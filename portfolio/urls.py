
from django.contrib import admin
from django.urls import path
from portfolio import views
from .views import contact_form_submit

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home_view, name='home'), 
    path('_header_nav', views.header_view, name='_header_nav'),
    path('acceuil', views.acceuil_view, name='acceuil'),
    path('home/', views.home_view, name='home'),
    path('about/', views.about_view, name='about'),
    path('projet/', views.projet_view, name='projet'),
    path('competence/', views.competence_view, name='competence'),
    path('contact/', views.contact_view, name='contact'),
    path('notify-cv-download/', views.notify_cv_download, name='notify_cv_download'),
    path('contact-submit/', views.contact_form_submit, name='contact_submit'),
    path('soumettre_projet/', views.soumettre_projet, name='soumettre_projet'),
]
