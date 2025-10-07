# 🚀 **Netlify Environment Variables Setup Guide**

## **✅ Current Status**
- ✅ **Tracking scripts are deployed and working!**
- ✅ **Google Tag Manager** is active with ID `GTM-TS2PHXNZ`
- ✅ **Fresh deployment triggered** (cache-busting completed)

## **🔧 Next Steps: Complete Environment Variables Setup**

### **1. Access Netlify Dashboard**
1. Go to [netlify.com](https://netlify.com)
2. Sign in to your account
3. Find your **MondoExplora** site
4. Click on **Site Settings**

### **2. Add Environment Variables**
Navigate to **Environment Variables** and add these variables:

```bash
# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Tag Manager
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Facebook Pixel
NEXT_PUBLIC_FB_PIXEL_ID=YOUR_PIXEL_ID

# Microsoft Clarity
NEXT_PUBLIC_CLARITY_ID=YOUR_CLARITY_ID
```

### **3. Get Your Actual Tracking IDs**

#### **Google Analytics 4:**
1. Go to [Google Analytics](https://analytics.google.com)
2. Select your property
3. Go to **Admin** → **Data Streams**
4. Copy the **Measurement ID** (starts with `G-`)

#### **Google Tag Manager:**
1. Go to [Google Tag Manager](https://tagmanager.google.com)
2. Select your container
3. Copy the **Container ID** (starts with `GTM-`)

#### **Facebook Pixel:**
1. Go to [Facebook Business Manager](https://business.facebook.com)
2. Navigate to **Events Manager**
3. Copy your **Pixel ID**

#### **Microsoft Clarity:**
1. Go to [Microsoft Clarity](https://clarity.microsoft.com)
2. Select your project
3. Copy the **Project ID**

### **4. Deploy After Adding Variables**
After adding the environment variables:
1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** → **Deploy site**
3. Wait for deployment to complete

### **5. Verify Tracking is Working**

#### **Check in Browser:**
1. Open your website
2. Open **Developer Tools** (F12)
3. Go to **Console** tab
4. Type: `window.dataLayer` and press Enter
5. You should see the dataLayer array

#### **Check Network Tab:**
1. Go to **Network** tab in Developer Tools
2. Refresh the page
3. Look for requests to:
   - `googletagmanager.com`
   - `google-analytics.com`
   - `facebook.com/tr`

### **6. Test Conversion Tracking**
1. Click on a hotel card
2. Check if conversion events are firing
3. Verify in Google Analytics Real-Time reports

## **🔍 Troubleshooting**

### **If tracking still doesn't work:**
1. **Clear browser cache** completely
2. **Check environment variables** are set correctly
3. **Verify deployment** completed successfully
4. **Check console errors** in browser developer tools

### **Common Issues:**
- **Environment variables not set**: Make sure they're added in Netlify
- **Cached deployment**: Force a new deployment
- **Wrong tracking IDs**: Double-check the IDs are correct
- **Ad blockers**: Test in incognito mode

## **📊 Expected Results**
After setup, you should see:
- ✅ Google Tag Manager loading
- ✅ Google Analytics tracking page views
- ✅ Facebook Pixel firing events
- ✅ Microsoft Clarity recording sessions
- ✅ Conversion tracking working on hotel clicks

---

**🎯 The tracking scripts are already deployed and working! You just need to add your actual tracking IDs as environment variables in Netlify.**
