# AWS S3 Image Upload - Step-by-Step Configuration Guide

## ✅ What Has Been Implemented

The following code has already been added to your project:

### Frontend Changes:
1. ✅ **LaunchProgramPage.vue**: Image upload interface with S3 integration
2. ✅ **HomePage.vue**: Already displays first image from `program.images[0]`
3. ✅ **ProgramCard.vue**: Shows program images with fallback placeholder

### Backend Changes:
1. ✅ **Cloud Function**: `generateImageUploadUrl` - generates S3 presigned URLs
2. ✅ **DataService**: `uploadImageToS3` - handles image upload workflow
3. ✅ **AWS SDK**: Installed in functions directory

---

## 🔧 Configuration Steps You Need to Complete

### STEP 1: Create AWS Account (If you don't have one)
1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow the registration process
4. **Note**: You'll need a credit card, but AWS Free Tier covers our usage

---

### STEP 2: Create S3 Bucket

1. **Log in to AWS Console**: https://console.aws.amazon.com/
2. **Search for "S3"** in the search bar
3. **Click "Create bucket"**
4. **Configure bucket settings**:

   ```
   Bucket name: community-sport-images-2024
   (Note: Bucket names must be globally unique, add your own identifier if needed)
   
   AWS Region: ap-southeast-2 (Sydney - closest to Melbourne)
   
   Object Ownership: ACLs disabled (recommended)
   
   Block Public Access settings:
   ❌ UNCHECK "Block all public access"
   ✅ CHECK "Block public access to buckets and objects granted through new ACLs"
   ✅ CHECK "Block public access to buckets and objects granted through any ACLs"  
   ❌ UNCHECK "Block public and cross-account access via new public bucket policies"
   ❌ UNCHECK "Block public and cross-account access via any public bucket policies"
   
   ✅ CHECK "I acknowledge that the current settings might result in this bucket and objects becoming public"
   
   Bucket Versioning: Disabled (or Enabled for backup)
   
   Tags: (Optional)
   - Key: Project, Value: CommunitySport
   - Key: Environment, Value: Production
   
   Default encryption: Disabled (or use SSE-S3 for security)
   ```

5. **Click "Create bucket"**

---

### STEP 3: Configure Bucket CORS

