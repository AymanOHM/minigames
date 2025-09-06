from django.shortcuts import render

# Create your views here.
def platformer(request):
    return render(request, 'simpleplatformer/platformer.html')