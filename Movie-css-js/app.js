// API Configuration
const API_KEY = "YOUR_API_KEY"
const BASE_URL = "https://api.themoviedb.org/3"
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280"
const VIDSRC_BASE_URL = "https://vidsrc.cc"

// Mobile detection and optimized settings
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
const MIN_SEARCH_LENGTH = 2
const SCROLL_THRESHOLD = isMobile ? 800 : 1000

// Network configuration for mobile optimization
const NETWORK_CONFIG = {
  timeout: isMobile ? 15000 : 10000, // Longer timeout for mobile
  retryAttempts: 3,
  retryDelay: 1000,
  maxConcurrentRequests: isMobile ? 2 : 4,
}

// DOM Elements
const searchInput = document.getElementById("searchInput")
const searchBtn = document.getElementById("searchBtn")
const mediaModalElement = document.getElementById("mediaModal")
const playerModalElement = document.getElementById("playerModal")

// Bootstrap Modal Initialization
const bootstrap = window.bootstrap
const mediaModal = new bootstrap.Modal(mediaModalElement)
const playerModal = new bootstrap.Modal(playerModalElement)

// Global variables
let currentMedia = null
let currentSeasons = []
const currentSection = "home"
let isLoading = false
let scrollTimeout = null
const activeRequests = new Set()

// Pagination variables
const currentPages = {
  popularMovies: 1,
  popularTVShows: 1,
  moviesSection: 1,
  tvSection: 1,
  search: 1,
  genre: 1,
  trending: 1,
  comedy: 1,
  bengali: 1,
}

const hasMorePages = {
  popularMovies: true,
  popularTVShows: true,
  moviesSection: true,
  tvSection: true,
  search: true,
  genre: true,
  trending: true,
  comedy: true,
  bengali: true,
}

let currentSearchQuery = ""
let currentGenreId = null
let currentGenreName = ""

// Enhanced fetch function with timeout and retry logic
async function fetchWithRetry(url, options = {}, retries = NETWORK_CONFIG.retryAttempts) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), NETWORK_CONFIG.timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response
  } catch (error) {
    clearTimeout(timeoutId)

    if (retries > 0 && !controller.signal.aborted) {
      console.warn(`⚠️ Request failed, retrying... (${retries} attempts left)`)
      await new Promise((resolve) => setTimeout(resolve, NETWORK_CONFIG.retryDelay))
      return fetchWithRetry(url, options, retries - 1)
    }

    throw error
  }
}

// Request queue manager for mobile optimization
class RequestQueue {
  constructor(maxConcurrent = NETWORK_CONFIG.maxConcurrentRequests) {
    this.maxConcurrent = maxConcurrent
    this.running = 0
    this.queue = []
  }

  async add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject })
      this.process()
    })
  }

  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return
    }

    this.running++
    const { requestFn, resolve, reject } = this.queue.shift()

    try {
      const result = await requestFn()
      resolve(result)
    } catch (error) {
      reject(error)
    } finally {
      this.running--
      this.process()
    }
  }
}

const requestQueue = new RequestQueue()

// Function to show a section
function showSection(sectionId) {
  const sections = document.querySelectorAll(".content-section")
  sections.forEach((section) => {
    section.classList.remove("active")
  })

  // Hide hero section for non-home sections
  const heroSection = document.getElementById("heroSection")
  if (sectionId === "home") {
    heroSection.style.display = "block"
  } else {
    heroSection.style.display = "none"
  }

  const section = document.getElementById(sectionId + "Section")
  if (section) {
    section.classList.add("active")
  }

  // Load section data if needed
  if (sectionId === "movies") {
    loadMoviesSection()
  } else if (sectionId === "tv") {
    loadTVSection()
  }
}

// Go home function
function goHome() {
  showSection("home")
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Initializing Movie Streaming App")
  console.log("📱 Mobile device:", isMobile)
  console.log("🌐 Network timeout:", NETWORK_CONFIG.timeout + "ms")

  loadInitialData()
  setupEventListeners()
  setupInfiniteScroll()
  setupNetworkMonitoring()
  setupMovieRequestForm()
})

// Network monitoring for better error handling
function setupNetworkMonitoring() {
  if ("connection" in navigator) {
    const connection = navigator.connection
    console.log(`📶 Network: ${connection.effectiveType}, Downlink: ${connection.downlink}Mbps`)

    // Adjust timeout based on connection speed
    if (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g") {
      NETWORK_CONFIG.timeout = 25000
      NETWORK_CONFIG.maxConcurrentRequests = 1
    }
  }

  // Monitor online/offline status
  window.addEventListener("online", () => {
    console.log("📶 Back online - retrying failed requests")
    retryFailedSections()
  })

  window.addEventListener("offline", () => {
    console.log("📵 Gone offline")
  })
}

