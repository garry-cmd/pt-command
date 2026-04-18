#!/bin/bash

# PT Command Deployment Script
# Run this to deploy PT Command to Vercel

echo "🚀 PT Command Deployment Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this from the pt-command root directory."
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found. Make sure to add Supabase credentials."
    echo "   Copy .env.example to .env.local and fill in your values."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Type check
echo "🔍 Running type check..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ TypeScript errors found. Fix them before deploying."
    exit 1
fi

# Build the project
echo "🔨 Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy
vercel --prod

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo ""
    echo "📱 Your PT Command app is now live!"
    echo "💪 Ready for H/M/L training protocol tracking"
else
    echo "❌ Deployment failed. Check the errors above."
    exit 1
fi
