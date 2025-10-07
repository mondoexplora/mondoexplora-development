# 🎯 **Google Ads Conversion Testing Guide**

## **✅ What We've Implemented**

### **1. Conversion Tracking Functions**
- ✅ **`trackHotelBooking()`** - Fires when users click affiliate links
- ✅ **`trackHotelView()`** - Fires when users view hotel details
- ✅ **Google Ads Conversion Events** - Properly configured with your conversion IDs

### **2. Integration Points**
- ✅ **Hotel Card Clicks** - Both card clicks and "View Deal" buttons
- ✅ **Affiliate Link Opens** - Tracks before opening new tab
- ✅ **Multiple Tracking Platforms** - Google Ads, Analytics, Facebook Pixel

---

## **🔍 How to Test Google Ads Conversion Tracking**

### **Method 1: Google Tag Assistant (Recommended)**

1. **Install Google Tag Assistant Extension**
   - Go to [Chrome Web Store](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
   - Install the extension

2. **Test on Your Live Site**
   - Go to your website: `https://mondoexplora.com`
   - Click the Tag Assistant extension icon
   - Click "Connect" to open the debugger

3. **Trigger Conversion Events**
   - Click on any hotel card
   - Click "View Deal" button
   - Watch the Tag Assistant debugger

4. **What to Look For**
   - **Event Name**: `conversion` or `purchase`
   - **Google Ads Conversion**: Should show your conversion ID
   - **Value**: Should show the hotel price
   - **Transaction ID**: Should be unique for each click

### **Method 2: Browser Developer Tools**

1. **Open Developer Tools**
   - Press `F12` or right-click → "Inspect"
   - Go to **Console** tab

2. **Check Data Layer**
   ```javascript
   // Type this in console to see data layer events
   window.dataLayer
   ```

3. **Check Google Analytics Events**
   ```javascript
   // Check if gtag is loaded
   window.gtag
   
   // Check for conversion events
   window.dataLayer.filter(item => item.event === 'conversion')
   ```

4. **Monitor Network Tab**
   - Go to **Network** tab
   - Click on a hotel card
   - Look for requests to:
     - `google-analytics.com/g/collect`
     - `googletagmanager.com/gtm.js`

### **Method 3: Google Ads Conversion Report**

1. **Wait for Data**
   - Conversions can take 15-30 minutes to appear
   - Some may take up to 3 hours

2. **Check Google Ads Dashboard**
   - Go to [Google Ads](https://ads.google.com)
   - Navigate to **Tools & Settings** → **Conversions**
   - Look for your conversion action
   - Check the "Conversions" column

3. **Real-time Verification**
   - Go to **Reports** → **Predefined reports** → **Basic** → **Conversions**
   - Set date range to "Today"
   - Look for conversion data

---

## **🎯 Expected Conversion Events**

### **When User Clicks Hotel Card:**
```javascript
// Google Analytics Purchase Event
gtag('event', 'purchase', {
  transaction_id: 'booking_1234567890',
  value: 299,
  currency: 'USD',
  items: [{
    item_id: 'luxury_hotel_name',
    item_name: 'Luxury Hotel Name',
    category: 'Luxury Hotels',
    quantity: 1,
    price: 299
  }]
});

// Google Ads Conversion Event
gtag('event', 'conversion', {
  send_to: 'AW-XXXXXXXXX/YYYYYYYYYY/ZZZZZZZZZZ',
  value: 299,
  currency: 'USD',
  transaction_id: 'booking_1234567890'
});
```

### **Data Layer Events:**
```javascript
// Should appear in window.dataLayer
{
  event: 'hotel_booking',
  value: 299,
  currency: 'USD'
}
```

---

## **🚨 Troubleshooting**

### **If Conversions Don't Fire:**

1. **Check Environment Variables**
   - Verify these are set in Netlify:
     - `NEXT_PUBLIC_GOOGLE_ADS_ACCOUNT_ID`
     - `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID`
     - `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL`

2. **Check Console Errors**
   - Open browser console
   - Look for JavaScript errors
   - Check if tracking scripts are loaded

3. **Verify GTM Configuration**
   - Check Google Tag Manager
   - Ensure conversion tags are set up
   - Verify triggers are configured

4. **Test in Incognito Mode**
   - Ad blockers can interfere with tracking
   - Test in private/incognito window

### **Common Issues:**

- **Ad Blocker**: Disable ad blockers for testing
- **Environment Variables**: Ensure they're set correctly in Netlify
- **GTM Setup**: Verify Google Tag Manager is configured
- **Conversion IDs**: Double-check your Google Ads conversion IDs

---

## **📊 Success Indicators**

### **✅ Conversion Tracking is Working When:**
- Tag Assistant shows `conversion` events
- Google Ads dashboard shows conversion data
- Network tab shows requests to Google Analytics
- Console shows no JavaScript errors
- Data layer contains conversion events

### **🎯 Expected Results:**
- **Immediate**: Tag Assistant shows events
- **15-30 minutes**: Google Analytics shows conversions
- **1-3 hours**: Google Ads shows conversion data
- **24 hours**: Full conversion reporting available

---

**🚀 Your conversion tracking is now properly implemented and should fire on every affiliate link click!**
