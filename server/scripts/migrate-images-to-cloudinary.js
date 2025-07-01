// migrate-images-to-cloudinary.js
// Usage: node migrate-images-to-cloudinary.js
// Requires: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, MONGODB_URI

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');
const fetch = require('node-fetch');
const tmp = require('tmp');
require('dotenv').config();

// --- CONFIG ---
const AVATAR_DIR = path.join(__dirname, '../public/avatars');
const PROPERTY_DIR = path.join(__dirname, '../public/properties');

// --- Cloudinary Setup ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- MongoDB Setup ---
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in environment.');
  process.exit(1);
}

// --- Mongoose Models (minimal for script) ---
const userSchema = new mongoose.Schema({ avatar: String });
const propertySchema = new mongoose.Schema({ images: [String] });
const User = mongoose.model('User', userSchema, 'users');
const Property = mongoose.model('Property', propertySchema, 'properties');

// --- Helpers ---
function isCloudinaryUrl(url) {
  return url && url.startsWith('http') && url.includes('cloudinary');
}

async function uploadToCloudinary(localPath, folder) {
  try {
    const result = await cloudinary.uploader.upload(localPath, { folder });
    return result.secure_url;
  } catch (err) {
    console.error(`[Cloudinary Upload Error]`, err);
    return null;
  }
}

async function uploadRemoteImageToCloudinary(url, folder) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const tmpFile = tmp.fileSync();
    const dest = fs.createWriteStream(tmpFile.name);
    await new Promise((resolve, reject) => {
      response.body.pipe(dest);
      response.body.on('error', reject);
      dest.on('finish', resolve);
    });
    const cloudinaryUrl = await uploadToCloudinary(tmpFile.name, folder);
    tmpFile.removeCallback();
    return cloudinaryUrl;
  } catch (err) {
    console.error(`[Cloudinary Remote Upload Error]`, err);
    return null;
  }
}

function resolveLocalPath(baseDir, imgPath) {
  // Remove leading slash if present
  let cleanPath = imgPath.startsWith('/') ? imgPath.slice(1) : imgPath;
  let absPath = path.join(baseDir, path.basename(cleanPath));
  if (fs.existsSync(absPath)) return absPath;
  // Try with original path (in case it's relative to baseDir)
  absPath = path.join(baseDir, cleanPath);
  if (fs.existsSync(absPath)) return absPath;
  // Try with original imgPath as absolute
  if (fs.existsSync(imgPath)) return imgPath;
  return null;
}

async function migrateAvatars() {
  const users = await User.find({ avatar: { $exists: true, $ne: null } });
  let updated = 0, failed = 0;
  for (const user of users) {
    if (isCloudinaryUrl(user.avatar)) continue;
    let url = null;
    if (user.avatar.startsWith('http')) {
      url = await uploadRemoteImageToCloudinary(user.avatar, 'stayfinder/avatars');
    } else {
      const localPath = resolveLocalPath(AVATAR_DIR, user.avatar);
      if (!localPath) {
        console.error(`[Avatar] File not found (tried variations): ${user.avatar} (user id: ${user._id})`);
        failed++;
        continue;
      }
      url = await uploadToCloudinary(localPath, 'stayfinder/avatars');
    }
    if (url) {
      await User.updateOne({ _id: user._id }, { avatar: url });
      console.log(`[Avatar] Updated user ${user._id} (${user.avatar} -> ${url})`);
      updated++;
    } else {
      console.error(`[Avatar] Upload failed: ${user.avatar} (user id: ${user._id})`);
      failed++;
    }
  }
  console.log(`Avatars migrated: ${updated}, failed: ${failed}`);
}

async function migratePropertyImages() {
  const properties = await Property.find({ images: { $exists: true, $ne: [] } });
  let updated = 0, failed = 0;
  for (const property of properties) {
    let changed = false;
    const newImages = await Promise.all(property.images.map(async (imgPath) => {
      if (isCloudinaryUrl(imgPath)) return imgPath;
      let url = null;
      if (imgPath.startsWith('http')) {
        url = await uploadRemoteImageToCloudinary(imgPath, 'stayfinder/properties');
      } else {
        const localPath = resolveLocalPath(PROPERTY_DIR, imgPath);
        if (!localPath) {
          console.error(`[Property] File not found (tried variations): ${imgPath} (property id: ${property._id})`);
          failed++;
          return imgPath;
        }
        url = await uploadToCloudinary(localPath, 'stayfinder/properties');
      }
      if (url) {
        changed = true;
        console.log(`[Property] Uploaded image for property ${property._id} (${imgPath} -> ${url})`);
        updated++;
        return url;
      } else {
        console.error(`[Property] Upload failed: ${imgPath} (property id: ${property._id})`);
        failed++;
        return imgPath;
      }
    }));
    if (changed) {
      await Property.updateOne({ _id: property._id }, { images: newImages });
    }
  }
  console.log(`Property images migrated: ${updated}, failed: ${failed}`);
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');
  await migrateAvatars();
  await migratePropertyImages();
  await mongoose.disconnect();
  console.log('Migration complete.');
}

main().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
}); 