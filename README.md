# Splitwise‑Clone

A simple web app to track shared expenses, built with FastAPI (Python) and React + TailwindCSS. Perfect for organizing trips, events, or any group expenses.

---

## 🚀 Why This Project?

- **Real‑world features**:  
  - Create groups and add users  
  - Record expenses with equal or percentage splits  
  - View who owes whom and settle balances  
  - Expense history with payer & shares  

- **Clean architecture**:  
  - **Backend**: FastAPI + SQLAlchemy + PostgreSQL  
  - **Frontend**: React + Vite + TailwindCSS  

- **Uniqueness**: AI‑powered chatbot lets you ask questions in plain English (e.g. “Who paid the most?”).

---

## 🔧 Key Skills Demonstrated

- **API design**: CRUD endpoints, validation, CORS  
- **Database modeling**: many‑to‑many, enums, balance calculations  
- **Modern frontend**: component‑driven React, custom hooks, responsive UI  
- **DevOps basics**: Docker setup, localStorage persistence, CORS, environment variables  
<!-- - **Testing strategy**: pytest + TestClient + Testcontainers (backend), Vitest + MSW (frontend), Playwright (E2E)   -->
- **AI integration**: HuggingFace transformers pipeline for chat  


---

## ⚙️ Quick Start

1. **Clone & enter** 

   ```bash
   git clone https://github.com/arcc-hitt/Splitwise-Clone.git
   cd Splitwise-Clone

2. **Backend**

   ```bash
   cd backend
   python3.12 -m venv venv && source venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

   * API at [http://localhost:8000](http://localhost:8000)

3. **Frontend** (in new terminal)

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   * UI at [http://localhost:5173](http://localhost:5173)

4. **Try it out**

   * Create a group, add some users
   * Record a few expenses (equal / percentage)
   * View balances and expense history
   * Chat with the AI bot: “How much does user 1 owe in group group_name?”

---

## 📝 What I Learnt

* Building **RESTful APIs** with FastAPI
* Modeling **relational data** in Python
* State management & **custom hooks** in React
* Responsive styling with **TailwindCSS**
* Dockerizing multi-container apps
* Integrating **LLMs** into your product

---

## 📩 Let’s Connect

I built this project to show what I can do end-to-end. If you’re looking for someone who can design APIs, craft modern UIs, and bring in AI features—you’ve found them!

Feel free to reach out at [mahulearchit@gmail.com](mailto:mahulearchit@gmail.com) or check my [LinkedIn](https://www.linkedin.com/in/archit-mahule-10893124a/).

Thanks for reading!
