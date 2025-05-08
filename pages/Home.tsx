import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import SavingsIcon from '@mui/icons-material/Savings';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import QuizIcon from '@mui/icons-material/Quiz';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ProgressCircle from "@/components/ui/progress-circle";
import { UserWallet, SavingsGoal, MoneyCircle } from "@shared/schema";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

export default function Home() {
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showCardsModal, setShowCardsModal] = useState(false);

  const { data: wallet, isLoading: isLoadingWallet } = useQuery<UserWallet>({
    queryKey: ['/api/wallet']
  });

  const { data: savings, isLoading: isLoadingSavings } = useQuery<SavingsGoal[]>({
    queryKey: ['/api/savings']
  });

  const { data: circles, isLoading: isLoadingCircles } = useQuery<MoneyCircle[]>({
    queryKey: ['/api/circles']
  });

  // Using the global formatCurrency function from utils.ts

  // Calculate progress percentage
  const calculateProgress = (current: number, target: number) => {
    return Math.round((current / target) * 100);
  };

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Wallet Card */}
      <div className="bg-primary rounded-xl p-4 text-white mb-6">
        <div className="flex justify-between items-start mb-1">
          <p className="text-sm opacity-80">Available Balance</p>
        </div>
        <h2 className="text-3xl font-bold mb-4">
          {isLoadingWallet ? "Loading..." : formatCurrency(wallet?.balance || 0)}
        </h2>
        <div className="grid grid-cols-4 gap-2 mt-2 pt-3 border-t border-white/20">
          <button 
            className="flex flex-col items-center"
            onClick={() => setShowAddMoneyModal(true)}
          >
            <svg className="mb-1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="text-xs">Add Money</span>
          </button>
          <Link href="/pay" className="flex flex-col items-center">
            <svg className="mb-1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
            <span className="text-xs">Transfer</span>
          </Link>
          <Link href="/pay" className="flex flex-col items-center">
            <svg className="mb-1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11V6H4v5h5z" />
              <path d="M19 11V6h-5v5h5z" />
              <path d="M9 21v-5H4v5h5z" />
              <path d="M19 21v-5h-5v5h5z" />
            </svg>
            <span className="text-xs">Pay</span>
          </Link>
          <button 
            className="flex flex-col items-center"
            onClick={() => setShowCardsModal(true)}
          >
            <svg className="mb-1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="14" x="2" y="5" rx="2"/>
              <line x1="2" x2="22" y1="10" y2="10"/>
            </svg>
            <span className="text-xs">Cards</span>
          </button>
        </div>
      </div>

      {/* Missions Tracker */}
      <Card className="p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-lg">My Missions</h3>
          <span className="text-xs bg-secondary px-2 py-1 rounded-full">Level 2</span>
        </div>
        <Progress value={65} className="h-4 mb-2" />
        <div className="flex justify-between text-xs">
          <span>65 XP</span>
          <span>100 XP needed for Level 3</span>
        </div>
        <div className="mt-4 flex space-x-2">
          <div className="flex-1 bg-secondary rounded-lg p-3 text-center">
            <span className="text-amber-500 text-lg block mb-1">
              <SavingsIcon fontSize="medium" />
            </span>
            <span className="text-xs">Save R500 more</span>
          </div>
          <div className="flex-1 bg-secondary rounded-lg p-3 text-center">
            <span className="text-primary text-lg block mb-1">
              <PersonAddIcon fontSize="medium" />
            </span>
            <span className="text-xs">Invite a friend</span>
          </div>
          <div className="flex-1 bg-secondary rounded-lg p-3 text-center">
            <span className="text-green-500 text-lg block mb-1">
              <QuizIcon fontSize="medium" />
            </span>
            <span className="text-xs">Take a quiz</span>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4 mb-6">
          <Link href="/pay" className="w-full">
            <button className="w-full px-4 py-2 bg-[#DC0037] text-white rounded-lg hover:bg-[#B0002C] active:bg-[#8A0022] transition-colors">
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" x2="11" y1="2" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                <span className="text-xs">Send</span>
              </div>
            </button>
          </Link>
          <Link href="/pay" className="w-full">
            <button className="w-full px-4 py-2 border border-[#DC0037] text-[#DC0037] rounded-lg hover:bg-[#DC0037]/5 active:bg-[#DC0037]/10 transition-colors">
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <rect width="3" height="3" x="7" y="7"/>
                  <rect width="3" height="3" x="14" y="7"/>
                  <rect width="3" height="3" x="7" y="14"/>
                  <rect width="3" height="3" x="14" y="14"/>
                </svg>
                <span className="text-xs">Pay QR</span>
              </div>
            </button>
          </Link>
          <Link href="/pay?tab=request" className="w-full">
            <button className="w-full px-4 py-2 text-[#DC0037] rounded-lg hover:bg-[#DC0037]/5 active:bg-[#DC0037]/10 transition-colors">
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                <span className="text-xs">Request</span>
              </div>
            </button>
          </Link>
          <button 
            onClick={() => setShowCardsModal(true)}
            className="w-full px-4 py-2 text-[#DC0037] rounded-lg hover:bg-[#DC0037]/5 active:bg-[#DC0037]/10 transition-colors"
          >
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"/>
                <circle cx="19" cy="12" r="1"/>
                <circle cx="5" cy="12" r="1"/>
              </svg>
              <span className="text-xs">More</span>
            </div>
          </button>
        </div>

      {/* My Savings */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">My Savings</h3>
          <Link href="/circles" className="text-primary text-sm font-medium flex items-center">
            <span className="mr-1">See All ({circles?.length || 0})</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </Link>
        </div>

        {isLoadingSavings ? (
          <div className="py-8 text-center">Loading savings...</div>
        ) : savings && savings.length > 0 ? (
          savings.map((saving) => (
            <Card key={saving.id} className="p-4 mb-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{saving.name}</h4>
                <span className={`text-xs ${
                  saving.status === 'On Track' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-amber-100 text-amber-600'
                } px-2 py-1 rounded-full`}>
                  {saving.status}
                </span>
              </div>
              <Progress 
                value={calculateProgress(saving.currentAmount, saving.targetAmount)} 
                className={`h-2 mb-2 ${
                  saving.status === 'On Track' ? 'bg-green-500' : 'bg-amber-500'
                }`} 
              />
              <div className="flex justify-between text-sm">
                <span className="font-medium">{formatCurrency(saving.currentAmount)} saved</span>
                <span className="text-muted-foreground">Goal: {formatCurrency(saving.targetAmount)}</span>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-4 text-center">
            <p>No savings goals yet</p>
            <button className="mt-2 text-primary font-medium">Create a goal</button>
          </Card>
        )}
      </div>

      {/* Money Circles */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">My Circles</h3>
          <Link href="/circles" className="text-primary text-sm font-medium">See All</Link>
        </div>

        {isLoadingCircles ? (
          <div className="py-8 text-center">Loading circles...</div>
        ) : circles && circles.length > 0 ? (
          circles.map((circle) => (
            <Link href={`/circle/${circle.id}`} key={circle.id}>
              <Card className="p-4 mb-3">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <div className={`${
                      calculateProgress(circle.currentAmount, circle.targetAmount) >= 75
                        ? 'bg-amber-100 text-amber-500'
                        : 'bg-primary/10 text-primary'
                    } rounded-full p-2 mr-3`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">{circle.name}</h4>
                      <p className="text-xs text-muted-foreground">{circle.memberCount} members</p>
                    </div>
                  </div>
                  <ProgressCircle 
                    percentage={calculateProgress(circle.currentAmount, circle.targetAmount)} 
                    isCelebrating={calculateProgress(circle.currentAmount, circle.targetAmount) >= 75}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{formatCurrency(circle.currentAmount)} saved</span>
                  <span className="text-muted-foreground">Goal: {formatCurrency(circle.targetAmount)}</span>
                </div>
                <div className="mt-3 flex overflow-hidden">
                  <div className="flex -space-x-2">
                    {circle.members.slice(0, 3).map((member, index) => (
                      <div 
                        key={index}
                        className="w-6 h-6 bg-primary text-white rounded-full border border-background flex items-center justify-center text-xs font-medium"
                      >
                        {member.id}
                      </div>
                    ))}
                    {circle.members.length > 3 && (
                      <div className="w-6 h-6 rounded-full border border-background bg-secondary flex items-center justify-center text-xs">
                        +{circle.members.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="ml-auto flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-1">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span className="text-xs">{circle.unreadMessages} new</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <Card className="p-4 text-center">
            <p>No circles yet</p>
            <Link href="/circles">
              <button className="mt-2 text-primary font-medium">Join a circle</button>
            </Link>
          </Card>
        )}
      </div>

      {/* Add Money Modal */}
      <Dialog open={showAddMoneyModal} onOpenChange={setShowAddMoneyModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Money to Wallet</DialogTitle>
            <DialogDescription>
              Add money to your Absa wallet from your bank account or card.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Amount</h4>
              <Input 
                type="number" 
                placeholder="Enter amount" 
                className="col-span-3"
                min={10}
              />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Quick amounts</h4>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={() => {}}>R100</Button>
                <Button variant="outline" onClick={() => {}}>R500</Button>
                <Button variant="outline" onClick={() => {}}>R1000</Button>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Payment method</h4>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" className="justify-start" onClick={() => {}}>
                  <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="5" rx="2"/>
                    <line x1="2" x2="22" y1="10" y2="10"/>
                  </svg>
                  Card ending in 4567
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => {}}>
                  <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z"/>
                    <path d="M4 11h16"/>
                  </svg>
                  Absa Current Account
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMoneyModal(false)}>Cancel</Button>
            <Button onClick={() => setShowAddMoneyModal(false)}>Add Money</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cards Modal */}
      <Dialog open={showCardsModal} onOpenChange={setShowCardsModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Your Cards</DialogTitle>
            <DialogDescription>
              Manage your payment cards and accounts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-primary rounded-lg p-4 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-20 bg-black/10"></div>
              <div className="relative z-10">
                <p className="text-sm opacity-80 mb-4">Absa Red Card</p>
                <p className="text-lg font-mono mb-6">**** **** **** 4567</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs opacity-70">Valid thru</p>
                    <p className="font-mono text-sm">09/25</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="14" x="2" y="5" rx="2"/>
              <line x1="2" x2="22" y1="10" y2="10"/>
            </svg>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="justify-start h-auto py-3" onClick={() => {}}>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">View Details</span>
                  <span className="text-xs text-muted-foreground">Limits, PIN & Security</span>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3" onClick={() => {}}>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Freeze Card</span>
                  <span className="text-xs text-muted-foreground">Temporarily block</span>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3" onClick={() => {}}>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Virtual Card</span>
                  <span className="text-xs text-muted-foreground">For online purchases</span>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3" onClick={() => {}}>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Report Lost</span>
                  <span className="text-xs text-muted-foreground">Block & replace</span>
                </div>
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCardsModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}