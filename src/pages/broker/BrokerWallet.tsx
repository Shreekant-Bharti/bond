import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useBondContext } from "@/context/BondContext";
import { Wallet, ArrowDownToLine, Building2, X, ChevronRight, DollarSign, TrendingUp, ShoppingCart, ArrowUpFromLine, Loader2, CheckCircle2, History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type WithdrawStep = 'idle' | 'bank' | 'confirm' | 'processing' | 'success';
type HistoryView = 'closed' | 'list' | 'detail';

export default function BrokerWallet() {
  const { 
    broker, 
    bankAccount, 
    saveBankAccount, 
    withdrawFunds, 
    walletTransactions, 
    availableForPayout,
    listerBalance 
  } = useBondContext();
  const { toast } = useToast();

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

  // Filter transactions relevant to lister (sales and withdrawals)
  const listerTransactions = walletTransactions.filter(t => 
    t.type === 'sale' || t.type === 'withdrawal'
  );

  const selectedTx = selectedTxId ? listerTransactions.find(t => t.id === selectedTxId) : null;

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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <ShoppingCart className="w-4 h-4" />;
      case 'sale': return <TrendingUp className="w-4 h-4" />;
      case 'withdrawal': return <ArrowUpFromLine className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'sale': return 'text-success bg-success/20';
      case 'withdrawal': return 'text-destructive bg-destructive/20';
      default: return 'text-muted-foreground bg-muted/20';
    }
  };

  return (
    <DashboardLayout title="Wallet" subtitle="Manage your earnings and payouts">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Balance Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Lister Balance */}
          <div className="relative rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  <h2 className="text-2xl font-bold text-foreground">${(listerBalance || 0).toLocaleString()}</h2>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Earnings from bond sales
              </p>
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
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
              <p className="text-sm text-muted-foreground">Total Listings</p>
              <p className="text-xl font-bold text-foreground">{broker.totalListings}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
              <p className="text-sm text-muted-foreground">Transaction Volume</p>
              <p className="text-xl font-bold text-foreground">${broker.transactionVolume.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
              <p className="text-sm text-muted-foreground">Bonds Listed</p>
              <p className="text-xl font-bold text-foreground">{broker.listedBonds.length}</p>
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

      {/* Withdrawal Modal - Bank Form */}
      {withdrawStep === 'bank' && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-xl p-8">
            <button
              onClick={handleCloseWithdraw}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-foreground mb-2">Link Bank Account</h3>
            <p className="text-sm text-muted-foreground mb-6">Add your bank details for withdrawals</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Account Holder Name</label>
                <input
                  type="text"
                  value={bankForm.accountHolderName}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Bank Name</label>
                <input
                  type="text"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g., HDFC Bank"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Account Number</label>
                <input
                  type="text"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Your account number"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">IFSC Code</label>
                <input
                  type="text"
                  value={bankForm.ifscCode}
                  onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g., HDFC0001234"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Account Type</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setBankForm({ ...bankForm, accountType: 'savings' })}
                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                      bankForm.accountType === 'savings' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    Savings
                  </button>
                  <button
                    onClick={() => setBankForm({ ...bankForm, accountType: 'current' })}
                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
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

            <button
              onClick={handleSaveBankAccount}
              className="w-full mt-6 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Save & Continue
            </button>
          </div>
        </div>
      )}

      {/* Withdrawal Modal - Confirm Amount */}
      {withdrawStep === 'confirm' && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-xl p-8">
            <button
              onClick={handleCloseWithdraw}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-foreground mb-2">Withdraw Funds</h3>
            <p className="text-sm text-muted-foreground mb-6">Enter amount to withdraw</p>

            <div className="p-4 rounded-xl bg-muted/20 border border-border/30 mb-4">
              <p className="text-sm text-muted-foreground">Available for Payout</p>
              <p className="text-2xl font-bold text-foreground">${availableForPayout.toLocaleString()}</p>
            </div>

            <div className="mb-6">
              <label className="text-sm text-muted-foreground mb-1 block">Withdrawal Amount</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full px-4 py-4 rounded-xl bg-input border border-border text-foreground text-lg font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="0.00"
                max={availableForPayout}
              />
            </div>

            {bankAccount && (
              <div className="p-3 rounded-lg bg-muted/10 border border-border/30 mb-6">
                <p className="text-xs text-muted-foreground">Withdrawing to</p>
                <p className="text-sm font-medium text-foreground">{bankAccount.bankName} - ****{bankAccount.accountNumber.slice(-4)}</p>
              </div>
            )}

            <button
              onClick={handleConfirmWithdraw}
              disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > availableForPayout}
              className="w-full px-4 py-3 rounded-xl bg-success text-success-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Withdrawal
            </button>
          </div>
        </div>
      )}

      {/* Withdrawal Modal - Processing */}
      {withdrawStep === 'processing' && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-xl p-8 text-center">
            <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-bold text-foreground mb-2">Processing Withdrawal</h3>
            <p className="text-sm text-muted-foreground">Please wait while we process your request...</p>
            <p className="text-xs text-muted-foreground mt-2">This may take a few seconds</p>
          </div>
        </div>
      )}

      {/* Withdrawal Modal - Success */}
      {withdrawStep === 'success' && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Withdrawal Successful!</h3>
            <p className="text-sm text-muted-foreground mb-6">
              ${parseFloat(withdrawAmount).toLocaleString()} has been sent to your bank account.
            </p>
            <button
              onClick={handleCloseWithdraw}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {historyView !== 'closed' && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg max-h-[80vh] rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-xl overflow-hidden">
            <div className="p-6 border-b border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {historyView === 'detail' && (
                    <button
                      onClick={() => setHistoryView('list')}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ←
                    </button>
                  )}
                  <h3 className="text-lg font-bold text-foreground">
                    {historyView === 'list' ? 'Transaction History' : 'Transaction Details'}
                  </h3>
                </div>
                <button
                  onClick={() => setHistoryView('closed')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {historyView === 'list' && (
                <div className="space-y-3">
                  {listerTransactions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No transactions yet</p>
                  ) : (
                    listerTransactions.slice().reverse().map((tx) => (
                      <button
                        key={tx.id}
                        onClick={() => {
                          setSelectedTxId(tx.id);
                          setHistoryView('detail');
                        }}
                        className="w-full p-4 rounded-xl bg-muted/10 border border-border/30 hover:border-primary/50 transition-all text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTransactionColor(tx.type)}`}>
                              {getTransactionIcon(tx.type)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground capitalize">{tx.type}</p>
                              <p className="text-xs text-muted-foreground">{new Date(tx.timestamp).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${tx.type === 'withdrawal' ? 'text-destructive' : 'text-success'}`}>
                              {tx.type === 'withdrawal' ? '-' : '+'}${tx.amount.toLocaleString()}
                            </p>
                            <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {historyView === 'detail' && selectedTx && (
                <div className="space-y-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${getTransactionColor(selectedTx.type)}`}>
                    {getTransactionIcon(selectedTx.type)}
                  </div>

                  <div className="text-center">
                    <p className={`text-3xl font-bold ${selectedTx.type === 'withdrawal' ? 'text-destructive' : 'text-success'}`}>
                      {selectedTx.type === 'withdrawal' ? '-' : '+'}${selectedTx.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">{selectedTx.type}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/10 border border-border/30 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <span className={`text-sm font-medium ${selectedTx.status === 'completed' ? 'text-success' : 'text-warning'}`}>
                        {selectedTx.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Date</span>
                      <span className="text-sm text-foreground">
                        {new Date(selectedTx.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Time</span>
                      <span className="text-sm text-foreground">
                        {new Date(selectedTx.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {selectedTx.bondName && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Bond</span>
                        <span className="text-sm text-foreground">{selectedTx.bondName}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-border/30">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-sm text-foreground">{selectedTx.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