// Retry failed sections when back online
function retryFailedSections() {
  const failedSections = document.querySelectorAll(".error-state")
  failedSections.forEach((section) => {
    const retryBtn = section.querySelector(".retry-button")
    if (retryBtn) {
      retryBtn.click()
    }
  })
}

// Event Listeners - UPDATED WITHOUT AUTO-SEARCH
function setupEventListeners() {
  if (searchBtn) {
    searchBtn.addEventListener("click", performSearch)
  }

  if (searchInput) {
    // Only clear search results when input is completely empty
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim()

      if (query.length === 0) {
        showSection("home")
        currentSearchQuery = ""
      }
    })

    // Search only on Enter key press
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        performSearch()
      }
    })
  }

  // Tab change events
  const tvTab = document.getElementById("tv-tab")
  if (tvTab) {
    tvTab.addEventListener("shown.bs.tab", () => {
      const container = document.getElementById("popularTVShows")
      if (container && container.innerHTML.includes("Loading")) {
        loadPopularTVShows()
      }
    })
  }

  // Close player when modal is closed
  if (playerModalElement) {
    playerModalElement.addEventListener("hidden.bs.modal", () => {
      const iframe = document.getElementById("playerIframe")
      if (iframe) {
        iframe.src = ""
      }
    })
  }
}

