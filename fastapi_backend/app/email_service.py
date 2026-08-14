"""Sends password reset codes by email via Gmail SMTP."""
import smtplib
import os
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_APP_PASSWORD = os.getenv("EMAIL_APP_PASSWORD")


def generate_code():
    """Return a 6-digit code as a string."""
    return str(random.randint(100000, 999999))


def send_reset_code(to_email: str, code: str):
    """Send the reset code to the given email address."""
    msg = MIMEMultipart()
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email
    msg["Subject"] = "PlantDoc Password Reset Code"

    body = (
        f"Your PlantDoc password reset code is:\n\n"
        f"    {code}\n\n"
        f"This code will expire in 10 minutes.\n"
        f"If you did not request this, please ignore this email."
    )
    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_APP_PASSWORD)
        server.send_message(msg)