# EmailJS Setup Instructions

## Step 1: Update Environment Variables

Open the `.env` file in the root directory and replace the placeholder values with your actual EmailJS credentials:

```env
# EmailJS Configuration
EXPO_PUBLIC_EMAILJS_SERVICE_ID=your_actual_service_id
EXPO_PUBLIC_EMAILJS_TEMPLATE_ID=your_actual_template_id
EXPO_PUBLIC_EMAILJS_PUBLIC_KEY=your_actual_public_key
```

## Step 2: EmailJS Template Setup

Make sure your EmailJS template includes these variables:

- `{{user_name}}` - The sender's name
- `{{user_email}}` - The sender's email
- `{{message}}` - The message content

Example template:

```
New Contact Form Submission

From: {{user_name}}
Email: {{user_email}}

Message:
{{message}}
```

## Step 3: Restart the Development Server

After updating the `.env` file, restart your Expo development server:

```bash
npm start
```

## Testing

1. Navigate to Profile > Contact Us
2. Fill in the form fields
3. Click "Send Message"
4. You should see a success alert if the email was sent successfully

## Troubleshooting

- Make sure all three environment variables are set correctly
- Check that your EmailJS service is active
- Verify your public key has the correct permissions
- Check the console for any error messages
