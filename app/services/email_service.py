import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import config

class EmailService:
    def send_summaries(self, recipients: dict, summaries: dict) -> int:
        """
        Sends emails and returns the count of successfully sent messages.
        Recipients format: { "SpeakerName": "email@example.com" }
        """
        if not all([config.SMTP_SERVER, config.SMTP_PORT, config.EMAIL_USER, config.EMAIL_PASSWORD]):
            raise ValueError("Email credentials not properly configured.")

        sent_count = 0
        try:
            server = smtplib.SMTP(config.SMTP_SERVER, config.SMTP_PORT)
            server.starttls()
            server.login(config.EMAIL_USER, config.EMAIL_PASSWORD)
            
            for name, email_addr in recipients.items():
                if email_addr and name in summaries:
                    msg = MIMEMultipart()
                    msg["From"] = f"MeetIntel <{config.EMAIL_USER}>"
                    msg["To"] = email_addr
                    msg["Subject"] = "Your Meeting Summary - MeetIntel"
                    
                    body = f"Hi {name},\n\nHere is your personalized summary from the recent meeting:\n\n{summaries[name]}\n\nBest regards,\nMeetIntel Assistant"
                    msg.attach(MIMEText(body, "plain"))
                    
                    server.send_message(msg)
                    sent_count += 1
                    
            server.quit()
        except Exception as e:
            raise RuntimeError(f"Failed to send emails: {str(e)}")

        return sent_count

email_service = EmailService()
