# Minigames Django Project

Welcome to the **Minigames Django Project**! This is a collection of simple web-based games built using Django, designed for fun, learning, and easy extensibility. Each game is a standalone Django app, making it easy to add new games or modify existing ones.

## 🎮 Included Minigames

- **Simple Chess**: Play a basic version of chess against another player.
- **Simple FPS**: Experience a minimal first-person shooter game in your browser.
- **Simple Platformer**: Jump and run through a classic platformer level.

## 🚀 Features

- Modular Django architecture: Each game is a separate app.
- Clean and modern UI for each minigame.
- Easy to add new games.

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd minigames
   ```
2. **Create a virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. **Install dependencies**
   ```bash
   pip install django
   ```
4. **Apply migrations**
   ```bash
   python manage.py migrate
   ```
5. **Run the development server**
   ```bash
   python manage.py runserver
   ```
6. **Access the games**
   - Home: [http://localhost:8000/](http://localhost:8000/)
   - Simple Chess: [http://localhost:8000/simplechess/](http://localhost:8000/simplechess/)
   - Simple FPS: [http://localhost:8000/simplefps/](http://localhost:8000/simplefps/)
   - Simple Platformer: [http://localhost:8000/simpleplatformer/](http://localhost:8000/simpleplatformer/)

## 📁 Folder Structure

```
minigames/
├── minigames/           # Main Django project settings
├── simplechess/         # Chess game app
├── simplefps/           # FPS game app
├── simpleplatformer/    # Platformer game app
├── templates/           # HTML templates for all games
├── db.sqlite3           # SQLite database
└── manage.py            # Django management script
```

## 🤝 Contributing

Contributions are welcome! To add a new game:
1. Create a new Django app: `python manage.py startapp newgame`
2. Add your app to `INSTALLED_APPS` in `settings.py`.
3. Create your models, views, templates, and URLs.
4. Submit a pull request!

## 📄 License

This project is licensed under the MIT License.

---

Enjoy playing and building minigames with Django!
