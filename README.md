# Zelin Café - Coffee Shop Management System

Below you'll find all the necessary information to get the project up and running on your local machine.

## Project Overview

Zelin Café is a modern coffee shop management system built with:
- Next.js (React framework)
- Supabase (Backend and database)
- Tailwind CSS (Styling)
- Framer Motion (Animations)

Key Features:
- Responsive menu system with search and filtering
- QR code generation for menu sharing
- Admin dashboard for managing menu items
- User authentication system
- Real-time updates powered by Supabase

## Installation Instructions

### Step 1: Prerequisites

Before you begin, ensure you have the following installed:
1. Node.js (v18 or higher)
2. npm (v9 or higher)
3. Git

### Step 2: Unzip the project folder

### Step 3: Install Dependencies

Install all required packages by running:
```bash
npm install
```

### Step 4: Supabase Credentials Environment Variables

Go to supabase.com and login the following:

hocovip267@framitag.com
zeninCofe0112!


### Step 5: Run the Development Server

Start the application with:
```bash
HOST=0.0.0.0 npm run dev
```

### Step 6: Access the Application

- On your computer: Open `http://localhost:3000` in your browser
- On other devices: Use your computer's IP address (e.g., `http://192.168.1.100:3000`)
- here are is the admin account credentials:
zelincafeadmin@gmail.com
zelincafeadmin

## QR Code Feature

The menu page includes a QR code generation feature that works as follows:

### Using Local Network IP Address

1. **Find Your Local IP Address**:
   - On Windows: Open Command Prompt and run `ipconfig`
   - On macOS/Linux: Open Terminal and run `ifconfig`
   - Look for your IPv4 address (e.g., 192.168.1.100)

2. **Generate the QR Code**:
   - Click the "Get QR Code" button in the menu section
   - The QR code will be generated using your local IP address

3. **Scan and Access**:
   - Ensure your phone is connected to the same WiFi network as your computer
   - Scan the QR code with your phone's camera
   - The menu will open in your phone's browser

### Important Notes:
- Both devices must be on the same WiFi network
- Your computer's firewall must allow incoming connections on port 3000


## Project Structure

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

zelin-cafe/
├── src/
│ ├── app/ # Application pages
│ ├── components/ # Reusable components
│ ├── lib/ # Utility functions
│ └── styles/ # Global styles
├── public/ # Static assets
└── package.json # Project dependencies


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


- `dev`: Starts the development server
- `build`: Creates an optimized production build
- `start`: Starts the production server
- `lint`: Runs ESLint for code quality checks




