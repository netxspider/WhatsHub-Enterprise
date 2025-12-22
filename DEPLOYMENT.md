# Deployment Guide for Vercel

This project is configured to be deployed to [Vercel](https://vercel.com/) as a monorepo containing both the Next.js frontend and FastAPI backend.

## Prerequisites

1.  **Vercel Account**: Sign up at vercel.com.
2.  **MongoDB Atlas**: You need a cloud MongoDB database (e.g., MongoDB Atlas) as Vercel does not host databases.
3.  **GitHub Repository**: Ensure this code is pushed to GitHub.

## Deployment Steps

1.  **Import Project to Vercel**:
    *   Go to your Vercel Dashboard.
    *   Click "Add New..." -> "Project".
    *   Import your `WhatsHub-Enterprise` repository.

2.  **Configure Project**:
    *   **Framework Preset**: It might detect Next.js. If asked, or if settings allow, leave it as default or select "Other" if "Builds" config in `vercel.json` handles it. *However, with `vercel.json` present, Vercel usually respects it.*
    *   **Root Directory**: Leave it as `./` (Project Root). Do NOT change it to `client`.

3.  **Environment Variables**:
    You MUST set the following environment variables in the Vercel Project Settings:

    | Variable Name | Description | Example Value |
    | :--- | :--- | :--- |
    | `MONGODB_URL` | Connection string to your MongoDB Atlas cluster | `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority` |
    | `DATABASE_NAME` | Name of the database | `whatshub_enterprise` |
    | `SECRET_KEY` | Secret key for JWT encryption | `your-secure-random-secret-key` |
    | `NEXT_PUBLIC_API_URL` | URL for the backend API (used by frontend) | `/api` (or your full domain `https://your-app.vercel.app/api`) |
    | `FRONTEND_URL` | URL for the frontend (used by backend for redirects) | `https://your-app.vercel.app` |
    | `GOOGLE_CLIENT_ID` | (Optional) For Google OAuth | `your-google-client-id` |
    | `GOOGLE_CLIENT_SECRET` | (Optional) For Google OAuth | `your-google-client-secret` |
    | `GOOGLE_REDIRECT_URI` | (Optional) OAuth Callback URI | `https://your-app.vercel.app/api/auth/google/callback` |

    *Note: For `NEXT_PUBLIC_API_URL`, setting it to `/api` works if both are on the same domain. Vercel will route `/api/*` requests to the Python backend according to `vercel.json`.*

4.  **Deploy**:
    *   Click "Deploy".
    *   Vercel will build the Next.js app and the Python function.

## Troubleshooting

*   **Build Failures**: Check the build logs. Common issues are missing dependencies in `requirements.txt` or TypeScript errors in `client`.
*   **Database Connection**: Ensure your MongoDB Atlas IP Access List allows access from anywhere (`0.0.0.0/0`) since Vercel IPs change dynamicallly.
