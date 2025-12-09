import requests
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_POST
from django.core.mail import send_mail
import json
from django.shortcuts import redirect
from django.contrib import messages
from django.shortcuts import render
from django.conf import settings # Importation correcte de settings

# --- Vues de rendu (inchangées) ---

def home_view(request):
    #return HttpResponse ("Hello world !")
    return render(request,'home.html')

def header_view(request):
    return render(request,'_header_nav.html')

def acceuil_view(request):
    return render(request,'acceuil.html')

def competence_view(request):
    return render (request,'competence.html') 

def about_view(request):
    return render(request,'about.html') 

def projet_view(request):
    return render (request,'projet.html') 

def contact_view(request):
    return render (request,'Contact.html')

# --- Fonctions de soumission de formulaires (MODIFIÉES) ---

# Fonction pour notifier le téléchargement du CV
@require_POST
def notify_cv_download(request):
    email = request.POST.get('email')
    
    # Utilisez une adresse e-mail de destinataire fixe (votre adresse professionnelle)
    recipient_list = [settings.RECIPIENT_EMAIL] if hasattr(settings, 'RECIPIENT_EMAIL') else ['orpheengouessi0810@gmail.com']

    try:
        # 1. Utilisez settings.DEFAULT_FROM_EMAIL comme expéditeur (Email du serveur)
        # 2. L'email du client est inclus dans le corps du message
        email_body = f"Quelqu'un a téléchargé votre CV sur votre portfolio. Email du téléchargeur : {email}"
        
        send_mail(
            'Notification de Téléchargement de CV',
            email_body,
            settings.DEFAULT_FROM_EMAIL, # 🟢 BONNE PRATIQUE: Utiliser l'email authentifié du serveur
            recipient_list, # Destinataire(s)
            fail_silently=False,
        )
        return JsonResponse({'status': 'success', 'message': 'Notification envoyée'})
    except Exception as e:
        print(f"Erreur d'envoi d'email: {e}")
        return JsonResponse({'status': 'error', 'message': 'Erreur lors de l\'envoi de la notification'}, status=500)


# Fonction pour gérer le formulaire de contact
# Dans views.py

@require_POST
def contact_form_submit(request):
    name = request.POST.get('name')
    email = request.POST.get('email')
    message = request.POST.get('message')

    if not name or not email or not message:
        # Ceci devrait être l'erreur affichée si des champs sont vides
        return JsonResponse({'status': 'error', 'message': 'Données manquantes'}, status=400)
    
    # Destinataire: Utilise RECIPIENT_EMAIL de settings.py
    recipient_list = [settings.RECIPIENT_EMAIL] if hasattr(settings, 'RECIPIENT_EMAIL') else ['orpheengouessi0810@gmail.com']


    try:
        email_body = f"Nom: {name}\nEmail: {email}\n\nMessage:\n{message}"
        
        send_mail(
            f'Nouveau message de contact : {name}',
            email_body,
            settings.DEFAULT_FROM_EMAIL, # Expéditeur authentifié du serveur
            recipient_list, # Destinataire(s)
            fail_silently=False,
        )
        return JsonResponse({'status': 'success', 'message': 'Message envoyé avec succès'}, status=200) # Assurez-vous d'avoir le statut 200
    
    except Exception as e:
        print(f"Erreur d'envoi d'email (Formulaire Contact): {e}")
        # Ceci est l'erreur qui devrait apparaître dans votre terminal
        return JsonResponse({'status': 'error', 'message': 'Erreur serveur lors de l\'envoi'}, status=500)
    
# Fonction pour soumettre le projet (modale)
@require_POST
# @csrf_exempt
def soumettre_projet(request):
    """
    Traite la soumission du formulaire de projet (modale) et envoie un e-mail.
    """
    
    # 1. Récupération des données du formulaire POST
    try:
        name = request.POST.get('name')
        email = request.POST.get('email')
        project_type = request.POST.get('project_type')
        project_budget = request.POST.get('project_budget')
        project_duration = request.POST.get('project_duration')
        message = request.POST.get('message')

    except Exception:
        return JsonResponse({'status': 'error', 'message': 'Données de formulaire manquantes ou invalides.'}, status=400)

    # 2. Validation simple des données
    if not all([name, email, project_type, project_budget, project_duration, message]):
        return JsonResponse({'status': 'error', 'message': 'Veuillez remplir tous les champs obligatoires.'}, status=400)

    # 3. Construction du contenu de l'e-mail
    subject = f"Nouveau Projet: {project_type} de {name}"
    
    email_body = f"""
-- DÉTAILS DU NOUVEAU PROJET --

Nom du client: {name}
Email du client: {email}

Type de Projet: {project_type}

Budget Estimé: {project_budget}
Durée Estimée: {project_duration}

--- Message du Client ---
{message}
"""
    # Utiliser une adresse e-mail de destinataire fixe
    recipient_list = [settings.RECIPIENT_EMAIL] if hasattr(settings, 'RECIPIENT_EMAIL') else ['orpheengouessi0810@gmail.com']

    # 4. Envoi de l'e-mail
    try:
        send_mail(
            subject,
            email_body,
            settings.DEFAULT_FROM_EMAIL, # Expéditeur authentifié
            recipient_list,          # Destinataire(s)
            fail_silently=False,
        )
        return JsonResponse({'status': 'success', 'message': 'Demande envoyée avec succès.'}, status=200)

    except Exception as e:
        print(f"Erreur lors de l'envoi de l'e-mail: {e}")
        return JsonResponse({'status': 'error', 'message': 'Erreur serveur lors de l\'envoi de l\'e-mail.'}, status=500)