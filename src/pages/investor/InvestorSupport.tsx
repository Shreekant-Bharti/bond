import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, CheckCircle, Clock, Search, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  category: string;
  description: string;
  status: 'open' | 'in_review';
  createdAt: string;
}

const TICKETS_STORAGE_KEY = 'bondfi_support_tickets';

function loadTickets(): SupportTicket[] {
  try {
    const stored = localStorage.getItem(TICKETS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveTickets(tickets: SupportTicket[]): void {
  localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
}

function generateTicketId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'TKT-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function InvestorSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>(loadTickets);
  const [view, setView] = useState<'form' | 'success' | 'status'>('form');
  const [newTicketId, setNewTicketId] = useState('');
  const [searchTicketId, setSearchTicketId] = useState('');
  const [foundTicket, setFoundTicket] = useState<SupportTicket | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const ticketId = generateTicketId();
    const newTicket: SupportTicket = {
      id: ticketId,
      ...formData,
      status: Math.random() > 0.5 ? 'open' : 'in_review',
      createdAt: new Date().toISOString(),
    };

    const updatedTickets = [...tickets, newTicket];
    setTickets(updatedTickets);
    saveTickets(updatedTickets);
    setNewTicketId(ticketId);
    setView('success');
  };

  const handleSearchTicket = () => {
    const ticket = tickets.find(t => t.id.toLowerCase() === searchTicketId.toLowerCase());
    setFoundTicket(ticket || null);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', category: '', description: '' });
    setView('form');
    setNewTicketId('');
  };

  return (
    <DashboardLayout title="Support" subtitle="Get help with your account or investments">
      <div className="max-w-4xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={view === 'form' || view === 'success' ? 'default' : 'outline'}
            onClick={() => { resetForm(); setView('form'); }}
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            New Request
          </Button>
          <Button
            variant={view === 'status' ? 'default' : 'outline'}
            onClick={() => setView('status')}
            className="gap-2"
          >
            <Search className="w-4 h-4" />
            Check Status
          </Button>
        </div>

        {/* New Request Form */}
        {view === 'form' && (
          <Card className="p-8 bg-gradient-to-br from-card/80 to-card/40 border-border/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Submit a Support Request</h2>
                <p className="text-sm text-muted-foreground">We'll get back to you shortly</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                    required
                    className="bg-muted/20 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    required
                    className="bg-muted/20 border-border/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Issue Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  required
                >
                  <SelectTrigger className="bg-muted/20 border-border/50">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="account">Account Issues</SelectItem>
                    <SelectItem value="investment">Investment Questions</SelectItem>
                    <SelectItem value="wallet">Wallet & Payments</SelectItem>
                    <SelectItem value="bonds">Bond Information</SelectItem>
                    <SelectItem value="technical">Technical Problem</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your issue or question in detail..."
                  required
                  rows={5}
                  className="bg-muted/20 border-border/50 resize-none"
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Submit Request
              </Button>
            </form>
          </Card>
        )}

        {/* Success State */}
        {view === 'success' && (
          <Card className="p-8 bg-gradient-to-br from-card/80 to-card/40 border-border/50 backdrop-blur-sm text-center">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Request Submitted</h2>
            <p className="text-muted-foreground mb-6">
              Your request has been submitted. We will get back to you shortly.
            </p>
            
            <div className="bg-muted/20 rounded-xl p-6 mb-6 inline-block">
              <p className="text-sm text-muted-foreground mb-2">Your Ticket ID</p>
              <div className="flex items-center gap-2 justify-center">
                <Ticket className="w-5 h-5 text-primary" />
                <span className="text-2xl font-mono font-bold text-primary">{newTicketId}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Save this ID to check your ticket status later.
            </p>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={resetForm}>
                Submit Another Request
              </Button>
              <Button onClick={() => { setSearchTicketId(newTicketId); setView('status'); }}>
                Check Status
              </Button>
            </div>
          </Card>
        )}

        {/* Check Status View */}
        {view === 'status' && (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">Check Ticket Status</h2>
              <div className="flex gap-4">
                <Input
                  value={searchTicketId}
                  onChange={(e) => setSearchTicketId(e.target.value)}
                  placeholder="Enter your Ticket ID (e.g., TKT-ABC123)"
                  className="bg-muted/20 border-border/50 flex-1"
                />
                <Button onClick={handleSearchTicket} className="gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </Button>
              </div>
            </Card>

            {foundTicket && (
              <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Ticket className="w-4 h-4 text-primary" />
                      <span className="font-mono font-semibold text-primary">{foundTicket.id}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Submitted on {new Date(foundTicket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5",
                    foundTicket.status === 'open' 
                      ? "bg-warning/20 text-warning" 
                      : "bg-primary/20 text-primary"
                  )}>
                    <Clock className="w-3 h-3" />
                    {foundTicket.status === 'open' ? 'Open' : 'In Review'}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Category</span>
                    <span className="text-foreground capitalize">{foundTicket.category}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Email</span>
                    <span className="text-foreground">{foundTicket.email}</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-muted-foreground block mb-2">Description</span>
                    <p className="text-foreground bg-muted/10 p-3 rounded-lg">{foundTicket.description}</p>
                  </div>
                </div>
              </Card>
            )}

            {searchTicketId && !foundTicket && (
              <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50 backdrop-blur-sm text-center">
                <p className="text-muted-foreground">No ticket found with ID: {searchTicketId}</p>
              </Card>
            )}

            {/* Recent Tickets */}
            {tickets.length > 0 && (
              <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">Your Recent Tickets</h3>
                <div className="space-y-3">
                  {tickets.slice(-5).reverse().map((ticket) => (
                    <div 
                      key={ticket.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => { setSearchTicketId(ticket.id); setFoundTicket(ticket); }}
                    >
                      <div className="flex items-center gap-3">
                        <Ticket className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="font-mono text-sm text-foreground">{ticket.id}</span>
                          <p className="text-xs text-muted-foreground capitalize">{ticket.category}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        ticket.status === 'open' 
                          ? "bg-warning/20 text-warning" 
                          : "bg-primary/20 text-primary"
                      )}>
                        {ticket.status === 'open' ? 'Open' : 'In Review'}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
