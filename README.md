# 42 Transcendence Project

## 📖 Overview
**Transcendence** is a full-stack web application developed as part of the 42 curriculum. It features a real-time multiplayer **Pong** game, user interaction features, and social elements, all built using **Django**.

## 🛠️ Features
- 🎮 Real-time **Pong** game
- 👤 **User authentication** (login, registration, and profile management)
- 💬 **Chat system** for real-time communication
- 🤝 **Friend management** (add/remove friends)
- ⚔️ **Matchmaking** for online multiplayer games
- 📊 User stats and leaderboard

## ⚙️ Technologies Used
- **Backend:** Django, Django Channels (for WebSockets)
- **Frontend:** HTML, CSS, JavaScript
- **Database:** PostgreSQL
- **WebSockets:** For real-time gameplay and chat
- **Deployment:** Docker & Nginx

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd transcendence
   ```

2. **Set up the environment:**
   ```bash
   docker-compose up --build
   ```

3. **Apply migrations:**
   ```bash
   docker-compose exec web python manage.py migrate
   ```

4. **Create a superuser (optional):**
   ```bash
   docker-compose exec web python manage.py createsuperuser
   ```

5. **Access the app:**
   Open your browser and go to `http://localhost:8000`

## 📌 License
This project is part of the **École 42** curriculum and follows its academic guidelines.
