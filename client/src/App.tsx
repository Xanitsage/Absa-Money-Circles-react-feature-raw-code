
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Component, ErrorInfo, ReactNode } from "react";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Circles from "@/pages/Circles";
import CreateCircle from "@/pages/CreateCircle";
import CircleDetail from "@/pages/CircleDetail";
import Profile from "@/pages/Profile";
import Pay from "@/pages/Pay";
import AbsaAppHome from "@/pages/AbsaAppHome";
import Notifications from "@/pages/Notifications";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <h2>Something went wrong.</h2>
          <button 
            className="mt-2 px-4 py-2 bg-primary text-white rounded"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function Router() {
  return (
    <Switch>
      <Route path="/absa-app" component={AbsaAppHome} />
      <Route path="*">
        <Layout>
          <ErrorBoundary>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/circles" component={Circles} />
              <Route path="/create" component={CreateCircle} />
              <Route path="/circle/:id" component={CircleDetail} />
              <Route path="/profile" component={Profile} />
              <Route path="/pay" component={Pay} />
              <Route path="/notifications" component={Notifications} />
              <Route component={NotFound} />
            </Switch>
          </ErrorBoundary>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
