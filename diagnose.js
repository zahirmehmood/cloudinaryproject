#!/usr/bin/env node

/**
 * MediaVault Diagnostic Tool
 * Run this to check if your setup is correct
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('\n🔍 MediaVault Diagnostics\n');
console.log('=' .repeat(60));

// Check Node version
console.log('\n📦 Environment:');
console.log('Node.js version:', process.version);
console.log('NPM version:', require('child_process').execSync('npm --version').toString().trim());
console.log('Platform:', process.platform);
console.log('CWD:', process.cwd());

// Check .env file
console.log('\n📄 Configuration Files:');
const envExists = fs.existsSync('.env');
console.log('.env file:', envExists ? '✅ EXISTS' : '❌ MISSING');

if (envExists) {
  const envContent = fs.readFileSync('.env', 'utf8');
  const hasCloud = envContent.includes('CLOUDINARY_CLOUD_NAME');
  const hasKey = envContent.includes('CLOUDINARY_API_KEY');
  const hasSecret = envContent.includes('CLOUDINARY_API_SECRET');
  
  console.log('  - CLOUDINARY_CLOUD_NAME:', hasCloud ? '✅ SET' : '❌ MISSING');
  console.log('  - CLOUDINARY_API_KEY:', hasKey ? '✅ SET' : '❌ MISSING');
  console.log('  - CLOUDINARY_API_SECRET:', hasSecret ? '✅ SET' : '❌ MISSING');
}

// Check environment variables
console.log('\n🔐 Environment Variables:');
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('CLOUDINARY_CLOUD_NAME:', cloudName ? `✅ ${cloudName}` : '❌ NOT SET');
console.log('CLOUDINARY_API_KEY:', apiKey ? `✅ ${apiKey.substring(0, 10)}...` : '❌ NOT SET');
console.log('CLOUDINARY_API_SECRET:', apiSecret ? '✅ SET (hidden)' : '❌ NOT SET');

// Check Cloudinary SDK
console.log('\n📚 Dependencies:');
try {
  const cloudinary = require('cloudinary');
  console.log('✅ cloudinary package installed');
  console.log('  Version:', require('./package.json').dependencies.cloudinary);
} catch (e) {
  console.log('❌ cloudinary package NOT found - run: npm install');
}

try {
  const express = require('express');
  console.log('✅ express package installed');
} catch (e) {
  console.log('❌ express package NOT found');
}

try {
  require('dotenv');
  console.log('✅ dotenv package installed');
} catch (e) {
  console.log('❌ dotenv package NOT found');
}

// Check required files
console.log('\n📂 Project Files:');
const requiredFiles = [
  'server.js',
  'package.json',
  'public/index.html',
  'public/app.js',
  'public/styles.css'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${file}:`, exists ? '✅' : '❌');
});

// Test Cloudinary connection
console.log('\n🌐 Cloudinary Configuration:');
if (cloudName && apiKey && apiSecret) {
  const cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });

  try {
    const url = cloudinary.url('test', { secure: true });
    console.log('✅ Configuration valid');
    console.log('  Generated URL:', url);
  } catch (e) {
    console.log('❌ Configuration error:', e.message);
  }
} else {
  console.log('❌ Cannot test - missing credentials');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('✅ Summary:\n');

const allGood = envExists && cloudName && apiKey && apiSecret &&
  fs.existsSync('server.js') &&
  fs.existsSync('public/index.html');

if (allGood) {
  console.log('✅ Your MediaVault setup looks good!');
  console.log('\n🚀 You can now run:');
  console.log('  npm start');
  console.log('\n📍 Visit: http://localhost:5000');
} else {
  console.log('⚠️  Setup incomplete. Fix these issues:');
  
  if (!envExists) {
    console.log('\n1. Create .env file:');
    console.log('   cp .env.example .env');
    console.log('   Edit .env with your Cloudinary credentials');
  }
  
  if (!cloudName || !apiKey || !apiSecret) {
    console.log('\n2. Add Cloudinary credentials to .env:');
    console.log('   CLOUDINARY_CLOUD_NAME=your_cloud_name');
    console.log('   CLOUDINARY_API_KEY=your_api_key');
    console.log('   CLOUDINARY_API_SECRET=your_api_secret');
  }
  
  console.log('\n3. Install dependencies if needed:');
  console.log('   npm install');
  
  console.log('\n4. Then start the server:');
  console.log('   npm start');
}

console.log('\n📖 For help, see: TROUBLESHOOTING.md\n');
console.log('=' .repeat(60) + '\n');
