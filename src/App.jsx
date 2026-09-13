import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import toast, { Toaster } from "react-hot-toast";

import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrentUserProvider } from "@/contexts/CurrentUserContext";

import Account from "@/pages/Account";
import Additive from "@/pages/Additive";
import Additives from "@/pages/Additives";
import ApiClients from "@/pages/ApiClients";
import Brand from "@/pages/Brand";
import Brands from "@/pages/Brands";
import Checkings from "@/pages/Checkings";
import Cosmetics from "@/pages/Cosmetics";
import Dashboard from "@/pages/Dashboard";
import ErrorReports from "@/pages/ErrorReports";
import ForgotPassword from "@/pages/ForgotPassword";
import HouseholdCleaners from "@/pages/HouseholdCleaners";
import InterestingProducts from "@/pages/InterestingProducts";
import Login from "@/pages/Login";
import ConfirmEmailChange from "@/pages/ConfirmEmailChange";
import PageNotFound from "@/pages/PageNotFound";
import Partner from "@/pages/Partner";
import PartnerCategories from "@/pages/PartnerCategories";
import Partners from "@/pages/Partners";
import PlacesValidator from "@/pages/PlacesValidator";
import Product from "@/pages/Product";
import ProductCategories from "@/pages/ProductCategories";
import Products from "@/pages/Products";
import Register from "@/pages/Register";
import ResetPassword from "@/pages/ResetPassword";
import ScoringCategories from "@/pages/ScoringCategories";
import ShopReviews from "@/pages/ShopReviews";
import Users from "@/pages/Users";
import Validator from "@/pages/Validator";

import ProtectedRoute from "@/ui/ProtectedRoute";
import ProtectedRouteRole from "@/ui/ProtectedRouteRole";
import AppLayout from "@/ui/AppLayout";

import GlobalStyles from "@/styles/GlobalStyles";

function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0,
            retry: (failureCount, error) => {
              if (error.response?.status === 401) {
                return false; // do not retry, trigger error
              }
              // otherwise, restore default
              const defaultRetry = new QueryClient().getDefaultOptions().queries
                ?.retry;
              return Number.isSafeInteger(defaultRetry)
                ? failureCount < (defaultRetry ?? 0)
                : false;
            },
          },
        },
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (error.response?.status !== 401) {
              toast.error(
                query?.meta?.errorMessage ||
                  `Une erreur est survenue. Veuillez réessayer utlérieurement ou contacter le support si le problème persiste`,
              );
            }
          },
        }),
        mutationCache: new MutationCache({
          onSuccess: () => {
            queryClient.invalidateQueries();
          },
        }),
      }),
  );

  return (
    <AuthProvider>
      <DarkModeProvider>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <GlobalStyles />
          <BrowserRouter>
            <Routes>
              <Route
                element={
                  <CurrentUserProvider>
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  </CurrentUserProvider>
                }
              >
                <Route index element={<Navigate replace to="dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:productId" element={<Product />} />
                <Route
                  path="interesting-products"
                  element={
                    <ProtectedRouteRole role="admin">
                      <InterestingProducts />
                    </ProtectedRouteRole>
                  }
                />
                <Route
                  path="categories"
                  element={
                    <ProtectedRouteRole role="admin">
                      <ProductCategories />
                    </ProtectedRouteRole>
                  }
                />
                <Route path="brands" element={<Brands />} />
                <Route
                  path="brands/:brandId"
                  element={
                    <ProtectedRouteRole role="contributor">
                      <Brand />
                    </ProtectedRouteRole>
                  }
                />

                <Route
                  path="products/register/:productEan"
                  element={
                    <ProtectedRouteRole role="contributor">
                      <Register />
                    </ProtectedRouteRole>
                  }
                />
                <Route
                  path="verifications"
                  element={
                    <ProtectedRouteRole role="contributor">
                      <Validator />
                    </ProtectedRouteRole>
                  }
                />
                <Route
                  path="checkings"
                  element={
                    <ProtectedRouteRole role="contributor">
                      <Checkings />
                    </ProtectedRouteRole>
                  }
                />
                <Route path="additives" element={<Additives />} />
                <Route
                  path="additives/:additiveId"
                  element={
                    <ProtectedRouteRole role="contributor">
                      <Additive />
                    </ProtectedRouteRole>
                  }
                />
                <Route
                  path="household-cleaners"
                  element={<HouseholdCleaners />}
                />
                <Route path="cosmetics" element={<Cosmetics />} />
                <Route
                  path="partners/companies"
                  element={
                    <ProtectedRouteRole role="admin">
                      <Partners />
                    </ProtectedRouteRole>
                  }
                />
                <Route
                  path="partners/companies/:partnerId"
                  element={
                    <ProtectedRouteRole role="admin">
                      <Partner />
                    </ProtectedRouteRole>
                  }
                />
                <Route
                  path="partners/categories"
                  element={
                    <ProtectedRouteRole role="admin">
                      <PartnerCategories />
                    </ProtectedRouteRole>
                  }
                />

                <Route
                  path="scoring/categories"
                  element={
                    <ProtectedRouteRole role="admin">
                      <ScoringCategories />
                    </ProtectedRouteRole>
                  }
                />
                <Route
                  path="error-reports"
                  element={
                    <ProtectedRouteRole role="contributor">
                      <ErrorReports />
                    </ProtectedRouteRole>
                  }
                />
                <Route
                  path="shop-reviews"
                  element={
                    <ProtectedRouteRole role="admin">
                      <ShopReviews />
                    </ProtectedRouteRole>
                  }
                />
                <Route
                  path="places"
                  element={
                    <ProtectedRouteRole role="admin">
                      <PlacesValidator />
                    </ProtectedRouteRole>
                  }
                />
                <Route
                  path="users"
                  element={
                    <ProtectedRouteRole role="admin">
                      <Users />
                    </ProtectedRouteRole>
                  }
                />
                <Route
                  path="clients"
                  element={
                    <ProtectedRouteRole role="admin">
                      <ApiClients />
                    </ProtectedRouteRole>
                  }
                />
                <Route path="account" element={<Account />} />
              </Route>

              <Route path="login" element={<Login />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route
                path="confirm-email-change"
                element={<ConfirmEmailChange />}
              />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </BrowserRouter>

          <Toaster
            position="top-center"
            gutter={12}
            containerStyle={{ margin: "8px" }}
            toastOptions={{
              success: {
                duration: 3000,
              },
              error: {
                duration: 5000,
              },
              style: {
                fontSize: "16px",
                maxWidth: "500px",
                padding: "16px 24px",
                backgroundColor: "var(--color-grey-0)",
                color: "var(--color-grey-700)",
              },
            }}
          />
        </QueryClientProvider>
      </DarkModeProvider>
    </AuthProvider>
  );
}

export default App;