1. **Click on your bucket name** in the S3 console
2. **Go to "Permissions" tab**
3. **Scroll down to "Cross-origin resource sharing (CORS)"**
4. **Click "Edit"**
5. **Paste this CORS configuration**:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:5173",
            "http://localhost:3000",
            "https://*.web.app",
            "https://*.firebaseapp.com",
            "https://your-production-domain.com"
        ],
        "ExposeHeaders": [
            "ETag",
            "x-amz-request-id"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

6. **Replace** `https://your-production-domain.com` with your actual Cloudflare Pages domain when deployed
7. **Click "Save changes"**

---

### STEP 4: Add Bucket Policy (Public Read Access)

1. **Still in "Permissions" tab**, scroll to "Bucket policy"
2. **Click "Edit"**
3. **Paste this policy**:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::community-sport-images-2024/*"
        }
    ]
}
```

4. **Replace** `community-sport-images-2024` with your actual bucket name
5. **Click "Save changes"**

---

### STEP 5: Create IAM Service Account

1. **Navigate to IAM** in AWS Console (search for "IAM")
2. **Click "Users"** in the left sidebar
3. **Click "Create user"**
4. **Configure user**:

   ```
   User name: community-sport-s3-service
   
   ❌ UNCHECK "Provide user access to the AWS Management Console"
   (This is a service account, not for console login)
   ```

5. **Click "Next"**
6. **Set permissions**:
   - Select "Attach policies directly"
   - Search for custom policy or use existing policy
   
   **Option A - Use Existing Policy** (Easier):
   - Search for "AmazonS3FullAccess"
   - ✅ Check the box
   
   **Option B - Create Custom Policy** (More Secure, Recommended):
   - Click "Create policy"
   - Choose "JSON" tab
   - Paste this policy:
   
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Sid": "S3ProgramImagesAccess",
               "Effect": "Allow",
               "Action": [
                   "s3:PutObject",
                   "s3:GetObject",
                   "s3:DeleteObject",
                   "s3:ListBucket"
               ],
               "Resource": [
                   "arn:aws:s3:::community-sport-images-2024",
                   "arn:aws:s3:::community-sport-images-2024/*"
               ]
           }
       ]
   }
   ```
   
   - Replace bucket name with yours
   - Name it: `CommunitySpor-S3ProgramImagesPolicy`
   - Create and attach to user

7. **Click "Next"**
8. **Review and create user**

---

### STEP 6: Generate Access Keys

1. **Click on the created user** `community-sport-s3-service`
2. **Go to "Security credentials" tab**
3. **Scroll to "Access keys" section**
4. **Click "Create access key"**
5. **Select use case**: "Third-party service"
6. **Click "Next"**
7. **Add description tag** (optional): "Community Sport Firebase Functions"
8. **Click "Create access key"**
9. **IMPORTANT - SAVE THESE CREDENTIALS**:
   ```
   Access key ID: AKIA... (example)
   Secret access key: wJalrXU... (example)
   ```
   ⚠️ **WARNING**: You won't be able to see the secret key again!
10. **Click "Done"**

---

### STEP 7: Configure Firebase Functions

Now you need to set the AWS credentials in your Firebase project.

#### Method 1: Using Firebase CLI (Recommended for Production)

Run these commands in your terminal:

```bash
cd community-sport/community-sport

firebase functions:config:set aws.access_key_id="YOUR_ACCESS_KEY_ID_HERE"
firebase functions:config:set aws.secret_access_key="YOUR_SECRET_ACCESS_KEY_HERE"
firebase functions:config:set aws.region="ap-southeast-2"
firebase functions:config:set aws.bucket_name="community-sport-images-2024"
```

**Replace** the values with your actual credentials and bucket name.

To view your configuration:
```bash
firebase functions:config:get
```

#### Method 2: Using .env file (For Local Testing)

1. **Create file**: `community-sport/functions/.env.local`
2. **Add these variables**:

```env
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID_HERE
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY_HERE
AWS_REGION=ap-southeast-2
AWS_BUCKET_NAME=community-sport-images-2024
```

3. **Add to `.gitignore`** (very important!):
   ```
   functions/.env.local
   ```

**Note**: For production, always use `firebase functions:config:set` method!

---

### STEP 8: Deploy Cloud Functions

Deploy the updated cloud functions with S3 support:

```bash
cd community-sport/community-sport
firebase deploy --only functions
```

Wait for deployment to complete. You should see:
```
✔ functions[generateImageUploadUrl(us-central1)] Successful create operation.
```

---

### STEP 9: Test the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test image upload**:
   - Login as an organizer
   - Navigate to "Launch Program" page
   - Fill out the program details
   - Scroll to "Program Images" section
   - Click "Choose Files" and select 1-3 images
   - You should see image previews
   - Submit the form
   - Watch the console for upload progress

3. **Verify S3 upload**:
   - Go to AWS S3 Console
   - Click on your bucket
   - You should see folder: `programs/temp/` or `programs/[program-id]/`
   - Inside should be your uploaded images

4. **Check Firestore**:
   - Go to Firebase Console → Firestore Database
   - Find your program document
   - The `images` field should contain S3 URLs like:
     ```
     [
       "https://community-sport-images-2024.s3.ap-southeast-2.amazonaws.com/programs/temp/1234567890-image.jpg"
     ]
     ```

5. **Test image display**:
   - Go to HomePage
   - You should see the program cards with actual images
   - Images should load from S3

---

## 🎯 Expected Behavior

### During Upload:
1. User selects images → Previews appear
2. User fills form → Clicks "Launch Program"
3. Status shows: "Uploading 3 image(s) to storage..."
4. Status updates: "Uploading images... (1/3)"
5. Status shows: "3 of 3 image(s) uploaded successfully"
6. Program created with S3 image URLs
7. Success message displayed

### On Display:
1. HomePage shows program cards
2. First image from `images[0]` displays
3. If no images, shows placeholder
4. Images load from S3 CDN
5. Fast loading with lazy loading

---

## 🔒 Security Checklist

Before going to production:

- [ ] AWS credentials stored in Firebase config (NOT in code)
- [ ] `.env.local` added to `.gitignore`
- [ ] S3 bucket has public read-only access
- [ ] CORS properly configured with production domains
- [ ] IAM user has minimum required permissions
- [ ] Presigned URLs expire in reasonable time (5 minutes)
- [ ] File type validation on both frontend and backend
- [ ] File size limits enforced (5MB max)
- [ ] All credentials saved securely

---

## 📊 Monitoring

### Check S3 Usage:
1. AWS Console → S3 → Your bucket
2. Click "Metrics" tab
3. View storage size and request metrics

### Check Costs:
1. AWS Console → Billing Dashboard
2. View current month charges
3. Set up billing alerts if needed

### Check Function Logs:
```bash
firebase functions:log --only generateImageUploadUrl
```

---

## 🚨 Troubleshooting Common Issues

### Issue: "AWS credentials not found"
**Solution**:
```bash
firebase functions:config:get
```
If empty, run the `config:set` commands from STEP 7 again.

### Issue: "CORS error" in browser
**Solution**:
1. Check CORS configuration in S3 (STEP 3)
2. Add your frontend URL to `AllowedOrigins`
3. Clear browser cache and try again

### Issue: "Access Denied" when viewing images
**Solution**:
1. Check bucket policy allows public read (STEP 4)
2. Verify policy Resource ARN matches your bucket name
3. Make sure you clicked "Save changes"

### Issue: "SignatureDoesNotMatch" error
**Solution**:
1. Verify AWS credentials are correct
2. Check no extra spaces in access key/secret
3. Redeploy functions after fixing credentials

### Issue: Images not displaying on HomePage
**Solution**:
1. Check browser console for errors
2. Verify image URLs in Firestore are correct
3. Test S3 URL directly in browser
4. Check CORS is properly configured

---

## 💡 Tips & Best Practices

1. **Use descriptive image names**: e.g., `tennis-program-court-1.jpg`
2. **Optimize images before upload**: Resize to max 1920px width
3. **Use appropriate formats**: JPG for photos, PNG for graphics, WebP for best compression
4. **Set cache headers**: S3 can set cache-control for better performance
5. **Monitor costs**: Set up AWS budget alerts for unexpected charges
6. **Backup strategy**: Enable S3 versioning or use lifecycle policies
7. **Image moderation**: Consider adding content moderation for user uploads

---

## 📱 What to Tell Users

When users upload images:
- ✅ Maximum 10 images per program
- ✅ Supported formats: JPG, PNG, GIF, WebP
- ✅ Maximum file size: 5MB per image
- ✅ Images are uploaded when you submit the program
- ✅ Images appear on program cards and details pages
- ✅ First image is used as the program thumbnail

---

## 🎓 Quick Reference

### AWS SDK Packages Used:
```json
{
  "@aws-sdk/client-s3": "^3.x",
  "@aws-sdk/s3-request-presigner": "^3.x"
}
```

### Environment Variables Needed:
```
AWS_ACCESS_KEY_ID=<from IAM user>
AWS_SECRET_ACCESS_KEY=<from IAM user>
AWS_REGION=ap-southeast-2
AWS_BUCKET_NAME=community-sport-images-2024
```

### S3 URL Format:
```
https://[BUCKET_NAME].s3.[REGION].amazonaws.com/programs/[FOLDER]/[TIMESTAMP]-[FILENAME]
```

Example:
```
https://community-sport-images-2024.s3.ap-southeast-2.amazonaws.com/programs/temp/1697500000000-tennis-court.jpg
```

---

## ✨ Next Steps After Setup

1. **Test locally** with Firebase emulator (optional)
2. **Deploy functions** with AWS credentials
3. **Test image upload** on LaunchProgramPage
4. **Verify images display** on HomePage
5. **Test with different image types** and sizes
6. **Check S3 bucket** for uploaded files
7. **Monitor costs** in AWS Billing Dashboard

---

## 📞 Support Resources

- **AWS Support**: https://console.aws.amazon.com/support/
- **Firebase Support**: https://firebase.google.com/support
- **S3 Documentation**: https://docs.aws.amazon.com/s3/
- **AWS SDK for JavaScript**: https://docs.aws.amazon.com/sdk-for-javascript/v3/

---

## 🔐 IMPORTANT SECURITY NOTES

⚠️ **NEVER commit AWS credentials to Git**
⚠️ **NEVER expose credentials in frontend code**
⚠️ **ALWAYS use environment variables or Firebase config**
⚠️ **REGULARLY rotate access keys** (every 90 days recommended)
⚠️ **MONITOR S3 access logs** for unusual activity
⚠️ **SET UP billing alerts** to prevent unexpected charges

---

## 📋 Configuration Checklist

Print this checklist and check off each step:

- [ ] Created AWS account
- [ ] Created S3 bucket with unique name
- [ ] Configured bucket public access settings
- [ ] Added CORS configuration to bucket
- [ ] Added bucket policy for public read
- [ ] Created IAM service account user
- [ ] Generated access keys for IAM user
- [ ] Saved access key ID securely
- [ ] Saved secret access key securely
- [ ] Set Firebase functions config with AWS credentials
- [ ] Updated bucket name in Firebase config
- [ ] Added .env.local to .gitignore
- [ ] Deployed cloud functions
- [ ] Tested image upload
- [ ] Verified images in S3 bucket
- [ ] Confirmed images display on HomePage
- [ ] Set up AWS billing alerts
- [ ] Documented credentials in secure location

---

## 🎉 You're Done!

Once all steps are complete, your application will:
- ✅ Upload images directly to AWS S3
- ✅ Store image URLs in Firestore
- ✅ Display images on HomePage and program cards
- ✅ Handle errors gracefully
- ✅ Work securely without exposing credentials
- ✅ Scale to handle thousands of images
- ✅ Cost pennies per month for typical usage

Good luck with your deployment! 🚀

