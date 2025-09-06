from django.shortcuts import render

# Create your views here.
def fps(request):
    return render(request, 'simplefps/fps.html')