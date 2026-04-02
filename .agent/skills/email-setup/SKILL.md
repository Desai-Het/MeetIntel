---
name: Email Setup Service
description: Guidance for setting up a Python/Flask-based email sending service using Google SMTP and App Passwords, allowing external users to receive emails.
---

# Email Setup Service Skill

This skill provides step-by-step guidance for an AI to set up an email service in a Python (Flask) project. The service allows the application to send emails to outside users on behalf of the application owner (the service provider).

## 1. Prerequisites for the User (Google Account Setup)

Before implementing the code, the user (who will be the email provider) must configure their Google account to allow the application to send emails securely.

**Instructions for the User:**
1. Go to your Google Account settings (https://myaccount.google.com/).
2. Navigate to the **Security** tab.
3. Under "How you sign in to Google", turn on **2-Step Verification** (if not already enabled).
4. Once 2-Step Verification is on, search for **App Passwords** in the Google Account settings search bar.
5. Create a new App Password (you can name it something like `Flask Email App` or your project name).
6. Copy the generated 16-character password. Treat this like your real password and do not share it.

## 2. Environment Variables (.env setup)

Instruct the user to create or update their `.env` file with the following variables. Explain that they must never hardcode these values in the application code to prevent sensitive information from being leaked.

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_character_app_password
```
*(Remind the user to load these environment variables in their app using `python-dotenv`.)*

## 3. Python Implementation Guidance

When writing the Python code to integrate this feature, follow these steps:

1. **Imports**: Ensure the necessary built-in and external modules are imported:
   ```python
   import os
   import smtplib
   from email.mime.text import MIMEText
   from email.mime.multipart import MIMEMultipart
   from flask import jsonify, request
   ```

2. **Fetching Environment Variables**: Load the credentials safely and sanitize them (especially removing any spaces from the App Password):
   ```python
   smtp_server = os.getenv("SMTP_SERVER")
   smtp_port = os.getenv("SMTP_PORT")
   email_user = os.getenv("EMAIL_USER")
   email_password_raw = os.getenv("EMAIL_PASSWORD", "")
   
   # Sanitize password (remove spaces from App Password if any)
   email_password = email_password_raw.replace(" ", "")
   ```

3. **Sending the Email**:
   Implement the SMTP connection using `starttls()`. Construct the email content using `MIMEMultipart` and `MIMEText`. Loop through the recipient details, attaching the content and sending the emails securely.
   
   ```python
   # Example backend route implementation
   @app.route("/send-emails", methods=["POST"])
   def send_emails():
       recipients = request.json.get("recipients", {}) # Example: { "User Name": "email@example.com" }
       
       # ... [Fetch Env Vars Here] ...
   
       if not all([smtp_server, smtp_port, email_user, email_password]):
           return jsonify({"error": "Email credentials not properly configured."}), 500
   
       try:
           server = smtplib.SMTP(smtp_server, int(smtp_port))
           server.starttls()
           server.login(email_user, email_password)
           
           sent_count = 0
           for name, email_addr in recipients.items():
               if email_addr:
                   msg = MIMEMultipart()
                   msg["From"] = f"Your App Name <{email_user}>"
                   msg["To"] = email_addr
                   msg["Subject"] = "Your Subject Here"
                   
                   body = f"Hello {name},\n\nYour automated message here."
                   msg.attach(MIMEText(body, "plain"))
                   
                   server.send_message(msg)
                   sent_count += 1
                   
           server.quit()
           return jsonify({"success": True, "message": f"Successfully sent {sent_count} emails."})
       except Exception as e:
           return jsonify({"error": f"Failed to send emails: {str(e)}"}), 500
   ```

## 4. UI/Frontend Integration

To complete the setup, guide the AI to create frontend logic where external users can enter their email addresses along with any other needed data. 
- Use JavaScript `fetch` to send a POST request to the Python backend with the collected email addresses.
- Display visual feedback to the user (e.g., "Sending..." states, success messages, or error alerts based on the server's response).

## Purpose

Use this skill whenever you are tasked with adding an email notification or delivery service where the application acts as the sender for its outside users. It ensures that security best practices and Google App Passwords are top of mind.
