# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/18fe4a63-1fa5-41ca-b3c0-2ca423fcde0e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/18fe4a63-1fa5-41ca-b3c0-2ca423fcde0e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Environment Variables and Deployment

This project requires the following environment variables to be set in your deployment platform (Vercel):

### Supabase Configuration
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Anonymous key for Supabase client-side operations
- `SUPABASE_URL`: Same as VITE_SUPABASE_URL (used by server functions)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for Supabase admin operations

### Stripe Configuration
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key for client-side
- `STRIPE_SECRET_KEY`: Stripe secret key for server-side operations
- `STRIPE_WEBHOOK_SECRET`: Secret for validating Stripe webhook events

**IMPORTANT: Never commit these sensitive keys to version control. Set them directly in your deployment environment.**

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/18fe4a63-1fa5-41ca-b3c0-2ca423fcde0e) and click on Share -> Publish.

For Vercel deployment:
1. Connect your GitHub repository to Vercel
2. Set up the required environment variables in Vercel project settings
3. Use the `vercel deploy` command or connect your GitHub repository for automatic deployments

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
