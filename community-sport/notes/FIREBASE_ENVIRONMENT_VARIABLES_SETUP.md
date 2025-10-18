# Firebase Environment Variables Setup

## 🚨 **CRITICAL: You Must Set Environment Variables in Firebase Console**

The cloud function has been deployed successfully, but it needs your AWS credentials to work. Follow these steps:

---

## 📍 **Step 1: Go to Firebase Console**

1. **Open**: [Firebase Console](https://console.firebase.google.com/)
2. **Select**: Your project `assingment1-community-sport`
3. **Navigate**: Functions → Environment Variables

---

## 📍 **Step 2: Set Environment Variables**

Click **"Add Variable"** and add these 4 environment variables:

### **Variable 1: AWS_ACCESS_KEY_ID**
- **Name**: `AWS_ACCESS_KEY_ID`
- **Value**: `YOUR_ACTUAL_ACCESS_KEY_ID` (replace with your real AWS Access Key ID)

### **Variable 2: AWS_SECRET_ACCESS_KEY**
- **Name**: `AWS_SECRET_ACCESS_KEY`
- **Value**: `YOUR_ACTUAL_SECRET_ACCESS_KEY` (replace with your real AWS Secret Access Key)

### **Variable 3: AWS_REGION**
- **Name**: `AWS_REGION`
- **Value**: `ap-southeast-2`

### **Variable 4: AWS_BUCKET_NAME**
- **Name**: `AWS_BUCKET_NAME`
- **Value**: `community-sport-images-2024` (or your actual bucket name)

---

## 📍 **Step 3: Save and Redeploy**

1. **Click**: "Save" after adding all variables
2. **Redeploy**: The function will automatically redeploy with the new environment variables

---

## 🔍 **How to Get Your AWS Credentials**

If you haven't set up AWS yet, follow these steps:

### **1. Create AWS Account** (if you don't have one)
- Go to [AWS Console](https://aws.amazon.com/)
- Sign up for a free account

### **2. Create S3 Bucket**
- Go to [S3 Console](https://s3.console.aws.amazon.com/)
- Click "Create bucket"
- **Bucket name**: `community-sport-images-2024` (must be globally unique)
- **Region**: `Asia Pacific (Sydney) - ap-southeast-2`
- **Block Public Access**: Uncheck "Block all public access" (we need public read access)
- **Bucket Versioning**: Disabled
- **Default encryption**: None
- Click "Create bucket"

### **3. Create IAM User**
- Go to [IAM Console](https://console.aws.amazon.com/iam/)
- Click "Users" → "Create user"
- **User name**: `community-sport-s3-user`
- **Access type**: Programmatic access
- Click "Next: Permissions"

### **4. Attach Policy**
- Click "Attach policies directly"
- Search for and select: `AmazonS3FullAccess`
- Click "Next: Tags" → "Next: Review" → "Create user"

### **5. Get Credentials**
- **IMPORTANT**: Copy the Access Key ID and Secret Access Key
- **Save them securely** - you won't be able to see the secret key again!

---

## 📍 **Step 4: Test the Function**

After setting the environment variables:

1. **Go to**: Your app's Launch Program page
2. **Upload**: A test image
3. **Submit**: The form
4. **Check**: Console for any errors

---

## 🔧 **Alternative: Set Environment Variables via CLI**

If you prefer using the command line:

```bash
# Set each environment variable
firebase functions:config:set aws.access_key_id="YOUR_ACCESS_KEY_ID"
firebase functions:config:set aws.secret_access_key="YOUR_SECRET_ACCESS_KEY"
firebase functions:config:set aws.region="ap-southeast-2"
firebase functions:config:set aws.bucket_name="community-sport-images-2024"

# Deploy the function
firebase deploy --only functions:generateImageUploadUrl
```

---

## 🚨 **Security Notes**

- ✅ **Environment variables are encrypted** in Firebase
- ✅ **Only accessible by your cloud functions**
- ✅ **Not visible in client-side code**
- ⚠️ **Never commit AWS credentials to Git**
- ⚠️ **Rotate keys every 90 days**

---

## 🔍 **Troubleshooting**

### **Error: "AWS S3 bucket name not configured"**
- Check that `AWS_BUCKET_NAME` is set in Firebase Console
- Verify the bucket name matches your actual S3 bucket

### **Error: "Access Denied" or "InvalidAccessKeyId"**
- Check that `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are correct
- Verify the IAM user has S3 permissions

### **Error: "The specified bucket does not exist"**
- Check that the S3 bucket exists in the correct region
- Verify the bucket name is spelled correctly

### **Function not updating after setting variables**
- Wait 2-3 minutes for the function to redeploy
- Check the Firebase Console for deployment status

---

## 📋 **Quick Checklist**

Before testing:
- [ ] S3 bucket created in `ap-southeast-2` region
- [ ] IAM user created with S3 permissions
- [ ] AWS credentials copied and saved securely
- [ ] Environment variables set in Firebase Console
- [ ] Function redeployed successfully
- [ ] Test image upload works

---

## 🎯 **Next Steps**

1. **Complete AWS setup** (if not done already)
2. **Set environment variables** in Firebase Console
3. **Test image upload** on Launch Program page
4. **Verify images appear** on HomePage

---

## 📞 **Need Help?**

If you encounter any issues:
1. Check the Firebase Console logs
2. Verify all environment variables are set correctly
3. Ensure AWS credentials have proper permissions
4. Test with a small image file first

The function is ready - it just needs your AWS credentials! 🚀
