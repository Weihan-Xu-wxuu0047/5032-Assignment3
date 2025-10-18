# AWS Credentials Configuration

## 📍 Location
The AWS credentials file is located at:
```
community-sport/community-sport/functions/.env.local
```

## 🔑 Current Configuration

The file currently contains placeholder values that **YOU NEED TO REPLACE**:

```env
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID_HERE
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY_HERE
AWS_REGION=ap-southeast-2
AWS_BUCKET_NAME=community-sport-images-2024
```

---

## ✏️ How to Update the Credentials

### Step 1: Get Your AWS Credentials

After completing the AWS S3 setup (see `S3_CONFIGURATION_STEPS.md`), you will have:
- **Access Key ID**: Starts with `AKIA...` (about 20 characters)
- **Secret Access Key**: Long random string (about 40 characters)

### Step 2: Edit the `.env.local` File

1. **Open the file** in your code editor:
   ```
   community-sport/community-sport/functions/.env.local
   ```

2. **Replace the placeholder values** with your actual credentials:

   **Before:**
   ```env
   AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID_HERE
   AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY_HERE
   AWS_REGION=ap-southeast-2
   AWS_BUCKET_NAME=community-sport-images-2024
   ```

   **After** (example with fake credentials):
   ```env
   AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   AWS_REGION=ap-southeast-2
   AWS_BUCKET_NAME=community-sport-images-2024
   ```

3. **Update the bucket name** if you used a different name:
   ```env
   AWS_BUCKET_NAME=your-actual-bucket-name-here
   ```

4. **Save the file**

---

## ⚠️ CRITICAL SECURITY WARNINGS

### DO NOT:
- ❌ **DO NOT** commit this file to Git (it's already in `.gitignore`)
- ❌ **DO NOT** share these credentials publicly
- ❌ **DO NOT** copy credentials to any other files
- ❌ **DO NOT** hardcode credentials in JavaScript files
- ❌ **DO NOT** push credentials to GitHub/GitLab/etc.

### DO:
- ✅ **DO** keep this file local only
- ✅ **DO** verify `.env.local` is in `.gitignore`
- ✅ **DO** rotate keys every 90 days
- ✅ **DO** delete keys if compromised
- ✅ **DO** use different keys for dev/production

---

## 🔍 Verify Configuration

After updating the credentials, verify they're loaded correctly:

1. **Check file exists**:
   ```bash
   ls -la functions/.env.local
   ```

2. **Check file is ignored by Git**:
   ```bash
   git status
   ```
   You should NOT see `.env.local` in the list of changes.

3. **Test the cloud function**:
   - Deploy functions: `firebase deploy --only functions`
   - Try uploading an image from LaunchProgramPage
   - Check the console for any AWS authentication errors

---

## 🔄 For Production Deployment

When deploying to production, use Firebase Functions Config instead:

```bash
firebase functions:config:set aws.access_key_id="YOUR_REAL_KEY_ID"
firebase functions:config:set aws.secret_access_key="YOUR_REAL_SECRET"
firebase functions:config:set aws.region="ap-southeast-2"
firebase functions:config:set aws.bucket_name="community-sport-images-2024"
```

Then update the S3Client initialization in `functions/index.js` to use Firebase config:

```javascript
const s3Client = new S3Client({
  region: functions.config().aws?.region || process.env.AWS_REGION || "ap-southeast-2",
  credentials: {
    accessKeyId: functions.config().aws?.access_key_id || process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: functions.config().aws?.secret_access_key || process.env.AWS_SECRET_ACCESS_KEY || ""
  }
});
```

---

## 🆘 Troubleshooting

### Issue: "AWS credentials not found"
1. Check `.env.local` file exists in `functions/` directory
2. Verify no extra spaces around the `=` sign
3. Restart your development server
4. Redeploy cloud functions

### Issue: "Access Denied" or "InvalidAccessKeyId"
1. Double-check you copied the entire access key
2. Verify the secret key is correct (no extra characters)
3. Confirm the IAM user has S3 permissions
4. Test credentials using AWS CLI (optional)

### Issue: File still tracked by Git
1. Verify `.gitignore` contains `*.local`
2. Run: `git rm --cached functions/.env.local` (if accidentally committed)
3. Commit the `.gitignore` change

---

## 📋 Quick Checklist

Before deploying:
- [ ] `.env.local` file created in `functions/` directory
- [ ] AWS_ACCESS_KEY_ID replaced with real value
- [ ] AWS_SECRET_ACCESS_KEY replaced with real value  
- [ ] AWS_REGION confirmed (ap-southeast-2)
- [ ] AWS_BUCKET_NAME matches your actual S3 bucket name
- [ ] File is NOT visible in `git status`
- [ ] Cloud functions redeployed
- [ ] Test image upload works

---

## 📝 Example Values (DO NOT USE THESE!)

These are example formats only. Your actual credentials will look similar:

```env
# Example Access Key ID (yours will be different):
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE

# Example Secret Access Key (yours will be different):
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# Region (this can stay as-is):
AWS_REGION=ap-southeast-2

# Bucket name (use your actual bucket name):
AWS_BUCKET_NAME=community-sport-images-2024
```

---

## 🎯 Next Steps

1. **Complete AWS S3 setup** following `S3_CONFIGURATION_STEPS.md`
2. **Get your access keys** from AWS IAM console
3. **Edit `functions/.env.local`** with your real credentials
4. **Deploy cloud functions**:
   ```bash
   cd community-sport/community-sport
   firebase deploy --only functions
   ```
5. **Test image upload** on LaunchProgramPage

---

## 🔐 Security Reminder

The `.env.local` file contains sensitive credentials. It is:
- ✅ Already in `.gitignore` (won't be committed)
- ✅ Local to your machine only
- ✅ Required for cloud functions to access S3
- ⚠️ Must be kept secret and secure

If credentials are ever compromised:
1. Delete the access key in AWS IAM console immediately
2. Generate new access keys
3. Update `.env.local` with new credentials
4. Redeploy cloud functions

