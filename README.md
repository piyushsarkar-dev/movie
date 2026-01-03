# Free Streaming - Watch Movies Online

A modern, responsive, and feature-rich movie streaming application built with Next.js 14, Tailwind CSS, and Shadcn UI. This project allows users to browse trending, popular, and latest movies, search for their favorites with smart suggestions, and watch them instantly for free.

![Home Page](/public/p-one.png)

## 📸 Screenshots

### 1. Home Page

The landing page featuring a dynamic hero slider, trending movies, and infinite scrolling lists.
![Home Page](/public/p-one.png)

### 2. Smart Search

Real-time search suggestions as you type, similar to YouTube, helping you find movies faster.
![Search Bar](/public/p-two.png)

### 3. Search Results

Comprehensive search results grid with infinite scrolling.
![Search Results](/public/p-three.png)

### 4. Movie Player & Details

Full-screen responsive video player with detailed movie information, cast, and related recommendations.
![Movie Player](/public/p-four.png)

## ✨ Features

-   **🎥 Unlimited Streaming**: Watch thousands of movies for free without registration.
-   **♾️ Infinite Scrolling**: Browse endless lists of popular and trending movies.
-   **🔍 Smart Search**: Instant search suggestions with debounce for a smooth user experience.
-   **📱 Fully Responsive**: Optimized for all devices - Mobile, Tablet, and Desktop.
-   **⚡ High Performance**: Built on Next.js for lightning-fast page loads and SEO.
-   **🎨 Modern UI**: Beautiful dark-mode interface using Tailwind CSS and Shadcn UI.

## 🛠️ How It Works

This application aggregates data and content from two primary sources:

1.  **The Movie Database (TMDB) API**: Used to fetch all movie metadata, including titles, descriptions, posters, backdrops, ratings, and cast information.
2.  **VidSrc API**: Used to embed the video player for streaming the content.

**Note**: This project does not host any video content. It serves as a search engine and interface for publicly available streams.

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

-   **Node.js**: Version 18 or higher.
-   **Package Manager**: npm, pnpm, or bun.

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/piyushsarkar-dev/movie.git
    cd movie
    ```

2.  **Install dependencies**

    ```bash
    npm install
    # or
    pnpm install
    # or
    bun install
    ```

3.  **Set up Environment Variables**
    Create a `.env.local` file in the root directory and add the following keys:

    ```env
    NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
    NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
    NEXT_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
    NEXT_PUBLIC_TMDB_BACKDROP_BASE_URL=https://image.tmdb.org/t/p/original
    NEXT_PUBLIC_VIDSRC_BASE_URL=https://vidsrc.xyz/embed
    ```

    > **How to get a TMDB API Key:**
    >
    > 1. Go to [The Movie Database (TMDB)](https://www.themoviedb.org/).
    > 2. Sign up for a free account.
    > 3. Go to Settings > API.
    > 4. Create a new API key and copy it to your `.env.local` file.

4.  **Run the development server**

    ```bash
    npm run dev
    # or
    pnpm dev
    # or
    bun dev
    ```

5.  **Open your browser**
    Navigate to [http://localhost:3000](http://localhost:3000) to see the app running.

## 🌐 Deployment

The easiest way to deploy this app is using **Vercel**.

1.  Push your code to a GitHub repository.
2.  Go to [Vercel](https://vercel.com) and sign up/login.
3.  Click **"Add New Project"** and select your repository.
4.  In the **"Environment Variables"** section, add all the keys from your `.env.local` file.
5.  Click **"Deploy"**.

Your movie streaming site will be live in minutes!

## 🧰 Tech Stack

-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Components**: [Shadcn UI](https://ui.shadcn.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Data Fetching**: Server Actions & Fetch API

## 👨‍💻 Author

**Piyush Sarkar**

-   GitHub: [@piyushsarkar-dev](https://github.com/piyushsarkar-dev)

---

_Disclaimer: This project is for educational purposes only. The author does not endorse or promote piracy. Please respect copyright laws in your country._
