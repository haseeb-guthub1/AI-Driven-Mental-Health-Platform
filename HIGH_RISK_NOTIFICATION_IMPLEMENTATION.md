# High-Risk User Notification & Coach Selection Implementation

## Overview
Implemented a mandatory coach assignment system for users with risk assessment > 60%.

---

## 🎯 Features Implemented

### 1. **High-Risk Notification Modal** (`HighRiskNotification.tsx`)
- **Trigger**: Automatically shows when user's risk score > 60%
- **Features**:
  - Cannot be dismissed (mandatory)
  - Shows current risk score vs 60% threshold
  - Clear description: "Professional Support Required"
  - Single action button: "Connect with a Professional Coach Now"
  - Professional, empathetic design
  - Blurs dashboard in background

### 2. **Coach Selection Page** (`SelectCoach.tsx`)
- **Route**: `/dashboard/select-coach`
- **Features**:
  - Displays **only approved coaches** (`is_approved: true`)
  - Shows coach details:
    - Full name
    - Specialization
    - License ID
    - Years of experience
    - Bio/description
    - Verified badge
  - Beautiful card-based UI with selection states
  - Confirmation button: "Confirm Selection & Continue"
  - Error handling and loading states

### 3. **Updated Routing** (`App.tsx`)
- Added new route: `/dashboard/select-coach`
- Accessible from the notification modal

### 4. **Updated Dashboard Wrapper** (`ProtectedDashboardWrapper.tsx`)
- Checks if user's risk > 60%
- Shows notification if no coach assigned
- Blurs dashboard until coach is selected
- Automatically re-checks after coach assignment

---

## 📋 How It Works

```
1. User logs in with high risk (>60%)
   ↓
2. ProtectedDashboardWrapper checks risk score
   ↓
3. Shows HighRiskNotification modal (cannot dismiss)
   ↓
4. User clicks "Connect with Professional Coach"
   ↓
5. Navigates to /dashboard/select-coach page
   ↓
6. User selects from approved coaches
   ↓
7. Clicks "Confirm Selection & Continue"
   ↓
8. Coach is assigned via API
   ↓
9. Dashboard unlocks and user can access all features
```

---

## 🔒 Security & UX Features

✅ **Cannot dismiss notification** - User must select a coach  
✅ **Dashboard blurred** - Prevents interaction until coach selected  
✅ **Only approved coaches shown** - Filtered server-side  
✅ **Confidentiality notice** - HIPAA compliance message  
✅ **Visual risk indicators** - Clear percentage display  
✅ **Responsive design** - Works on all devices  
✅ **Loading states** - Clear feedback during operations  
✅ **Error handling** - Graceful failures with messages  

---

## 📁 Files Created/Modified

### New Files:
1. `frontend/src/components/HighRiskNotification.tsx`
2. `frontend/src/pages/SelectCoach.tsx`
3. `frontend/src/pages/SelectCoach.css`

### Modified Files:
1. `frontend/src/App.tsx` - Added route
2. `frontend/src/components/ProtectedDashboardWrapper.tsx` - Updated logic

---

## 🧪 Testing

### Test Credentials (High-Risk User):
```
Email: alex.johnson@test.com
Password: Alex2026!
Risk Score: 90% (triggers notification)
```

### Test Flow:
1. Login with Alex Johnson
2. Should see notification immediately
3. Click "Connect with Professional Coach Now"
4. Redirected to coach selection page
5. Select any approved coach
6. Click "Confirm Selection & Continue"
7. Dashboard unlocks

---

## 🎨 UI/UX Design Highlights

### Notification Modal:
- **Color Scheme**: Red/Orange gradient (alerts user to urgency)
- **Icon**: Pulsing AlertTriangle
- **Typography**: Clear hierarchy, large risk score display
- **CTA Button**: White with gradient hover, prominent placement

### Coach Selection Page:
- **Background**: Purple gradient (calming, professional)
- **Coach Cards**: 
  - Hover effects for interactivity
  - Selected state with green badge
  - Avatar with initials
  - Verified/Approved badges
  - Clear typography hierarchy
- **Grid Layout**: Responsive, 2-column on desktop, 1-column mobile

---

## 🔄 API Integration

### Endpoints Used:
1. **Check Lock Status**: `GET /api/client/{client_id}/lock-status/`
2. **Get Coaches**: `GET /api/coach/available/`
3. **Assign Coach**: `POST /api/coach/assign/`

---

## 💡 Customization Options

### To Change Risk Threshold:
Edit `ProtectedDashboardWrapper.tsx`:
```typescript
lockStatus?.current_risk_score > 60  // Change 60 to desired %
```

### To Modify Notification Text:
Edit `HighRiskNotification.tsx`:
```typescript
<h2>Professional Support Required</h2>  // Change title
<p>Based on your recent assessments...</p>  // Change description
```

### To Customize Coach Display:
Edit `SelectCoach.tsx` and `SelectCoach.css` for layout/styling

---

## ✨ Next Steps (Optional Enhancements)

- [ ] Add coach ratings/reviews
- [ ] Show coach availability/schedule
- [ ] Add coach profile photos
- [ ] Implement coach filtering by specialization
- [ ] Add "Request Different Coach" feature
- [ ] Email notification to coach when assigned
- [ ] Add analytics tracking for coach selections

---

## 🐛 Troubleshooting

### Notification Not Showing:
1. Check user's risk score: `console.log(lockStatus)`
2. Verify API endpoint returns correct data
3. Check if coach is already assigned

### Coach Selection Not Working:
1. Verify coaches have `is_approved: true`
2. Check API response in Network tab
3. Verify client_id is present in user object

---

## 📞 Support

For issues or questions, check:
- Browser console for errors
- Network tab for API failures
- Backend logs for server errors

---

**Implementation Complete!** 🎉
Users with >60% risk will now see the mandatory coach assignment flow.
