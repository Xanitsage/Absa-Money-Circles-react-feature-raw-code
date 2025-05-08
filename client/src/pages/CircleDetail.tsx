import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { CircleDetails, CircleMember, CircleActivity } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Confetti from "@/components/ui/confetti";
import { formatCurrency } from "@/lib/utils";

export default function CircleDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [showConfetti, setShowConfetti] = useState(false);
  
  const { data: circle, isLoading } = useQuery<CircleDetails>({
    queryKey: ['/api/circles', id]
  });

  const { data: activities } = useQuery<CircleActivity[]>({
    queryKey: ['/api/circles', id, 'activities']
  });

  const { data: members } = useQuery<CircleMember[]>({
    queryKey: ['/api/circles', id, 'members']
  });

  // Using the global formatCurrency function from utils.ts

  // Calculate progress percentage
  const calculateProgress = (current: number, target: number) => {
    if (!current || !target || target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  // Check if we should show the celebration
  useEffect(() => {
    if (circle && calculateProgress(circle.currentAmount, circle.targetAmount) >= 75) {
      setShowConfetti(true);
      // Turn off confetti after 4 seconds
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [circle]);

  if (isLoading || !circle) {
    return <div className="p-8 text-center">Loading circle details...</div>;
  }

  const progress = calculateProgress(circle.currentAmount, circle.targetAmount);
  const isCelebrating = progress >= 75;

  return (
    <div>
      {/* Circle Header */}
      <div className="bg-primary text-white p-4 relative">
        {showConfetti && <Confetti active={showConfetti} />}
        
        <div className="text-center mb-2">
          <h2 className="text-xl font-bold">{circle.name}</h2>
          <p className="text-sm opacity-80">{circle.memberCount} members • Created by {circle.createdBy}</p>
        </div>
        <div className="flex justify-center space-x-3 mb-4">
          <Button 
            variant="ghost" 
            className="bg-white/20 text-white rounded-full"
          >
            <svg className="mr-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14"/>
              <path d="M5 12h14"/>
            </svg>
            Add Money
          </Button>
          <Button 
            variant="ghost" 
            className="bg-white/20 text-white rounded-full"
          >
            <svg className="mr-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" x2="19" y1="8" y2="14"/>
              <line x1="22" x2="16" y1="11" y2="11"/>
            </svg>
            Invite
          </Button>
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm opacity-80">Total Saved</p>
              <h3 className="text-2xl font-bold">{formatCurrency(circle.currentAmount)}</h3>
            </div>
            <div>
              <p className="text-sm opacity-80">Target</p>
              <h3 className="text-2xl font-bold">{formatCurrency(circle.targetAmount)}</h3>
            </div>
          </div>
          <div className="bg-white/20 h-4 rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full rounded-full ${isCelebrating ? 'bg-amber-400' : 'bg-white'}`} 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span>{progress}% Complete</span>
            <span>Deadline: {circle.targetDate ? new Date(circle.targetDate).toLocaleDateString() : 'Not set'}</span>
          </div>
        </div>
      </div>

      {/* Circle Tabs */}
      <div className="px-4 py-3 bg-white sticky top-16 z-10 shadow-sm">
        <div className="flex border-b">
          <button 
            className={`flex-1 py-2 ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`flex-1 py-2 ${activeTab === 'members' ? 'text-primary border-b-2 border-primary font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('members')}
          >
            Members
          </button>
          <button 
            className={`flex-1 py-2 ${activeTab === 'chat' ? 'text-primary border-b-2 border-primary font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 pt-4 pb-6">
        {activeTab === 'overview' && (
          <>
            {/* Achievement Banner */}
            {isCelebrating && (
              <Card className="bg-amber-50 p-4 mb-6">
                <div className="flex items-center mb-3">
                  <div className="bg-amber-500 text-white rounded-full p-2 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12.76 2.24a1 1 0 0 0-1.52 0L7.04 7a1 1 0 0 1-.9.37l-5.18-.43a1 1 0 0 0-1.1.7l-1.2 3.97a1 1 0 0 0 .2 1.05l3.3 3.3c.27.27.38.68.28 1.05l-1.2 4.4a1 1 0 0 0 .78 1.28l4.1.73c.37.07.75-.04 1.02-.3l3.3-3.3a1 1 0 0 1 1.3 0l3.3 3.3c.27.27.65.37 1.02.3l4.1-.73a1 1 0 0 0 .78-1.28l-1.2-4.4a1.1 1.1 0 0 1 .28-1.05l3.3-3.3a1 1 0 0 0 .2-1.05l-1.2-3.97a1 1 0 0 0-1.1-.7l-5.18.43a1 1 0 0 1-.9-.37l-4.2-4.76z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-500">Achievement Unlocked!</h4>
                    <p className="text-xs">You've reached {progress}% of your goal! 🎉</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm mb-2">Keep going! Only <b>{formatCurrency(circle.targetAmount - circle.currentAmount)}</b> more to reach your goal.</p>
                  <Button className="bg-amber-500 hover:bg-amber-600 w-full rounded-full">Share Achievement</Button>
                </div>
              </Card>
            )}

            {/* Recent Activity */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Recent Activity</h3>
              
              {activities && activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-center py-3 border-b border-gray-200">
                    {activity.type === 'contribution' ? (
                      <div 
                        className="w-10 h-10 bg-primary text-white rounded-full mr-3 flex items-center justify-center font-medium"
                      >
                        {activity.id}
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12.76 2.24a1 1 0 0 0-1.52 0L7.04 7a1 1 0 0 1-.9.37l-5.18-.43a1 1 0 0 0-1.1.7l-1.2 3.97a1 1 0 0 0 .2 1.05l3.3 3.3c.27.27.38.68.28 1.05l-1.2 4.4a1 1 0 0 0 .78 1.28l4.1.73c.37.07.75-.04 1.02-.3l3.3-3.3a1 1 0 0 1 1.3 0l3.3 3.3c.27.27.65.37 1.02.3l4.1-.73a1 1 0 0 0 .78-1.28l-1.2-4.4a1.1 1.1 0 0 1 .28-1.05l3.3-3.3a1 1 0 0 0 .2-1.05l-1.2-3.97a1 1 0 0 0-1.1-.7l-5.18.43a1 1 0 0 1-.9-.37l-4.2-4.76z"/>
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">
                          {activity.type === 'contribution' ? `User ${activity.id}` : 'Milestone Reached'}
                        </h4>
                        <span className="text-sm text-gray-500">{activity.timeAgo}</span>
                      </div>
                      <p className="text-sm">
                        {activity.type === 'contribution' 
                          ? <>Added <span className="font-medium">{formatCurrency(activity.amount || 0)}</span> to the circle</>
                          : <>Circle reached <span className="font-medium">{activity.milestone}%</span> of the goal!</>
                        }
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-gray-500">No recent activity</p>
              )}
            </div>

            {/* Member Contributions */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-lg">Member Contributions</h3>
                <button className="text-primary text-sm font-medium">View All</button>
              </div>
              
              {members && members.length > 0 ? (
                members.map((member) => (
                  <Card key={member.id} className="p-4 mb-3">
                    <div className="flex items-center mb-2">
                      <div 
                        className="w-10 h-10 bg-primary text-white rounded-full mr-3 flex items-center justify-center font-medium"
                      >
                        {member.id}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">User {member.id} {member.isYou ? '(You)' : ''}</h4>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                      <div className={`${
                        member.status === 'On Track' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-amber-100 text-amber-600'
                      } rounded-full px-2 py-1 text-xs`}>
                        {member.status}
                      </div>
                    </div>
                    <Progress 
                      value={calculateProgress(member.contributed, member.target)} 
                      className={`h-2 mb-2 ${
                        member.status === 'On Track' ? 'bg-green-500' : 'bg-amber-500'
                      }`} 
                    />
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{formatCurrency(member.contributed)} contributed</span>
                      <span className="text-gray-500">Target: {formatCurrency(member.target)}</span>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-center py-4 text-gray-500">No member data available</p>
              )}
            </div>
          </>
        )}

        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">All Members ({members?.length || 0})</h3>
              <Button size="sm">
                <svg className="mr-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" x2="19" y1="8" y2="14"/>
                  <line x1="22" x2="16" y1="11" y2="11"/>
                </svg>
                Invite Member
              </Button>
            </div>
            
            {members && members.length > 0 ? (
              members.map((member) => (
                <Card key={member.id} className="p-4">
                  <div className="flex items-center">
                    <div 
                      className="w-12 h-12 bg-primary text-white rounded-full mr-3 flex items-center justify-center font-medium"
                    >
                      {member.id}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-medium">User {member.id}</h4>
                        {member.isYou && <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">You</span>}
                        {member.role === 'Circle Admin' && <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Admin</span>}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-500">Contributed: {formatCurrency(member.contributed)}</p>
                        <div className={`${
                          member.status === 'On Track' 
                            ? 'text-green-600' 
                            : 'text-amber-600'
                        } text-xs font-medium`}>
                          {member.status}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-center py-4 text-gray-500">No members in this circle</p>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">Group Chat</h3>
              <p className="text-sm text-gray-500">Chat with your circle members and share updates on your savings journey.</p>
            </div>
            
            <div className="bg-gray-100 rounded-xl p-4 h-64 flex flex-col justify-center items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p className="text-gray-500">Messages will appear here</p>
            </div>
            
            <div className="flex space-x-2">
              <Input placeholder="Type a message..." className="flex-1" />
              <Button>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z"/>
                  <path d="M22 2 11 13"/>
                </svg>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Import Input component for chat tab
function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }) {
  return (
    <input
      {...props}
      className={`flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${props.className}`}
    />
  );
}
