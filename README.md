SkillForge – AI-Driven Adaptive Learning & Exam Generator

SkillForge is an AI-powered e-learning platform that personalizes learning paths and auto-generates quizzes based on student performance.

Features

User Roles: Student, Instructor, Admin

Authentication: JWT-based login & role-based dashboards

Course Management: Add/edit/delete courses, topics, materials (videos, PDFs, links)

Adaptive Learning: Personalized content suggestions, difficulty-adjusted quizzes

AI-Generated Quizzes: GPT-powered question creation (MCQ & short answer)

Analytics: Topic-wise performance, skill progression, instructor insights

Tech Stack

Frontend: Angular 19, Angular Material, Chart.js

Backend: Node.js (Express), JWT Auth, REST APIs

Database: MySQL with Sequelize ORM

AI: OpenAI GPT API

Database Schema (Sample)
CREATE TABLE users(id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), email VARCHAR(100), password VARCHAR(255), role ENUM('STUDENT','INSTRUCTOR','ADMIN'));
CREATE TABLE courses(id BIGINT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(100), instructor_id BIGINT, difficulty_level ENUM('BEGINNER','INTERMEDIATE','ADVANCED'), FOREIGN KEY(instructor_id) REFERENCES users(id));
CREATE TABLE quizzes(id BIGINT AUTO_INCREMENT PRIMARY KEY, course_id BIGINT, title VARCHAR(100), generated_by_ai BOOLEAN, FOREIGN KEY(course_id) REFERENCES courses(id));
CREATE TABLE questions(id BIGINT AUTO_INCREMENT PRIMARY KEY, quiz_id BIGINT, question_text TEXT, options JSON, correct_answer VARCHAR(100), FOREIGN KEY(quiz_id) REFERENCES quizzes(id));
CREATE TABLE quiz_attempts(id BIGINT AUTO_INCREMENT PRIMARY KEY, quiz_id BIGINT, student_id BIGINT, score DECIMAL(5,2), attempt_time DATETIME, FOREIGN KEY(quiz_id) REFERENCES quizzes(id), FOREIGN KEY(student_id) REFERENCES users(id));
Setup
git clone <repo-url>
cd backend && npm install && npm start
cd frontend && npm install && ng serve

App runs at: http://localhost:4200