// Setup Movie Request Form
function setupMovieRequestForm() {
  const form = document.getElementById("movieRequestForm")
  if (!form) return

  form.addEventListener("submit", async (e) => {
    e.preventDefault()
    
    const submitBtn = document.getElementById("submitBtn")
    const formMessage = document.getElementById("formMessage")
    
    // Add your Web3Forms API key to the form data
    const formData = new FormData(form)
    formData.append("access_key", "108ed3e8-e32f-4b50-be8e-2c59ee895c9a")

    // Disable submit button and show loading
    submitBtn.disabled = true
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...'
    
    try {
      // Send to Web3Forms
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Show success message
        formMessage.innerHTML = `
          <div class="alert alert-success">
            <i class="fas fa-check-circle me-2"></i>
            <strong>Request Submitted Successfully!</strong><br>
            Thank you for your movie request. We'll review it and try to add it to our collection soon.
          </div>
        `
        formMessage.style.display = "block"
        
        // Reset form
        form.reset()
        
        console.log("✅ Movie request submitted successfully")
      } else {
        throw new Error(result.message || "Submission failed")
      }
    } catch (error) {
      console.error("❌ Error submitting movie request:", error)
      
      // Show error message
      formMessage.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          <strong>Submission Failed!</strong><br>
          There was an error submitting your request. Please try again later.
        </div>
      `
      formMessage.style.display = "block"
    } finally {
      // Re-enable submit button
      submitBtn.disabled = false
      submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Submit Request'
      
      // Hide message after 5 seconds
      setTimeout(() => {
        formMessage.style.display = "none"
      }, 5000)
    }
  })
}

// Setup Infinite Scroll with mobile optimization
function setupInfiniteScroll() {
  let isScrolling = false

  window.addEventListener("scroll", () => {
    if (isScrolling || isLoading) return

    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - SCROLL_THRESHOLD) {
      isScrolling = true

      // Throttle scroll events for mobile
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(
        () => {
          isScrolling = false
        },
        isMobile ? 300 : 100,
      )

      const activeSection = document.querySelector(".content-section.active")
      if (!activeSection) return

      const sectionId = activeSection.id

      switch (sectionId) {
        case "homeSection":
          const activeTab = document.querySelector(".nav-link.active")
          if (activeTab && activeTab.id === "movies-tab" && hasMorePages.popularMovies) {
            loadMorePopularMovies()
          } else if (activeTab && activeTab.id === "tv-tab" && hasMorePages.popularTVShows) {
            loadMorePopularTVShows()
          }
          break
        case "moviesSection":
          if (hasMorePages.moviesSection) {
            loadMoreMoviesSection()
          }
          break
        case "tvSection":
          if (hasMorePages.tvSection) {
            loadMoreTVSection()
          }
          break
        case "searchSection":
          if (hasMorePages.search && currentSearchQuery) {
            loadMoreSearchResults()
          }
          break
        case "genreSection":
          if (hasMorePages.genre && currentGenreId) {
            loadMoreGenreResults()
          }
          break
      }
    }
  })
}

// Load Initial Data
async function loadInitialData() {
  try {
    console.log("📥 Loading initial data...")
    await Promise.all([loadTrendingMovies(), loadComedyMovies(), loadBengaliMovies(), loadPopularMovies()])
    console.log("✅ Initial data loaded successfully")
  } catch (error) {
    console.error("❌ Error loading initial data:", error)
  }
}

// Enhanced error display function
function showErrorState(container, message, retryFunction) {
  if (!container) return

  container.innerHTML = `
    <div class="col-12 text-center error-state">
      <div class="alert alert-warning">
        <i class="fas fa-exclamation-triangle mb-2"></i>
        <p class="mb-2">${message}</p>
        <button class="btn btn-primary btn-sm retry-button" onclick="${retryFunction}">
          <i class="fas fa-redo me-1"></i>Retry
        </button>
      </div>
    </div>
  `
}

// Load Trending Movies - COMPLETELY FIXED VERSION
async function loadTrendingMovies() {
  const container = document.getElementById("trendingMovies")
  if (!container) {
    console.error("❌ Trending movies container not found")
    return
  }

  try {
    console.log("🎬 Loading trending movies...")

    // Show loading state
    container.innerHTML = `
      <div class="col-12 text-center">
        <div class="loading">
          <div class="spinner"></div>
          <div>Loading trending movies...</div>
          <div class="small text-muted mt-1">This may take a moment on slower connections</div>
        </div>
      </div>
    `

    const endpoints = [
      { url: `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=en-US&page=1`, name: "trending weekly" },
      { url: `${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=en-US&page=1`, name: "trending daily" },
      { url: `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`, name: "popular movies" },
      { url: `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`, name: "now playing" },
      { url: `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`, name: "top rated" },
    ]

    let data = null
    let endpoint = ""

    for (const endpointObj of endpoints) {
      try {
        console.log(`🔄 Trying ${endpointObj.name}...`)

        const response = await requestQueue.add(() => fetchWithRetry(endpointObj.url))

        const responseData = await response.json()
        if (responseData.results && responseData.results.length > 0) {
          data = responseData
          endpoint = endpointObj.name
          console.log(`✅ Successfully loaded from ${endpointObj.name}`)
          break
        }
      } catch (error) {
        console.warn(`⚠️ ${endpointObj.name} failed:`, error.message)
        continue
      }
    }

    if (data && data.results && data.results.length > 0) {
      const moviesToShow = data.results.slice(0, 8)
      displayMedia(moviesToShow, container, "movie")
      hasMorePages.trending = currentPages.trending < (data.total_pages || 1)
      console.log(`✅ Displayed ${moviesToShow.length} trending movies from ${endpoint}`)
    } else {
      console.log("🔄 Using fallback movie list...")
      const fallbackMovies = await loadFallbackMovies()
      if (fallbackMovies.length > 0) {
        displayMedia(fallbackMovies, container, "movie")
        console.log(`✅ Displayed ${fallbackMovies.length} fallback movies`)
      } else {
        showErrorState(
          container,
          "Unable to load trending movies. Please check your internet connection.",
          "loadTrendingMovies()",
        )
      }
    }
  } catch (error) {
    console.error("❌ Critical error loading trending movies:", error)
    showErrorState(container, "Failed to load trending movies. Please try again.", "loadTrendingMovies()")
  }
}

// Enhanced fallback function
async function loadFallbackMovies() {
  const popularMovieIds = [550, 680, 155, 13, 122, 27205, 278, 238]
  const fallbackMovies = []

  for (const movieId of popularMovieIds) {
    try {
      const response = await requestQueue.add(() =>
        fetchWithRetry(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`),
      )

      if (response.ok) {
        const movie = await response.json()
        fallbackMovies.push(movie)
      }

      // Limit concurrent requests for mobile
      if (isMobile && fallbackMovies.length >= 4) break
    } catch (error) {
      console.warn(`Failed to load movie ${movieId}:`, error)
    }
  }

  return fallbackMovies
}

// Load Comedy Movies with enhanced error handling
async function loadComedyMovies() {
  const container = document.getElementById("comedyMovies")
  if (!container) return

  try {
    console.log("😄 Loading comedy movies...")

    const response = await requestQueue.add(() =>
      fetchWithRetry(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35&sort_by=popularity.desc&page=${currentPages.comedy}`,
      ),
    )

    const data = await response.json()
    displayMedia(data.results.slice(0, 8), container, "movie")
    hasMorePages.comedy = currentPages.comedy < data.total_pages
    console.log("✅ Comedy movies loaded")
  } catch (error) {
    console.error("❌ Error loading comedy movies:", error)
    showErrorState(container, "Failed to load comedy movies.", "loadComedyMovies()")
  }
}

// Load Bengali Movies with enhanced error handling
async function loadBengaliMovies() {
  const container = document.getElementById("bengaliMovies")
  if (!container) return

  try {
    console.log("🇧🇩 Loading Bengali movies...")

    const response = await requestQueue.add(() =>
      fetchWithRetry(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=bn&sort_by=popularity.desc&page=${currentPages.bengali}`,
      ),
    )

    const data = await response.json()
    displayMedia(data.results.slice(0, 8), container, "movie")
    hasMorePages.bengali = currentPages.bengali < data.total_pages
    console.log("✅ Bengali movies loaded")
  } catch (error) {
    console.error("❌ Error loading Bengali movies:", error)
    showErrorState(container, "Failed to load Bengali movies.", "loadBengaliMovies()")
  }
}

