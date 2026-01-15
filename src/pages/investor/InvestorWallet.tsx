import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useBondContext } from "@/context/BondContext";
import { Wallet, ArrowRightLeft, CreditCard, CheckCircle2, Loader2, History, ArrowDownToLine, Building2, X, ChevronRight, DollarSign, TrendingUp, ShoppingCart, ArrowUpFromLine } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type WalletStep = 'main' | 'amount' | 'payment' | 'processing' | 'success';
type WithdrawStep = 'idle' | 'bank' | 'confirm' | 'processing' | 'success';
type HistoryView = 'closed' | 'list' | 'detail';

const CONVERSION_RATE = 83; // 1 USDT = ₹83

export default function InvestorWallet() {
  const { investor, addStablecoins, bankAccount, saveBankAccount, withdrawFunds, walletTransactions, availableForPayout } = useBondContext();
  const { toast } = useToast();
  const [step, setStep] = useState<WalletStep>('main');
  const [inputMode, setInputMode] = useState<'INR' | 'USDT'>('INR');
  const [inrAmount, setInrAmount] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');

  // Withdrawal state
  const [withdrawStep, setWithdrawStep] = useState<WithdrawStep>('idle');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankForm, setBankForm] = useState({
    accountHolderName: bankAccount?.accountHolderName || '',
    bankName: bankAccount?.bankName || '',
    accountNumber: bankAccount?.accountNumber || '',
    ifscCode: bankAccount?.ifscCode || '',
    accountType: bankAccount?.accountType || 'savings' as 'savings' | 'current',
  });

  // History state
  const [historyView, setHistoryView] = useState<HistoryView>('closed');
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  const handleInrChange = (value: string) => {
    setInrAmount(value);
    const numValue = parseFloat(value) || 0;
    setUsdtAmount((numValue / CONVERSION_RATE).toFixed(2));
  };

  const handleUsdtChange = (value: string) => {
    setUsdtAmount(value);
    const numValue = parseFloat(value) || 0;
    setInrAmount((numValue * CONVERSION_RATE).toFixed(2));
  };

  const handleConfirmPayment = () => {
    setStep('processing');
    setTimeout(() => {
      const finalUsdt = parseFloat(usdtAmount) || 0;
      addStablecoins(finalUsdt);
      setStep('success');
    }, 4000);
  };

  const handleReset = () => {
    setStep('main');
    setInrAmount('');
    setUsdtAmount('');
  };

  // Withdrawal handlers
  const handleWithdrawClick = () => {
    if (!bankAccount) {
      setWithdrawStep('bank');
    } else {
      setWithdrawStep('confirm');
    }
  };

  const handleSaveBankAccount = () => {
    if (!bankForm.accountHolderName || !bankForm.bankName || !bankForm.accountNumber || !bankForm.ifscCode) {
      toast({
        title: "Missing Information",
        description: "Please fill all bank account fields",
        variant: "destructive",
      });
      return;
    }
    saveBankAccount(bankForm);
    setWithdrawStep('confirm');
  };

  const handleConfirmWithdraw = async () => {
    const amount = parseFloat(withdrawAmount) || 0;
    if (amount <= 0 || amount > availableForPayout) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    setWithdrawStep('processing');
    const result = await withdrawFunds(amount);

    if (result.success) {
      setWithdrawStep('success');
    } else {
      toast({
        title: "Withdrawal Failed",
        description: result.error,
        variant: "destructive",
      });
      setWithdrawStep('idle');
    }
  };

  const handleCloseWithdraw = () => {
    setWithdrawStep('idle');
    setWithdrawAmount('');
  };

  // Transaction history handlers
  const selectedTx = selectedTxId ? walletTransactions.find(t => t.id === selectedTxId) : null;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <ShoppingCart className="w-4 h-4" />;
      case 'sale': return <TrendingUp className="w-4 h-4" />;
      case 'topup': return <ArrowDownToLine className="w-4 h-4" />;
      case 'withdrawal': return <ArrowUpFromLine className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'text-warning bg-warning/20';
      case 'sale': return 'text-success bg-success/20';
      case 'topup': return 'text-primary bg-primary/20';
      case 'withdrawal': return 'text-destructive bg-destructive/20';
      default: return 'text-muted-foreground bg-muted/20';
    }
  };

  return (
    <DashboardLayout title="Wallet" subtitle="Manage your stablecoin balance">
      {/* Main Wallet View */}
      {step === 'main' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Balance Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Stablecoin Balance */}
            <div className="relative rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stablecoins Balance</p>
                    <h2 className="text-2xl font-bold text-foreground">${investor.balance.toLocaleString()}</h2>
                  </div>
                </div>
                <GradientButton 
                  className="w-full hover:scale-[1.02] transition-transform duration-300"
                  onClick={() => setStep('amount')}
                >
                  Buy Stablecoins
                </GradientButton>
              </div>
            </div>

            {/* Available for Payout */}
            <div className="relative rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-transparent to-primary/5" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success/20 to-primary/20 flex items-center justify-center">
                    <ArrowDownToLine className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available for Payout</p>
                    <h2 className="text-2xl font-bold text-foreground">${availableForPayout.toLocaleString()}</h2>
                  </div>
                </div>
                <button
                  onClick={handleWithdrawClick}
                  disabled={availableForPayout <= 0}
                  className="w-full px-4 py-3 rounded-xl bg-success/20 text-success border border-success/30 hover:bg-success/30 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/20 border border-border/30">
            <ArrowRightLeft className="w-5 h-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Conversion Rate: <span className="text-foreground font-medium">1 USDT = ₹{CONVERSION_RATE}</span>
            </p>
          </div>

          {/* Quick Stats */}
          <div className="rounded-2xl border border-border/50 bg-card/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Quick Stats</h3>
              <button
                onClick={() => setHistoryView('list')}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <History className="w-4 h-4" />
                Transaction History
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                <p className="text-sm text-muted-foreground">INR Equivalent</p>
                <p className="text-xl font-bold text-foreground">₹{(investor.balance * CONVERSION_RATE).toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                <p className="text-sm text-muted-foreground">Currency</p>
                <p className="text-xl font-bold text-foreground">USDT</p>
              </div>
            </div>
          </div>

          {/* Bank Account Info */}
          {bankAccount && (
            <Card className="p-4 bg-muted/10 border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{bankAccount.bankName}</p>
                    <p className="text-xs text-muted-foreground">****{bankAccount.accountNumber.slice(-4)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setWithdrawStep('bank')}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Change Account
                </button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Amount Selection */}
      {step === 'amount' && (
        <div className="max-w-xl mx-auto">
          <button 
            onClick={() => setStep('main')}
            className="text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            ← Back to Wallet
          </button>

          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-8">
            <h3 className="text-xl font-bold text-foreground mb-2">Buy Stablecoins</h3>
            <p className="text-sm text-muted-foreground mb-6">Enter the amount you want to purchase</p>

            {/* Currency Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setInputMode('INR')}
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  inputMode === 'INR' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                Enter in INR
              </button>
              <button
                onClick={() => setInputMode('USDT')}
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  inputMode === 'USDT' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                Enter in USDT
              </button>
            </div>

            {/* Amount Inputs */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Amount in INR (₹)</label>
                <input
                  type="number"
                  value={inrAmount}
                  onChange={(e) => handleInrChange(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl bg-input border border-border text-foreground text-lg font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                  placeholder="0.00"
                  disabled={inputMode === 'USDT'}
                />
              </div>

              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Amount in USDT ($)</label>
                <input
                  type="number"
                  value={usdtAmount}
                  onChange={(e) => handleUsdtChange(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl bg-input border border-border text-foreground text-lg font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                  placeholder="0.00"
                  disabled={inputMode === 'INR'}
                />
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center mt-4">
              Rate: 1 USDT = ₹{CONVERSION_RATE}
            </p>

            <GradientButton 
              className="w-full mt-6 hover:scale-[1.02] transition-transform duration-300"
              onClick={() => setStep('payment')}
              disabled={!usdtAmount || parseFloat(usdtAmount) <= 0}
            >
              Continue to Payment
            </GradientButton>
          </div>
        </div>
      )}

      {/* Payment Method */}
      {step === 'payment' && (
        <div className="max-w-xl mx-auto">
          <button 
            onClick={() => setStep('amount')}
            className="text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            ← Back
          </button>

          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-8">
            <h3 className="text-xl font-bold text-foreground mb-2">Payment Details</h3>
            <p className="text-sm text-muted-foreground mb-6">Review your purchase and select payment method</p>

            {/* Order Summary */}
            <div className="p-5 rounded-xl bg-muted/20 border border-border/30 mb-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Order Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount (INR)</span>
                  <span className="text-foreground font-medium">₹{parseFloat(inrAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">You'll Receive</span>
                  <span className="text-foreground font-bold">{parseFloat(usdtAmount).toLocaleString()} USDT</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Exchange Rate</span>
                  <span className="text-muted-foreground">1 USDT = ₹{CONVERSION_RATE}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-medium text-muted-foreground">Select Payment Method</h4>
              <div
                onClick={() => setPaymentMethod('upi')}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                  paymentMethod === 'upi' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border/50 bg-muted/10 hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">₹</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">UPI Payment</p>
                    <p className="text-sm text-muted-foreground">Pay via Google Pay, PhonePe, etc.</p>
                  </div>
                </div>
              </div>
              <div
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                  paymentMethod === 'card' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border/50 bg-muted/10 hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Card Payment</p>
                    <p className="text-sm text-muted-foreground">Debit or Credit Card</p>
                  </div>
                </div>
              </div>
            </div>

            <GradientButton 
              className="w-full hover:scale-[1.02] transition-transform duration-300"
              onClick={handleConfirmPayment}
            >
              Confirm Payment
            </GradientButton>
          </div>
        </div>
      )}

      {/* Processing */}
      {step === 'processing' && (
        <div className="max-w-md mx-auto">
          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-10 text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Processing Payment</h3>
            <p className="text-muted-foreground">Please wait while we confirm your transaction...</p>
            
            <div className="mt-6 h-2 bg-border/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary animate-pulse rounded-full w-2/3" />
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {step === 'success' && (
        <div className="max-w-md mx-auto">
          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-10 text-center animate-scale-in">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center border border-green-500/30">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground mb-4">
              {parseFloat(usdtAmount).toLocaleString()} USDT has been added to your wallet
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              New Balance: <span className="text-foreground font-bold">${investor.balance.toLocaleString()}</span>
            </p>
            
            <GradientButton 
              className="w-full hover:scale-[1.02] transition-transform duration-300"
              onClick={handleReset}
            >
              Back to Wallet
            </GradientButton>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {withdrawStep !== 'idle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4 animate-scale-in">
            {/* Bank Account Form */}
            {withdrawStep === 'bank' && (
              <div className="rounded-2xl border border-border/50 bg-card p-8">
                <button
                  onClick={handleCloseWithdraw}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Bank Account</h3>
                    <p className="text-sm text-muted-foreground">{bankAccount ? 'Update' : 'Add'} your bank details</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Account Holder Name</label>
                    <input
                      type="text"
                      value={bankForm.accountHolderName}
                      onChange={(e) => setBankForm(prev => ({ ...prev, accountHolderName: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Bank Name</label>
                    <input
                      type="text"
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm(prev => ({ ...prev, bankName: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="HDFC Bank"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Account Number</label>
                    <input
                      type="text"
                      value={bankForm.accountNumber}
                      onChange={(e) => setBankForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="XXXX XXXX XXXX"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">IFSC Code</label>
                    <input
                      type="text"
                      value={bankForm.ifscCode}
                      onChange={(e) => setBankForm(prev => ({ ...prev, ifscCode: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="HDFC0001234"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Account Type</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setBankForm(prev => ({ ...prev, accountType: 'savings' }))}
                        className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                          bankForm.accountType === 'savings' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        Savings
                      </button>
                      <button
                        onClick={() => setBankForm(prev => ({ ...prev, accountType: 'current' }))}
                        className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                          bankForm.accountType === 'current' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        Current
                      </button>
                    </div>
                  </div>
                </div>

                <GradientButton className="w-full" onClick={handleSaveBankAccount}>
                  Save & Continue
                </GradientButton>
              </div>
            )}

            {/* Confirm Withdrawal */}
            {withdrawStep === 'confirm' && bankAccount && (
              <div className="rounded-2xl border border-border/50 bg-card p-8">
                <button
                  onClick={handleCloseWithdraw}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                    <ArrowDownToLine className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Withdraw Funds</h3>
                    <p className="text-sm text-muted-foreground">Available: ${availableForPayout.toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/20 border border-border/30 mb-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{bankAccount.bankName}</p>
                      <p className="text-xs text-muted-foreground">{bankAccount.accountHolderName} - ****{bankAccount.accountNumber.slice(-4)}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-sm text-muted-foreground mb-2 block">Withdrawal Amount ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-input border border-border text-foreground text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="0.00"
                      max={availableForPayout}
                    />
                  </div>
                  <button
                    onClick={() => setWithdrawAmount(availableForPayout.toString())}
                    className="text-sm text-primary hover:text-primary/80 mt-2"
                  >
                    Withdraw All
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCloseWithdraw}
                    className="flex-1 px-6 py-3 rounded-xl bg-muted/50 text-muted-foreground hover:bg-muted transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <GradientButton 
                    className="flex-1" 
                    onClick={handleConfirmWithdraw}
                    disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
                  >
                    Proceed Withdrawal
                  </GradientButton>
                </div>
              </div>
            )}

            {/* Processing Withdrawal */}
            {withdrawStep === 'processing' && (
              <div className="rounded-2xl border border-border/50 bg-card p-10 text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Processing withdrawal, please wait…</h3>
                <p className="text-muted-foreground text-sm">This may take a few seconds</p>
              </div>
            )}

            {/* Withdrawal Success */}
            {withdrawStep === 'success' && (
              <div className="rounded-2xl border border-border/50 bg-card p-10 text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center border border-green-500/30">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Amount sent to your bank account</h3>
                <p className="text-muted-foreground mb-6">${parseFloat(withdrawAmount).toLocaleString()} has been transferred</p>
                <GradientButton className="w-full" onClick={handleCloseWithdraw}>
                  Done
                </GradientButton>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {historyView !== 'closed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden animate-scale-in">
            {/* Transaction List */}
            {historyView === 'list' && (
              <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                <div className="p-6 border-b border-border/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Transaction History</h3>
                  </div>
                  <button
                    onClick={() => setHistoryView('closed')}
                    className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto">
                  {walletTransactions.length > 0 ? (
                    <div className="divide-y divide-border/30">
                      {walletTransactions.slice().reverse().map((tx) => (
                        <div
                          key={tx.id}
                          onClick={() => {
                            setSelectedTxId(tx.id);
                            setHistoryView('detail');
                          }}
                          className="p-4 hover:bg-muted/20 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTransactionColor(tx.type)}`}>
                              {getTransactionIcon(tx.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{tx.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(tx.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${
                                tx.type === 'topup' || tx.type === 'sale' ? 'text-success' : 'text-foreground'
                              }`}>
                                {tx.type === 'topup' || tx.type === 'sale' ? '+' : '-'}${tx.amount.toLocaleString()}
                              </p>
                              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-muted-foreground">No transactions yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Transaction Detail */}
            {historyView === 'detail' && selectedTx && (
              <div className="rounded-2xl border border-border/50 bg-card p-8">
                <button
                  onClick={() => setHistoryView('list')}
                  className="text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                  ← Back to History
                </button>

                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${getTransactionColor(selectedTx.type)}`}>
                  {getTransactionIcon(selectedTx.type)}
                </div>

                <h3 className="text-xl font-bold text-foreground text-center mb-2">
                  {selectedTx.type === 'topup' || selectedTx.type === 'sale' ? '+' : '-'}${selectedTx.amount.toLocaleString()}
                </h3>
                <p className="text-center text-muted-foreground mb-6 capitalize">{selectedTx.type}</p>

                <div className="space-y-4 p-4 rounded-xl bg-muted/20 border border-border/30">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="text-foreground">{new Date(selectedTx.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="text-foreground capitalize">{selectedTx.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="text-foreground font-medium">${selectedTx.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`capitalize ${selectedTx.status === 'completed' ? 'text-success' : 'text-warning'}`}>
                      {selectedTx.status}
                    </span>
                  </div>
                  {selectedTx.bondName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bond</span>
                      <span className="text-foreground">{selectedTx.bondName}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-muted/10 border border-border/20">
                  <p className="text-sm text-muted-foreground">{selectedTx.description}</p>
                </div>

                <GradientButton 
                  className="w-full mt-6" 
                  onClick={() => setHistoryView('closed')}
                >
                  Close
                </GradientButton>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
