/**
 * Main application component for Plaiground.
 * Sets up routing and global providers for the application.
 */

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SearchResults from "@/pages/search-results";

/**
 * Router component that defines the application routes
 * - / : Home page
 * - /search : Search results page
 * - * : Not found page (404)
 */
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={SearchResults} />
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * Root App component that wraps the application with necessary providers:
 * - QueryClientProvider: For managing API requests and caching
 * - Router: For handling client-side routing
 * - Toaster: For displaying toast notifications
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
