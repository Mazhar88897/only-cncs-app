# Environment Setup

## Create .env file

Create a `.env` file in the root directory of your project with the following content:

```
# API Configuration
EXPO_PUBLIC_BASE_URL=https://backend.smartcnc.site/api

# Add other environment variables as needed
# EXPO_PUBLIC_API_KEY=your_api_key_here
# EXPO_PUBLIC_ENVIRONMENT=development
```

## Important Notes

1. **File Location**: Place the `.env` file in the root directory (same level as `package.json`)

2. **Environment Variables**: All environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in your React Native app

3. **API Base URL**: The base URL is set to `https://backend.smartcnc.site/api`

4. **Usage**: In your code, access the environment variable using:
   ```javascript
   process.env.EXPO_PUBLIC_BASE_URL
   ```

5. **Fallback**: The code includes fallback URLs in case the environment variable is not set

## Login Functionality

The login page (`app/(auth)/login.tsx`) includes:
- Email and password validation
- API integration with your backend
- Loading states and error handling
- Navigation to main app after successful login
- Links to forgot password and create account pages

## Data Storage

For persistent data storage in React Native, consider installing:
```bash
npm install @react-native-async-storage/async-storage
```

This will allow you to store user data persistently (equivalent to sessionStorage in web apps). 