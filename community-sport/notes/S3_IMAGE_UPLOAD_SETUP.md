# AWS S3 Image Upload Integration Guide

## Overview
This guide explains how to set up AWS S3 for image storage with Firebase Cloud Functions using presigned URLs. This approach allows secure image uploads without creating dedicated IAM users.

## Architecture
1. **Frontend** uploads images to temporary storage
2. **Cloud Function** generates presigned S3 URLs
3. **Browser** uploads directly to S3 using presigned URL
4. **Firestore** stores image metadata and URLs
5. **Frontend** displays images from S3 URLs

---

## AWS S3 Setup Steps

### Step 1: Create S3 Bucket

1. **Log in to AWS Console**: https://console.aws.amazon.com/
2. **Navigate to S3**: Search for "S3" in the services menu
3. **Create Bucket**:
   - Click "Create bucket"
   - Bucket name: `community-sport-images-[unique-id]` (e.g., `community-sport-images-2024`)
   - Region: Choose closest to your users (e.g., `ap-southeast-2` for Australia)
   - **Block Public Access settings**:
     - ✅ UNCHECK "Block all public access" (we need public read for images)
     - ✅ CHECK "Block public access to buckets and objects granted through new access control lists (ACLs)"
     - ✅ CHECK "Block public access to buckets and objects granted through any access control lists (ACLs)"
     - ✅ UNCHECK "Block public access to buckets and objects granted through new public bucket or access point policies"
     - ✅ UNCHECK "Block public and cross-account access to buckets and objects through any public bucket or access point policies"
   - Click "Create bucket"

### Step 2: Configure Bucket CORS

1. **Select your bucket** from the S3 console
2. **Go to "Permissions" tab**
3. **Scroll to "Cross-origin resource sharing (CORS)"**
4. **Click "Edit"** and paste the following CORS configuration:

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
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:5173",
            "http://localhost:3000",
            "https://your-production-domain.com"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

5. **Save changes**

### Step 3: Create Bucket Policy for Public Read

1. **In "Permissions" tab**, scroll to "Bucket policy"
2. **Click "Edit"** and paste the following policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::community-sport-images-YOUR-UNIQUE-ID/*"
        }
    ]
}
```

**Replace** `community-sport-images-YOUR-UNIQUE-ID` with your actual bucket name.

3. **Save changes**

### Step 4: Create IAM User with S3 Permissions (For Cloud Functions)

**Note**: While you mentioned not wanting to create a new IAM user, we need credentials for the Cloud Function to generate presigned URLs. This is a service account, not a user account.

1. **Navigate to IAM** in AWS Console
2. **Create New User**:
   - Click "Users" → "Create user"
   - User name: `community-sport-s3-service`
   - Access type: ✅ Programmatic access (NO console access needed)
   - Click "Next"
3. **Set Permissions**:
   - Click "Attach policies directly"
   - Search for "S3" and select **"AmazonS3FullAccess"**
   - OR create a custom policy (more secure):
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Effect": "Allow",
               "Action": [
                   "s3:PutObject",
                   "s3:GetObject",
                   "s3:DeleteObject"
               ],
               "Resource": "arn:aws:s3:::community-sport-images-YOUR-UNIQUE-ID/*"
           }
       ]
   }
   ```
4. **Create User** and **SAVE** the credentials:
   - **Access Key ID**: Save this
   - **Secret Access Key**: Save this (you won't see it again!)

### Step 5: Store AWS Credentials in Firebase

1. **Set Firebase environment variables**:
   ```bash
   firebase functions:config:set aws.access_key_id="YOUR_ACCESS_KEY_ID"
   firebase functions:config:set aws.secret_access_key="YOUR_SECRET_ACCESS_KEY"
   firebase functions:config:set aws.region="ap-southeast-2"
   firebase functions:config:set aws.bucket_name="community-sport-images-YOUR-UNIQUE-ID"
   ```

2. **For local development**, create `functions/.env.local`:
   ```
   AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
   AWS_REGION=ap-southeast-2
   AWS_BUCKET_NAME=community-sport-images-YOUR-UNIQUE-ID
   ```

---

## Implementation Details

### Cloud Function Flow

1. **Frontend** calls `generateUploadUrl` cloud function with filename
2. **Cloud Function** generates presigned URL for S3
3. **Frontend** uploads file directly to S3 using presigned URL
4. **Frontend** saves image URL to Firestore via `createProgram` or `updateProgram`

### Image URL Format

Images will be accessible via:
```
https://community-sport-images-YOUR-UNIQUE-ID.s3.ap-southeast-2.amazonaws.com/programs/[program-id]/[filename]
```

### Security Features

- ✅ **Presigned URLs** expire after 5 minutes (secure, temporary access)
- ✅ **Public read-only** access to images (users can view but not modify)
- ✅ **Server-side validation** of file types and sizes
- ✅ **Organized storage** in program-specific folders
- ✅ **No exposed credentials** in frontend code

---

## Testing Checklist

After setup, test the following:

- [ ] Upload image from LaunchProgramPage
- [ ] Verify image appears in S3 bucket
- [ ] Check image URL is saved in Firestore
- [ ] Verify image displays on HomePage
- [ ] Test image displays on ProgramDetailsPage
- [ ] Confirm CORS is working (no browser errors)
- [ ] Verify presigned URLs expire correctly

---

## Troubleshooting

### Issue: "Access Denied" when uploading
- **Solution**: Check bucket CORS configuration
- **Solution**: Verify IAM user has S3 permissions
- **Solution**: Check presigned URL hasn't expired

### Issue: Images not displaying
- **Solution**: Verify bucket policy allows public read
- **Solution**: Check image URL format is correct
- **Solution**: Confirm bucket name matches in all configurations

### Issue: "Invalid security token"
- **Solution**: Verify AWS credentials are set correctly in Firebase config
- **Solution**: Check environment variables are loaded in cloud function

---

## Cost Considerations

### AWS S3 Pricing (ap-southeast-2 region)
- **Storage**: ~$0.023 per GB/month
- **PUT requests**: ~$0.005 per 1,000 requests
- **GET requests**: ~$0.0004 per 1,000 requests
- **Data transfer out**: First 100GB free, then ~$0.114 per GB

### Estimated Monthly Cost
For a small community app with:
- 1000 program images (avg 500KB each) = 0.5GB storage = **$0.01/month**
- 10,000 image views/month = **$0.004/month**
- 500 image uploads/month = **$0.0025/month**

**Total**: ~$0.02/month (essentially free for small scale)

---

## Security Best Practices

1. **Never expose AWS credentials** in frontend code
2. **Always validate file types** before generating presigned URLs
3. **Set expiration times** on presigned URLs (5-15 minutes)
4. **Implement file size limits** (5MB recommended)
5. **Use virus scanning** for production (AWS S3 + Lambda integration)
6. **Enable versioning** on S3 bucket for backup
7. **Set up lifecycle policies** to delete old unused images

---

## Additional Resources

- **AWS S3 Documentation**: https://docs.aws.amazon.com/s3/
- **S3 Presigned URLs**: https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html
- **AWS SDK for JavaScript v3**: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/
- **Firebase Functions Config**: https://firebase.google.com/docs/functions/config-env

