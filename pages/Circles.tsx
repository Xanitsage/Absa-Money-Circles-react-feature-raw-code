import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { MoneyCircle } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

export default function Circles() {
  const [, setLocation] = useLocation();
  const [inviteCode, setInviteCode] = useState("");
  const [sortOption, setSortOption] = useState("Most Active");

  const { data: circles, isLoading } = useQuery<MoneyCircle[]>({
    queryKey: ['/api/circles']
  });

  // Using the global formatCurrency function from utils.ts

  // Calculate progress percentage
  const calculateProgress = (current: number, target: number) => {
    return Math.round((current / target) * 100);
  };

  // Handler for joining a circle with code
  const handleJoinWithCode = async () => {
    if (!inviteCode.trim()) return;
    
    try {
      const response = await apiRequest("POST", "/api/circles/join", { code: inviteCode });
      if (response.ok) {
        const data = await response.json();
        // Redirect to the newly joined circle
        setLocation(`/circle/${data.id}`);
      }
    } catch (error) {
      console.error("Failed to join circle:", error);
      // Would normally show a toast error
    }
  };

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header Banner */}
      <div className="flex flex-col items-center justify-center bg-gray-100 rounded-xl p-6 mb-6">
        <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-center mb-2">Save Together, Win Together</h2>
        <p className="text-center text-sm text-gray-600 mb-4">Create or join a circle with friends, family or community to save money together.</p>
        <div className="flex space-x-3 w-full">
          <Button 
            onClick={() => setLocation("/create")}
            className="flex-1 rounded-full"
          >
            Create Circle
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 border-primary text-primary rounded-full"
            onClick={() => {
              // Open the join section with invite code focused
              const joinCodeInput = document.querySelector('input[placeholder="Enter invite code"]');
              if (joinCodeInput) {
                (joinCodeInput as HTMLInputElement).focus();
              }
            }}
          >
            Join Circle
          </Button>
        </div>
      </div>

      {/* Join with Code */}
      <Card className="p-4 mb-6">
        <h3 className="font-medium mb-2">Quick Join with Invite Code</h3>
        <div className="flex space-x-2">
          <Input 
            type="text" 
            placeholder="Enter invite code" 
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleJoinWithCode}>Join</Button>
        </div>
      </Card>

      {/* My Circles List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">My Circles</h3>
          <div className="text-sm">
            <select 
              className="bg-transparent text-primary font-medium border-none"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option>Most Active</option>
              <option>Newest First</option>
              <option>Closest to Goal</option>
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="py-8 text-center">Loading circles...</div>
        ) : circles && circles.length > 0 ? (
          circles.map((circle) => (
            <Card key={circle.id} className="p-4 mb-3" onClick={() => setLocation(`/circle/${circle.id}`)} style={{ cursor: 'pointer' }}>
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
                    <p className="text-xs text-gray-500">
                      {circle.memberCount} members • Started {circle.startedTimeAgo}
                    </p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1"/>
                  <circle cx="12" cy="5" r="1"/>
                  <circle cx="12" cy="19" r="1"/>
                </svg>
              </div>
              <Progress 
                value={calculateProgress(circle.currentAmount, circle.targetAmount)} 
                className={`h-2 mb-2 ${
                  calculateProgress(circle.currentAmount, circle.targetAmount) >= 75 
                    ? 'bg-amber-500' 
                    : 'bg-primary'
                }`} 
              />
              <div className="flex justify-between text-sm">
                <span className="font-medium">{formatCurrency(circle.currentAmount)} saved</span>
                <span className="text-gray-500">Goal: {formatCurrency(circle.targetAmount)}</span>
              </div>
              <div className="mt-3 flex overflow-hidden">
                <div className="flex -space-x-2">
                  {circle.members.slice(0, 3).map((member, index) => (
                    <div 
                      key={index}
                      className="w-6 h-6 bg-primary text-white rounded-full border border-white flex items-center justify-center text-xs font-medium"
                    >
                      {member.id}
                    </div>
                  ))}
                  {circle.members.length > 3 && (
                    <div className="w-6 h-6 rounded-full border border-white bg-gray-100 flex items-center justify-center text-xs">
                      +{circle.members.length - 3}
                    </div>
                  )}
                </div>
                <div className="ml-auto flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs rounded-full border-primary text-primary"
                  >
                    Chat
                  </Button>
                  <Button 
                    size="sm" 
                    className="h-7 text-xs rounded-full"
                  >
                    Add Money
                  </Button>
                </div>
              </div>
              <div className="mt-3 bg-gray-100 rounded-lg p-2">
                <div className="flex items-center text-xs">
                  {calculateProgress(circle.currentAmount, circle.targetAmount) >= 75 ? (
                    <>
                      <span className="text-amber-500 mr-1">🎉</span>
                      <span>Next milestone: <b>{formatCurrency(circle.targetAmount * 0.8)}</b> • Celebration at 80%!</span>
                    </>
                  ) : (
                    <>
                      <span className="text-amber-500 mr-1">⏰</span>
                      <span>{circle.pendingContributions} members haven't contributed this month</span>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div>No circles found</div>
        )}
        
        {/* Create New Circle Card */}
        <Card className="border border-dashed p-4 flex flex-col items-center justify-center">
          <div className="bg-gray-100 rounded-full p-3 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M12 5v14"/>
              <path d="M5 12h14"/>
            </svg>
          </div>
          <h4 className="font-medium mb-1">Create a New Circle</h4>
          <p className="text-xs text-center text-gray-500 mb-2">Start saving with friends, family or your community</p>
          <Button 
            onClick={() => setLocation("/create")}
            className="rounded-full"
          >
            Create Now
          </Button>
        </Card>
      </div>
    </div>
  );
}
