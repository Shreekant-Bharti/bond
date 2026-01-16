import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BondProvider } from "@/context/BondContext";

import Splash from "./pages/Splash";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AccountPending from "./pages/AccountPending";
import InvestorDashboard from "./pages/investor/InvestorDashboard";
import InvestorBonds from "./pages/investor/InvestorBonds";
import InvestorPortfolio from "./pages/investor/InvestorPortfolio";
import InvestorWallet from "./pages/investor/InvestorWallet";
import InvestorTransactions from "./pages/investor/InvestorTransactions";
import InvestorSettings from "./pages/investor/InvestorSettings";
import InvestorSupport from "./pages/investor/InvestorSupport";
import InvestorCalculator from "./pages/investor/InvestorCalculator";
import InvestorSecondaryMarket from "./pages/investor/InvestorSecondaryMarket";
import BrokerDashboard from "./pages/broker/BrokerDashboard";
import BrokerProfile from "./pages/broker/BrokerProfile";
import BrokerSupport from "./pages/broker/BrokerSupport";
import BrokerListedBonds from "./pages/broker/BrokerListedBonds";
import BrokerInvestors from "./pages/broker/BrokerInvestors";
import BrokerDemand from "./pages/broker/BrokerDemand";
import BrokerCreateListing from "./pages/broker/BrokerCreateListing";
import BrokerSettings from "./pages/broker/BrokerSettings";
import BrokerWallet from "./pages/broker/BrokerWallet";
import CustodianDashboard from "./pages/custodian/CustodianDashboard";
import FIDashboard from "./pages/fi/FIDashboard";
import GovDashboard from "./pages/gov/GovDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPendingUsers from "./pages/admin/AdminPendingUsers";
import AdminPendingBonds from "./pages/admin/AdminPendingBonds";
import AdminTokenAnalytics from "./pages/admin/AdminTokenAnalytics";
import AdminAllUsers from "./pages/admin/AdminAllUsers";
import AdminBondAnalytics from "./pages/admin/AdminBondAnalytics";
import HackathonDemo from "./pages/HackathonDemo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BondProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* BondFi Hackathon MVP - Demo Route */}
            <Route path="/demo" element={<HackathonDemo />} />
            <Route path="/" element={<Splash />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/account-pending" element={<AccountPending />} />
            {/* Admin Routes - Internal Only */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route
              path="/admin/pending-users"
              element={<AdminPendingUsers />}
            />
            <Route
              path="/admin/pending-bonds"
              element={<AdminPendingBonds />}
            />
            <Route
              path="/admin/token-analytics"
              element={<AdminTokenAnalytics />}
            />
            <Route path="/admin/all-users" element={<AdminAllUsers />} />
            <Route
              path="/admin/bond-analytics"
              element={<AdminBondAnalytics />}
            />
            {/* Investor Routes */}
            <Route path="/investor" element={<InvestorDashboard />} />
            <Route path="/investor/bonds" element={<InvestorBonds />} />
            <Route path="/investor/portfolio" element={<InvestorPortfolio />} />
            <Route path="/investor/wallet" element={<InvestorWallet />} />
            <Route
              path="/investor/transactions"
              element={<InvestorTransactions />}
            />
            <Route path="/investor/settings" element={<InvestorSettings />} />
            <Route path="/investor/support" element={<InvestorSupport />} />
            <Route
              path="/investor/calculator"
              element={<InvestorCalculator />}
            />
            <Route
              path="/investor/secondary-market"
              element={<InvestorSecondaryMarket />}
            />
            {/* Broker Routes */}
            <Route path="/broker" element={<BrokerDashboard />} />
            <Route path="/broker/create" element={<BrokerCreateListing />} />
            <Route path="/broker/listings" element={<BrokerListedBonds />} />
            <Route path="/broker/investors" element={<BrokerInvestors />} />
            <Route path="/broker/demand" element={<BrokerDemand />} />
            <Route path="/broker/wallet" element={<BrokerWallet />} />
            <Route path="/broker/profile" element={<BrokerProfile />} />
            <Route path="/broker/support" element={<BrokerSupport />} />
            <Route path="/broker/settings" element={<BrokerSettings />} />
            <Route path="/custodian" element={<CustodianDashboard />} />
            <Route path="/custodian/*" element={<CustodianDashboard />} />
            <Route path="/fi" element={<FIDashboard />} />
            <Route path="/fi/*" element={<FIDashboard />} />
            <Route path="/gov" element={<GovDashboard />} />
            <Route path="/gov/*" element={<GovDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </BondProvider>
  </QueryClientProvider>
);

export default App;
