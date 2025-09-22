# Email Setup for synchro.solutions Domain

This guide shows you how to set up email sending from your custom domain `synchro.solutions`.

## 🎯 **Option 1: Use landy@synchro.solutions (Recommended)**

### **Step 1: Set up Gmail for your domain**
1. **Google Workspace** (Recommended):
   - Go to [Google Workspace](https://workspace.google.com/)
   - Set up your domain `synchro.solutions`
   - Create email `landy@synchro.solutions`
   - Cost: ~$6/month per user

2. **Alternative - Gmail with custom domain**:
   - Use Gmail's "Send mail as" feature
   - Add `landy@synchro.solutions` as a send-as address

### **Step 2: Generate App Password**
1. Go to your Google Account settings
2. Security → 2-Step Verification (enable if not already)
3. Security → App passwords
4. Generate password for "Mail"
5. Save this password (you'll need it for Firebase)

### **Step 3: Configure Firebase Functions**
```bash
# Set your email credentials
firebase functions:config:set email.user="landy@synchro.solutions"
firebase functions:config:set email.password="your-16-character-app-password"

# Deploy the functions
firebase deploy --only functions
```

---

## 🎯 **Option 2: Create noreply@synchro.solutions**

### **Step 1: Create noreply email**
1. In your email provider (Google Workspace, etc.)
2. Create `noreply@synchro.solutions`
3. Set up forwarding to your main email if needed

### **Step 2: Update Firebase Functions**
```bash
# Set noreply email credentials
firebase functions:config:set email.user="noreply@synchro.solutions"
firebase functions:config:set email.password="your-app-password"
```

---

## 🎯 **Option 3: Use Professional Email Service (Best for Production)**

### **SendGrid (Recommended)**
```bash
# Install SendGrid
cd functions
npm install @sendgrid/mail

# Set SendGrid API key
firebase functions:config:set sendgrid.api_key="your-sendgrid-api-key"
```

### **Mailgun**
```bash
# Install Mailgun
cd functions
npm install mailgun-js

# Set Mailgun credentials
firebase functions:config:set mailgun.api_key="your-mailgun-api-key"
firebase functions:config:set mailgun.domain="mg.synchro.solutions"
```

---

## 🚀 **Quick Setup Commands**

### **For landy@synchro.solutions:**
```bash
# 1. Set email credentials
firebase functions:config:set email.user="landy@synchro.solutions"
firebase functions:config:set email.password="your-app-password"

# 2. Deploy functions
firebase deploy --only functions

# 3. Test by creating an invitation or task assignment
```

### **For noreply@synchro.solutions:**
```bash
# 1. Set email credentials
firebase functions:config:set email.user="noreply@synchro.solutions"
firebase functions:config:set email.password="your-app-password"

# 2. Deploy functions
firebase deploy --only functions
```

---

## 📧 **Email Templates Preview**

Your emails will now be sent from:
- **From**: "Synchro Team" <landy@synchro.solutions>
- **Reply-To**: landy@synchro.solutions (or noreply@synchro.solutions)

### **Sample Email Headers:**
```
From: Synchro Team <landy@synchro.solutions>
To: user@example.com
Subject: You've been invited to join "My Project" project
```

---

## 🔧 **Testing Your Setup**

### **1. Test in Development:**
- Check browser console for: `📧 [MOCK] Invitation email would be sent from landy@synchro.solutions:`
- View mock emails in the EmailNotifications component

### **2. Test in Production:**
- Deploy functions with your credentials
- Create an invitation or assign a task
- Check the recipient's inbox

### **3. Verify Email Delivery:**
- Check spam folder
- Verify sender reputation
- Test with different email providers (Gmail, Outlook, etc.)

---

## 🛠️ **Troubleshooting**

### **Common Issues:**

1. **"Invalid login" error:**
   - Use App Password, not regular password
   - Ensure 2FA is enabled

2. **"Authentication failed":**
   - Check email address spelling
   - Verify domain is properly configured

3. **Emails going to spam:**
   - Set up SPF, DKIM, and DMARC records
   - Use a professional email service like SendGrid

### **Domain Authentication (Advanced):**
Add these DNS records to improve deliverability:

```
# SPF Record
TXT @ "v=spf1 include:_spf.google.com ~all"

# DKIM Record (from Google Workspace)
TXT google._domainkey "v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY"

# DMARC Record
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:landy@synchro.solutions"
```

---

## 💡 **Recommendations**

### **For Development:**
- Use `landy@synchro.solutions` for testing
- Keep mock email service for local development

### **For Production:**
- Use `noreply@synchro.solutions` for automated emails
- Consider SendGrid or Mailgun for better deliverability
- Set up proper DNS records for authentication

### **Cost Comparison:**
- **Google Workspace**: ~$6/month
- **SendGrid**: Free tier (100 emails/day), then $15/month
- **Mailgun**: Free tier (5,000 emails/month), then $35/month

---

## 🎉 **Ready to Go!**

Once you've set up your email credentials and deployed the functions, your Synchro application will send professional emails from your domain!

**Next Steps:**
1. Choose your email setup option
2. Configure credentials
3. Deploy functions
4. Test email delivery
5. Monitor email logs in Firebase Console
