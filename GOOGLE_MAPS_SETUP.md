# 🗺️ Google Maps API Setup Guide

## 📋 **Prerequisites**
- Google account
- Credit card (for billing, but Google provides free tier)

## 🚀 **Step-by-Step Setup**

### **1. Create Google Cloud Project**

1. **Visit Google Cloud Console**
   ```
   https://console.cloud.google.com/
   ```

2. **Create New Project**
   - Click project dropdown → "New Project"
   - Name: `MondoExplora Maps`
   - Click "Create"

### **2. Enable Required APIs**

Go to **APIs & Services** → **Library** and enable:

#### **Essential APIs:**
- ✅ **Maps JavaScript API** - For map display
- ✅ **Places API** - For autocomplete functionality
- ✅ **Geocoding API** - For address to coordinates conversion
- ✅ **Directions API** - For route drawing

#### **How to Enable:**
1. Search for each API name
2. Click on the API
3. Click "Enable" button
4. Repeat for all 4 APIs

### **3. Create API Key**

1. **Go to Credentials**
   - **APIs & Services** → **Credentials**

2. **Create API Key**
   - Click "Create Credentials" → "API Key"
   - Copy the generated key (starts with `AIzaSy...`)

### **4. Secure Your API Key**

#### **A. Application Restrictions**
1. Click on your API key to edit
2. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add domains:
     ```
     localhost:5000/*
     yourdomain.com/*
     *.yourdomain.com/*
     ```

#### **B. API Restrictions**
1. Under "API restrictions":
   - Select "Restrict key"
   - Choose only these APIs:
     - Maps JavaScript API
     - Places API
     - Geocoding API
     - Directions API

### **5. Set Up Environment Variables**

#### **Create `.env` file in project root:**
```env
# Google Maps API
GOOGLE_MAPS_API_KEY=your_actual_api_key_here

# Flask Configuration
FLASK_SECRET_KEY=your-secret-key-here
FLASK_ENV=development

# Database
DATABASE_URL=sqlite:///instance/mondoexplora.db
```

#### **Install python-dotenv:**
```bash
pip install python-dotenv
```

### **6. Update Your Application**

The application is already configured to use environment variables. Just:

1. **Create `.env` file** with your API key
2. **Restart the Flask server**
3. **Test the functionality**

## 🔧 **Configuration Files**

### **config.py** (Already created)
```python
GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY') or 'fallback-key'
```

### **Templates** (Already updated)
```html
<script src="https://maps.googleapis.com/maps/api/js?key={{ GOOGLE_MAPS_API_KEY }}&libraries=places"></script>
```

## 💰 **Pricing & Quotas**

### **Free Tier (Monthly):**
- **Maps JavaScript API**: 28,500 map loads
- **Places API**: 1,000 requests
- **Geocoding API**: 2,500 requests
- **Directions API**: 2,500 requests

### **Beyond Free Tier:**
- **Maps JavaScript API**: $7 per 1,000 loads
- **Places API**: $17 per 1,000 requests
- **Geocoding API**: $5 per 1,000 requests
- **Directions API**: $5 per 1,000 requests

## 🧪 **Testing Your Setup**

### **1. Test API Key**
```bash
curl "https://maps.googleapis.com/maps/api/geocode/json?address=Milan&key=YOUR_API_KEY"
```

### **2. Test in Browser**
1. Open `test_google_maps.html`
2. Try autocomplete functionality
3. Check browser console for errors

### **3. Test in Application**
1. Start Flask server
2. Login as content creator
3. Create new post
4. Test destination autocomplete

## 🚨 **Security Best Practices**

### **✅ DO:**
- Use environment variables
- Restrict API key to specific domains
- Enable only required APIs
- Monitor usage in Google Cloud Console
- Set up billing alerts

### **❌ DON'T:**
- Commit API keys to version control
- Use unrestricted API keys
- Enable unnecessary APIs
- Share API keys publicly

## 🔍 **Troubleshooting**

### **Common Issues:**

#### **1. "This API project is not authorized"**
- Enable the required APIs in Google Cloud Console

#### **2. "RefererNotAllowedMapError"**
- Add your domain to HTTP referrers in API key settings

#### **3. "Over_quota"**
- Check usage in Google Cloud Console
- Upgrade billing plan if needed

#### **4. "REQUEST_DENIED"**
- Verify API key is correct
- Check API restrictions

### **Debug Steps:**
1. Check browser console for errors
2. Verify API key in Google Cloud Console
3. Test API key with curl command
4. Check billing status

## 📞 **Support**

### **Google Cloud Support:**
- **Documentation**: https://developers.google.com/maps/documentation
- **Console**: https://console.cloud.google.com/
- **Billing**: https://console.cloud.google.com/billing

### **Application Issues:**
- Check Flask server logs
- Verify environment variables
- Test with `test_google_maps.html`

## 🎯 **Next Steps**

1. **Create your API key** following this guide
2. **Set up environment variables**
3. **Test the functionality**
4. **Monitor usage** in Google Cloud Console
5. **Set up billing alerts** for production

---

**🎉 Once you've completed these steps, your Google Maps integration will be fully functional with your own API key!** 