// Load Popular Movies with enhanced error handling
async function loadPopularMovies() {
  const container = document.getElementById("popularMovies")
  if (!container) return

  try {
    console.log("🔥 Loading popular movies...")

    const response = await requestQueue.add(() =>
      fetchWithRetry(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${currentPages.popularMovies}`),
    )

    const data = await response.json()
    displayMedia(data.results, container, "movie")
    hasMorePages.popularMovies = currentPages.popularMovies < data.total_pages
    console.log("✅ Popular movies loaded")
  } catch (error) {
    console.error("❌ Error loading popular movies:", error)
    showErrorState(container, "Failed to load popular movies.", "loadPopularMovies()")
  }
}

// Load More Popular Movies
async function loadMorePopularMovies() {
  if (isLoading || !hasMorePages.popularMovies) return

  isLoading = true
  const loadingElement = document.getElementById("moviesInfiniteLoading")
  if (loadingElement) loadingElement.classList.add("show")

  try {
    currentPages.popularMovies++
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${currentPages.popularMovies}`,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    appendMedia(data.results, document.getElementById("popularMovies"), "movie")
    hasMorePages.popularMovies = currentPages.popularMovies < data.total_pages
  } catch (error) {
    console.error("❌ Error loading more popular movies:", error)
    currentPages.popularMovies--
  } finally {
    isLoading = false
    if (loadingElement) loadingElement.classList.remove("show")
  }
}

// Load Popular TV Shows
async function loadPopularTVShows() {
  const container = document.getElementById("popularTVShows")
  if (!container) return

  try {
    console.log("📺 Loading popular TV shows...")
    const response = await fetch(
      `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US&page=${currentPages.popularTVShows}`,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    displayMedia(data.results, container, "tv")
    hasMorePages.popularTVShows = currentPages.popularTVShows < data.total_pages
    console.log("✅ Popular TV shows loaded")
  } catch (error) {
    console.error("❌ Error loading popular TV shows:", error)
    container.innerHTML = '<div class="col-12 text-center"><p>Error loading TV shows.</p></div>'
  }
}

// Load More Popular TV Shows
async function loadMorePopularTVShows() {
  if (isLoading || !hasMorePages.popularTVShows) return

  isLoading = true
  const loadingElement = document.getElementById("tvInfiniteLoading")
  if (loadingElement) loadingElement.classList.add("show")

  try {
    currentPages.popularTVShows++
    const response = await fetch(
      `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US&page=${currentPages.popularTVShows}`,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    appendMedia(data.results, document.getElementById("popularTVShows"), "tv")
    hasMorePages.popularTVShows = currentPages.popularTVShows < data.total_pages
  } catch (error) {
    console.error("❌ Error loading more popular TV shows:", error)
    currentPages.popularTVShows--
  } finally {
    isLoading = false
    if (loadingElement) loadingElement.classList.remove("show")
  }
}

// Load Movies Section
async function loadMoviesSection() {
  const container = document.getElementById("moviesGrid")
  if (!container || !container.innerHTML.includes("Loading")) return

  try {
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${currentPages.moviesSection}`,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    displayMedia(data.results, container, "movie")
    hasMorePages.moviesSection = currentPages.moviesSection < data.total_pages
  } catch (error) {
    console.error("❌ Error loading movies section:", error)
    container.innerHTML = '<div class="col-12 text-center"><p>Error loading movies.</p></div>'
  }
}

// Load More Movies Section
async function loadMoreMoviesSection() {
  if (isLoading || !hasMorePages.moviesSection) return

  isLoading = true
  const loadingElement = document.getElementById("moviesSectionInfiniteLoading")
  if (loadingElement) loadingElement.classList.add("show")

  try {
    currentPages.moviesSection++
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${currentPages.moviesSection}`,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    appendMedia(data.results, document.getElementById("moviesGrid"), "movie")
    hasMorePages.moviesSection = currentPages.moviesSection < data.total_pages
  } catch (error) {
    console.error("❌ Error loading more movies:", error)
    currentPages.moviesSection--
  } finally {
    isLoading = false
    if (loadingElement) loadingElement.classList.remove("show")
  }
}

// Load TV Section
async function loadTVSection() {
  const container = document.getElementById("tvGrid")
  if (!container || !container.innerHTML.includes("Loading")) return

  try {
    const response = await fetch(
      `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US&page=${currentPages.tvSection}`,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    displayMedia(data.results, container, "tv")
    hasMorePages.tvSection = currentPages.tvSection < data.total_pages
  } catch (error) {
    console.error("❌ Error loading TV section:", error)
    container.innerHTML = '<div class="col-12 text-center"><p>Error loading TV shows.</p></div>'
  }
}

// Load More TV Section
async function loadMoreTVSection() {
  if (isLoading || !hasMorePages.tvSection) return

  isLoading = true
  const loadingElement = document.getElementById("tvSectionInfiniteLoading")
  if (loadingElement) loadingElement.classList.add("show")

  try {
    currentPages.tvSection++
    const response = await fetch(
      `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US&page=${currentPages.tvSection}`,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    appendMedia(data.results, document.getElementById("tvGrid"), "tv")
    hasMorePages.tvSection = currentPages.tvSection < data.total_pages
  } catch (error) {
    console.error("❌ Error loading more TV shows:", error)
    currentPages.tvSection--
  } finally {
    isLoading = false
    if (loadingElement) loadingElement.classList.remove("show")
  }
}

// Perform Search - MANUAL SEARCH ONLY
async function performSearch() {
  if (!searchInput) return

  const query = searchInput.value.trim()
  if (!query || query.length < MIN_SEARCH_LENGTH) {
    alert(`Please enter at least ${MIN_SEARCH_LENGTH} characters to search.`)
    return
  }

  console.log("🔍 Manual search initiated for:", query)
  currentSearchQuery = query
  currentPages.search = 1
  hasMorePages.search = true

  showSection("search")
  const searchTitle = document.getElementById("searchTitle")
  if (searchTitle) {
    searchTitle.textContent = `Search Results for "${query}"`
  }

  const container = document.getElementById("searchResults")
  if (!container) return

  container.innerHTML = '<div class="loading"><div class="spinner"></div>Searching...</div>'

  try {
    // Use Promise.allSettled for better error handling
    const [movieResult, tvResult] = await Promise.allSettled([
      fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${currentPages.search}`,
      ),
      fetch(
        `${BASE_URL}/search/tv?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${currentPages.search}`,
      ),
    ])

    let movieData = { results: [], total_pages: 0 }
    let tvData = { results: [], total_pages: 0 }

    // Handle movie search results
    if (movieResult.status === "fulfilled" && movieResult.value.ok) {
      movieData = await movieResult.value.json()
    } else {
      console.warn("⚠️ Movie search failed:", movieResult.reason)
    }

    // Handle TV search results
    if (tvResult.status === "fulfilled" && tvResult.value.ok) {
      tvData = await tvResult.value.json()
    } else {
      console.warn("⚠️ TV search failed:", tvResult.reason)
    }

    const combinedResults = [
      ...movieData.results.map((item) => ({ ...item, media_type: "movie" })),
      ...tvData.results.map((item) => ({ ...item, media_type: "tv" })),
    ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))

    if (combinedResults.length === 0) {
      container.innerHTML =
        '<div class="col-12 text-center"><p>No results found for your search. Try different keywords.</p></div>'
      hasMorePages.search = false
    } else {
      displayMedia(combinedResults, container, "mixed")
      hasMorePages.search = currentPages.search < Math.max(movieData.total_pages, tvData.total_pages)
      console.log(`✅ Search completed. Found ${combinedResults.length} results`)
    }
  } catch (error) {
    console.error("❌ Search error:", error)
    container.innerHTML =
      '<div class="col-12 text-center"><p>Search failed. Please check your connection and try again.</p></div>'
  }
}

// Load More Search Results
async function loadMoreSearchResults() {
  if (isLoading || !hasMorePages.search || !currentSearchQuery) return

  isLoading = true
  const loadingElement = document.getElementById("searchInfiniteLoading")
  if (loadingElement) loadingElement.classList.add("show")

  try {
    currentPages.search++
    const [movieResponse, tvResponse] = await Promise.all([
      fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(currentSearchQuery)}&page=${currentPages.search}`,
      ),
      fetch(
        `${BASE_URL}/search/tv?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(currentSearchQuery)}&page=${currentPages.search}`,
      ),
    ])

    if (!movieResponse.ok || !tvResponse.ok) {
      throw new Error("Search request failed")
    }

    const movieData = await movieResponse.json()
    const tvData = await tvResponse.json()

    const combinedResults = [
      ...movieData.results.map((item) => ({ ...item, media_type: "movie" })),
      ...tvData.results.map((item) => ({ ...item, media_type: "tv" })),
    ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))

    if (combinedResults.length > 0) {
      appendMedia(combinedResults, document.getElementById("searchResults"), "mixed")
    }

    hasMorePages.search = currentPages.search < Math.max(movieData.total_pages, tvData.total_pages)
  } catch (error) {
    console.error("❌ Error loading more search results:", error)
    currentPages.search--
  } finally {
    isLoading = false
    if (loadingElement) loadingElement.classList.remove("show")
  }
}

// Filter by Genre
async function filterByGenre(genreId, genreName) {
  currentGenreId = genreId
  currentGenreName = genreName
  currentPages.genre = 1
  hasMorePages.genre = true

  showSection("genre")
  const genreTitle = document.getElementById("genreTitle")
  if (genreTitle) {
    genreTitle.textContent = `${genreName} Movies & TV Shows`
  }

  const container = document.getElementById("genreResults")
  if (!container) return

  container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>'

  try {
    const [movieResponse, tvResponse] = await Promise.all([
      fetch(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${currentPages.genre}`,
      ),
      fetch(
        `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${currentPages.genre}`,
      ),
    ])

    if (!movieResponse.ok || !tvResponse.ok) {
      throw new Error("Genre filter request failed")
    }

    const movieData = await movieResponse.json()
    const tvData = await tvResponse.json()

    const combinedResults = [
      ...movieData.results.map((item) => ({ ...item, media_type: "movie" })),
      ...tvData.results.map((item) => ({ ...item, media_type: "tv" })),
    ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))

    if (combinedResults.length === 0) {
      container.innerHTML = '<div class="col-12 text-center"><p>No content found for this genre.</p></div>'
      hasMorePages.genre = false
    } else {
      displayMedia(combinedResults, container, "mixed")
      hasMorePages.genre = currentPages.genre < Math.max(movieData.total_pages, tvData.total_pages)
    }
  } catch (error) {
    console.error("❌ Error filtering by genre:", error)
    container.innerHTML = '<div class="col-12 text-center"><p>Error loading content. Please try again later.</p></div>'
  }
}

// Load More Genre Results
async function loadMoreGenreResults() {
  if (isLoading || !hasMorePages.genre || !currentGenreId) return

  isLoading = true
  const loadingElement = document.getElementById("genreInfiniteLoading")
  if (loadingElement) loadingElement.classList.add("show")

  try {
    currentPages.genre++
    const [movieResponse, tvResponse] = await Promise.all([
      fetch(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${currentGenreId}&sort_by=popularity.desc&page=${currentPages.genre}`,
      ),
      fetch(
        `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${currentGenreId}&sort_by=popularity.desc&page=${currentPages.genre}`,
      ),
    ])

    if (!movieResponse.ok || !tvResponse.ok) {
      throw new Error("Genre filter request failed")
    }

    const movieData = await movieResponse.json()
    const tvData = await tvResponse.json()

    const combinedResults = [
      ...movieData.results.map((item) => ({ ...item, media_type: "movie" })),
      ...tvData.results.map((item) => ({ ...item, media_type: "tv" })),
    ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))

    if (combinedResults.length > 0) {
      appendMedia(combinedResults, document.getElementById("genreResults"), "mixed")
    }

    hasMorePages.genre = currentPages.genre < Math.max(movieData.total_pages, tvData.total_pages)
  } catch (error) {
    console.error("❌ Error loading more genre results:", error)
    currentPages.genre--
  } finally {
    isLoading = false
    if (loadingElement) loadingElement.classList.remove("show")
  }
}

// Display Media - IMPROVED VERSION
function displayMedia(mediaList, container, type) {
  if (!container || !mediaList) {
    console.error("❌ Invalid container or media list")
    return
  }

  try {
    if (mediaList.length === 0) {
      container.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No content available.</p></div>'
      return
    }

    const mediaHTML = mediaList.map((media) => createMediaHTML(media, type)).join("")
    container.innerHTML = mediaHTML
    console.log(`✅ Displayed ${mediaList.length} media items`)
  } catch (error) {
    console.error("❌ Error displaying media:", error)
    container.innerHTML = '<div class="col-12 text-center"><p class="text-danger">Error displaying content.</p></div>'
  }
}

// Append Media (for infinite scroll)
function appendMedia(mediaList, container, type) {
  if (!container || !mediaList) return

  try {
    const mediaHTML = mediaList.map((media) => createMediaHTML(media, type)).join("")
    container.insertAdjacentHTML("beforeend", mediaHTML)
    console.log(`✅ Appended ${mediaList.length} more media items`)
  } catch (error) {
    console.error("❌ Error appending media:", error)
  }
}

// Create Media HTML - IMPROVED VERSION
function createMediaHTML(media, type) {
  try {
    const posterUrl = media.poster_path
      ? `${IMAGE_BASE_URL}${media.poster_path}`
      : "/placeholder.svg?height=450&width=300"

    const rating = media.vote_average ? media.vote_average.toFixed(1) : "N/A"
    const title = media.title || media.name || "Unknown Title"
    const releaseDate = media.release_date || media.first_air_date
    const year = releaseDate ? new Date(releaseDate).getFullYear() : "Unknown"
    const mediaType = media.media_type || type

    return `
      <div class="media-card" onclick="showMediaDetails(${media.id}, '${mediaType}')">
        <div class="media-poster-container">
          <img src="${posterUrl}" 
               alt="${title}" 
               class="media-poster" 
               loading="lazy" 
               onerror="this.src='/placeholder.svg?height=450&width=300'; this.onerror=null;">
          <div class="media-overlay">
            <i class="fas fa-play play-icon"></i>
          </div>
          ${type === "mixed" ? `<span class="media-type-badge">${mediaType.toUpperCase()}</span>` : ""}
        </div>
        <div class="media-info">
          <h3 class="media-title">${title}</h3>
          <div class="media-rating">
            <div class="rating-stars">
              <i class="fas fa-star"></i>
              <span>${rating}</span>
            </div>
            <span class="media-year">${year}</span>
          </div>
        </div>
      </div>
    `
  } catch (error) {
    console.error("❌ Error creating media HTML:", error)
    return '<div class="media-card error">Error loading content</div>'
  }
}

// Show Media Details
async function showMediaDetails(mediaId, mediaType) {
  try {
    console.log(`🎬 Loading details for ${mediaType} ID: ${mediaId}`)

    const endpoint = mediaType === "movie" ? "movie" : "tv"
    const response = await fetch(
      `${BASE_URL}/${endpoint}/${mediaId}?api_key=${API_KEY}&language=en-US&append_to_response=credits`,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const media = await response.json()
    currentMedia = { ...media, media_type: mediaType }

    const backdropUrl = media.backdrop_path
      ? `${BACKDROP_BASE_URL}${media.backdrop_path}`
      : "/placeholder.svg?height=300&width=800"

    const genres = media.genres
      ? media.genres.map((genre) => `<span class="genre-badge">${genre.name}</span>`).join("")
      : ""

    const director =
      media.credits && media.credits.crew ? media.credits.crew.find((person) => person.job === "Director") : null
    const cast =
      media.credits && media.credits.cast
        ? media.credits.cast
            .slice(0, 5)
            .map((actor) => actor.name)
            .join(", ")
        : ""

    const title = media.title || media.name
    const releaseDate = media.release_date || media.first_air_date
    const year = releaseDate ? new Date(releaseDate).getFullYear() : "Unknown"

    let watchButton = ""
    let seasonSelector = ""

    if (mediaType === "movie") {
      watchButton = `<button class="watch-btn" onclick="playMedia(${mediaId}, 'movie')">
                <i class="fas fa-play"></i>Watch Movie
            </button>`
    } else {
      currentSeasons = media.seasons || []
      if (currentSeasons.length > 0) {
        const firstSeason = currentSeasons.find((s) => s.season_number > 0) || currentSeasons[0]
        seasonSelector = `
                    <div class="season-selector mb-3">
                        <label for="seasonSelect" class="form-label"><strong>Select Season:</strong></label>
                        <select class="form-select" id="seasonSelect" onchange="loadEpisodes(${mediaId}, this.value)">
                            ${currentSeasons
                              .map(
                                (season) =>
                                  `<option value="${season.season_number}" ${season.season_number === firstSeason.season_number ? "selected" : ""}>
                                    Season ${season.season_number} (${season.episode_count} episodes)
                                </option>`,
                              )
                              .join("")}
                        </select>
                    </div>
                    <div id="episodesList"></div>
                `
      }
    }

    const modalContent = `
            <img src="${backdropUrl}" alt="${title}" class="media-backdrop" onerror="this.src='/placeholder.svg?height=300&width=800'">
            <h4>${title}</h4>
            <div class="mb-3">
                <div class="d-flex align-items-center mb-2 flex-wrap">
                    <div class="rating-stars me-3">
                        <i class="fas fa-star"></i>
                        <span>${media.vote_average ? media.vote_average.toFixed(1) : "N/A"}/10</span>
                    </div>
                    <span class="me-3"><i class="fas fa-calendar me-1"></i>${year}</span>
                    ${media.runtime ? `<span class="me-3"><i class="fas fa-clock me-1"></i>${media.runtime} min</span>` : ""}
                    ${media.number_of_seasons ? `<span class="me-3"><i class="fas fa-list me-1"></i>${media.number_of_seasons} seasons</span>` : ""}
                </div>
                <div class="mb-3">${genres}</div>
                ${watchButton}
            </div>
            <p><strong>Overview:</strong> ${media.overview || "No overview available."}</p>
            ${director ? `<p><strong>Director:</strong> ${director.name}</p>` : ""}
            ${cast ? `<p><strong>Cast:</strong> ${cast}</p>` : ""}
            ${seasonSelector}
        `

    const modalTitle = document.getElementById("modalTitle")
    const modalBody = document.getElementById("modalBody")

    if (modalTitle) modalTitle.textContent = title
    if (modalBody) modalBody.innerHTML = modalContent

    mediaModal.show()

    if (mediaType === "tv" && currentSeasons.length > 0) {
      const firstSeason = currentSeasons.find((s) => s.season_number > 0) || currentSeasons[0]
      loadEpisodes(mediaId, firstSeason.season_number)
    }

    console.log("✅ Media details loaded successfully")
  } catch (error) {
    console.error("❌ Error loading media details:", error)
    alert("Error loading details. Please try again.")
  }
}

// Load Episodes for TV Show
async function loadEpisodes(tvId, seasonNumber) {
  try {
    console.log(`📺 Loading episodes for TV ${tvId}, Season ${seasonNumber}`)

    const response = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&language=en-US`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const seasonData = await response.json()
    const episodesList = document.getElementById("episodesList")
    if (!episodesList) return

    if (seasonData.episodes && seasonData.episodes.length > 0) {
      const episodesHTML = seasonData.episodes
        .map(
          (episode) => `
                <div class="episode-card" onclick="playMedia(${tvId}, 'tv', ${seasonNumber}, ${episode.episode_number})">
                    <h6>Episode ${episode.episode_number}: ${episode.name}</h6>
                    <p class="small text-muted">${episode.overview ? episode.overview.substring(0, 100) + "..." : "No description available"}</p>
                    <div class="small">
                        <i class="fas fa-calendar me-1"></i>${episode.air_date || "TBA"}
                        ${episode.runtime ? `<span class="ms-2"><i class="fas fa-clock me-1"></i>${episode.runtime} min</span>` : ""}
                    </div>
                </div>
            `,
        )
        .join("")

      episodesList.innerHTML = `
                <h6 class="mt-3 mb-3">Episodes:</h6>
                <div class="episode-grid">${episodesHTML}</div>
            `

      console.log(`✅ Loaded ${seasonData.episodes.length} episodes`)
    } else {
      episodesList.innerHTML = '<p class="text-muted">No episodes available for this season.</p>'
    }
  } catch (error) {
    console.error("❌ Error loading episodes:", error)
    const episodesList = document.getElementById("episodesList")
    if (episodesList) {
      episodesList.innerHTML = '<p class="text-muted">Error loading episodes.</p>'
    }
  }
}

// Play Media using Vidsrc
function playMedia(mediaId, mediaType, season = null, episode = null) {
  let vidsrcUrl = ""
  let playerTitle = ""

  if (mediaType === "movie") {
    vidsrcUrl = `${VIDSRC_BASE_URL}/v2/embed/movie/${mediaId}?autoPlay=true`
    playerTitle = `Playing: ${currentMedia.title || "Movie"}`
  } else if (mediaType === "tv" && season !== null && episode !== null) {
    vidsrcUrl = `${VIDSRC_BASE_URL}/v2/embed/tv/${mediaId}/${season}/${episode}?autoPlay=true`
    playerTitle = `Playing: ${currentMedia.name || "TV Show"} - S${season}E${episode}`
  }

  if (vidsrcUrl) {
    const playerIframe = document.getElementById("playerIframe")
    const playerTitleElement = document.getElementById("playerTitle")

    if (playerIframe) playerIframe.src = vidsrcUrl
    if (playerTitleElement) playerTitleElement.textContent = playerTitle

    mediaModal.hide()
    playerModal.show()

    console.log("▶️ Playing media:", playerTitle)
  }
}

// Disable right-click context menu
document.addEventListener("contextmenu", (e) => {
  e.preventDefault()
  alert("Bro its piyush website, right click is disabled.")
})

// Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
document.addEventListener("keydown", (e) => {
  // F12
  if (e.key === "F12") {
    e.preventDefault()
    alert("Inspect Element is disabled on this page.")
    return false
  }
  // Ctrl+Shift+I or Ctrl+Shift+J
  if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "i" || e.key === "j")) {
    e.preventDefault()
    alert("Inspect Element is disabled on this page.")
    return false
  }
  // Ctrl+U
  if (e.ctrlKey && (e.key === "U" || e.key === "u")) {
    e.preventDefault()
    alert("View Source is disabled on this page.")
    return false
  }
})
