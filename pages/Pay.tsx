import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { UserWallet } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

// Material Design Icons
import QrCodeIcon from '@mui/icons-material/QrCode';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import ShareIcon from '@mui/icons-material/Share';
import RefreshIcon from '@mui/icons-material/Refresh';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PeopleIcon from '@mui/icons-material/People';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import DevicesIcon from '@mui/icons-material/Devices';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

export default function Pay() {
  // Get tab parameter from URL if available
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');

  const [activeTab, setActiveTab] = useState(tabParam || "scan");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<string>("");

  // Merchant mode
  const [businessName, setBusinessName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [merchantAmount, setMerchantAmount] = useState<string>("");
  const [merchantQR, setMerchantQR] = useState<string>("");
  const [merchantQRVisible, setMerchantQRVisible] = useState(false);
  const [showTapInfo, setShowTapInfo] = useState(true);

  // Fetch wallet data
  const { data: wallet } = useQuery<UserWallet>({
    queryKey: ['/api/wallet']
  });

  // Generate QR code (in a real app this would connect to a payment API)
  const generateQRCode = () => {
    // This is a placeholder. In a real app, you'd connect to a payment API
    // and use their QR code generation feature
    setGeneratedQR(`data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="white" />
      <g fill="black">
        <rect x="50" y="50" width="10" height="10" />
        <rect x="60" y="50" width="10" height="10" />
        <rect x="70" y="50" width="10" height="10" />
        <rect x="80" y="50" width="10" height="10" />
        <rect x="90" y="50" width="10" height="10" />
        <rect x="130" y="50" width="10" height="10" />
        <rect x="140" y="50" width="10" height="10" />
        <rect x="50" y="60" width="10" height="10" />
        <rect x="90" y="60" width="10" height="10" />
        <rect x="110" y="60" width="10" height="10" />
        <rect x="140" y="60" width="10" height="10" />
        <rect x="50" y="70" width="10" height="10" />
        <rect x="70" y="70" width="10" height="10" />
        <rect x="80" y="70" width="10" height="10" />
        <rect x="90" y="70" width="10" height="10" />
        <rect x="100" y="70" width="10" height="10" />
        <rect x="120" y="70" width="10" height="10" />
        <rect x="140" y="70" width="10" height="10" />
        <rect x="50" y="80" width="10" height="10" />
        <rect x="70" y="80" width="10" height="10" />
        <rect x="90" y="80" width="10" height="10" />
        <rect x="110" y="80" width="10" height="10" />
        <rect x="140" y="80" width="10" height="10" />
        <rect x="50" y="90" width="10" height="10" />
        <rect x="70" y="90" width="10" height="10" />
        <rect x="80" y="90" width="10" height="10" />
        <rect x="100" y="90" width="10" height="10" />
        <rect x="110" y="90" width="10" height="10" />
        <rect x="120" y="90" width="10" height="10" />
        <rect x="140" y="90" width="10" height="10" />
        <rect x="50" y="100" width="10" height="10" />
        <rect x="60" y="100" width="10" height="10" />
        <rect x="70" y="100" width="10" height="10" />
        <rect x="80" y="100" width="10" height="10" />
        <rect x="90" y="100" width="10" height="10" />
        <rect x="100" y="100" width="10" height="10" />
        <rect x="110" y="100" width="10" height="10" />
        <rect x="120" y="100" width="10" height="10" />
        <rect x="130" y="100" width="10" height="10" />
        <rect x="140" y="100" width="10" height="10" />
        <rect x="50" y="110" width="10" height="10" />
        <rect x="70" y="110" width="10" height="10" />
        <rect x="100" y="110" width="10" height="10" />
        <rect x="50" y="120" width="10" height="10" />
        <rect x="70" y="120" width="10" height="10" />
        <rect x="80" y="120" width="10" height="10" />
        <rect x="120" y="120" width="10" height="10" />
        <rect x="130" y="120" width="10" height="10" />
        <rect x="50" y="130" width="10" height="10" />
        <rect x="60" y="130" width="10" height="10" />
        <rect x="70" y="130" width="10" height="10" />
        <rect x="100" y="130" width="10" height="10" />
        <rect x="120" y="130" width="10" height="10" />
        <rect x="140" y="130" width="10" height="10" />
        <rect x="60" y="140" width="10" height="10" />
        <rect x="80" y="140" width="10" height="10" />
        <rect x="90" y="140" width="10" height="10" />
        <rect x="100" y="140" width="10" height="10" />
        <rect x="120" y="140" width="10" height="10" />
      </g>
    </svg>`);
    setShowQR(true);
  };

  // Generate merchant QR code with actual payment information
  const generateMerchantQR = () => {
    if (!businessName || !merchantAmount) return;

    // Create payment data that will be encoded in the QR code
    const paymentData = {
      v: 1, // version
      merchant: businessName,
      amount: parseFloat(merchantAmount).toFixed(2),
      currency: "ZAR",
      description: itemDescription || "",
      reference: "INV" + Math.floor(10000 + Math.random() * 90000),
      timestamp: new Date().toISOString(),
      acceptsNonAbsa: true,
      paymentType: "instant"
    };

    // Convert payment data to a string
    const paymentDataString = JSON.stringify(paymentData);

    // In a real app, this would generate a proper QR code from the data
    // For now, we'll create a more basic QR code representation

    // Create a simpler, more reliable QR code image
    const qrCodeSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="white" />
        <!-- QR Code (simplified) -->
        <g stroke="none" fill="black">
          <!-- Position Detection Pattern - Top Left -->
          <rect x="20" y="20" width="40" height="40" />
          <rect x="25" y="25" width="30" height="30" fill="white" />
          <rect x="30" y="30" width="20" height="20" />

          <!-- Position Detection Pattern - Top Right -->
          <rect x="140" y="20" width="40" height="40" />
          <rect x="145" y="25" width="30" height="30" fill="white" />
          <rect x="150" y="30" width="20" height="20" />

          <!-- Position Detection Pattern - Bottom Left -->
          <rect x="20" y="140" width="40" height="40" />
          <rect x="25" y="145" width="30" height="30" fill="white" />
          <rect x="30" y="150" width="20" height="20" />

          <!-- Data Cells (Grid pattern) -->
          <rect x="70" y="20" width="10" height="10" />
          <rect x="90" y="20" width="10" height="10" />
          <rect x="110" y="20" width="10" height="10" />
          <rect x="20" y="70" width="10" height="10" />
          <rect x="40" y="70" width="10" height="10" />
          <rect x="60" y="70" width="10" height="10" />
          <rect x="80" y="70" width="10" height="10" />
          <rect x="120" y="70" width="10" height="10" />
          <rect x="150" y="70" width="10" height="10" />
          <rect x="170" y="70" width="10" height="10" />
          <rect x="30" y="90" width="10" height="10" />
          <rect x="50" y="90" width="10" height="10" />
          <rect x="90" y="90" width="10" height="10" />
          <rect x="130" y="90" width="10" height="10" />
          <rect x="150" y="90" width="10" height="10" />
          <rect x="20" y="110" width="10" height="10" />
          <rect x="60" y="110" width="10" height="10" />
          <rect x="100" y="110" width="10" height="10" />
          <rect x="140" y="110" width="10" height="10" />
          <rect x="40" y="130" width="10" height="10" />
          <rect x="80" y="130" width="10" height="10" />
          <rect x="120" y="130" width="10" height="10" />
          <rect x="160" y="130" width="10" height="10" />
          <rect x="70" y="150" width="10" height="10" />
          <rect x="110" y="150" width="10" height="10" />
          <rect x="150" y="150" width="10" height="10" />
          <rect x="20" y="170" width="10" height="10" />
          <rect x="60" y="170" width="10" height="10" />
          <rect x="100" y="170" width="10" height="10" />
          <rect x="140" y="170" width="10" height="10" />

          <!-- ABSA Logo (Center) -->
          <circle cx="100" cy="100" r="25" fill="white" />
          <circle cx="100" cy="100" r="22" fill="#DC0037" />
          <text x="100" y="107" font-family="Arial" font-size="22" fill="white" font-weight="bold" text-anchor="middle">A</text>
        </g>

        <!-- Hidden payment data -->
        <text x="0" y="0" font-size="0.1" style="display:none">${encodeURIComponent(paymentDataString)}</text>
      </svg>
    `;

    setMerchantQR(qrCodeSvg);
    setMerchantQRVisible(true);
  };

  // Handle pay by phone
  const handlePayByPhone = () => {
    if (!phoneNumber || !amount) return;

    // In a real app, you'd connect to a payment API here
    // For now, we'll just show an alert
    alert(`Payment of ${formatCurrency(parseFloat(amount))} to ${phoneNumber} initiated!`);

    // Reset form
    setPhoneNumber("");
    setAmount("");
    setNote("");
  };

  // Simulate QR code scan - when merchant code is clicked/tapped
  const simulateQRScan = () => {
    if (!merchantQRVisible) return;

    // In a real app, this would be done by scanning the QR with a camera
    // For now, we'll simulate it by "parsing" our embedded data and showing a payment flow

    // Extract payment data from our hidden QR code content
    try {
      // Get the payment data encoded in the QR code
      const paymentDataMatch = merchantQR.match(/display:none">(.*?)<\/text>/);
      if (paymentDataMatch && paymentDataMatch[1]) {
        const paymentDataString = decodeURIComponent(paymentDataMatch[1]);
        const paymentData = JSON.parse(paymentDataString);

        // Show payment confirmation dialog
        if (confirm(`Pay ${paymentData.merchant}\nAmount: R${paymentData.amount}\n${paymentData.description ? `For: ${paymentData.description}\n` : ""}Reference: ${paymentData.reference}\n\nProceed with payment?`)) {
          // Simulate payment processing with timeout
          setTimeout(() => {
            alert(`Payment successful!\nR${paymentData.amount} paid to ${paymentData.merchant}\nTransaction ID: ABSA-${Math.floor(100000000 + Math.random() * 900000000)}`);

            // Reset merchant form after successful payment
            setMerchantQRVisible(false);
            setBusinessName("");
            setMerchantAmount("");
            setItemDescription("");
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Error simulating QR scan:", error);
      alert("Could not process payment. Please try again.");
    }
  };

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Pay</h1>
        <p className="text-gray-600">Send money quickly and easily</p>
      </div>

      {/* Wallet Balance Card */}
      <Card className="p-4 mb-6 bg-primary text-white">
        <p className="text-sm opacity-80 mb-1">Available Balance</p>
        <h2 className="text-2xl font-bold">
          {wallet ? formatCurrency(wallet.balance) : "Loading..."}
        </h2>
      </Card>

      {/* Payment Tabs */}
      <Tabs defaultValue={activeTab} value={activeTab} className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 gap-3 p-1">
          <TabsTrigger value="scan" className="flex items-center justify-center text-[9px] py-1 px-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground">
            <QrCodeIcon style={{ fontSize: '12px' }} className="mr-0.5" />
            <span className="whitespace-nowrap">Scan QR</span>
          </TabsTrigger>
          <TabsTrigger value="phone" className="flex items-center justify-center text-[9px] py-1 px-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground">
            <PhoneAndroidIcon style={{ fontSize: '12px' }} className="mr-0.5" />
            <span className="whitespace-nowrap">Pay Phone</span>
          </TabsTrigger>
          <TabsTrigger value="request" className="flex items-center justify-center text-[9px] py-1 px-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground">
            <NotificationsIcon style={{ fontSize: '12px' }} className="mr-0.5" />
            <span className="whitespace-nowrap">Request</span>
          </TabsTrigger>
          <TabsTrigger value="merchant" className="flex items-center justify-center text-[9px] py-1 px-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground">
            <StorefrontIcon style={{ fontSize: '12px' }} className="mr-0.5" />
            <span className="whitespace-nowrap">Merchant</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="mt-4">
          {!showQR ? (
            <div className="text-center p-6">
              <div className="bg-gray-100 rounded-xl p-10 mb-6 flex items-center justify-center">
                <QrCodeIcon style={{ width: '100px', height: '100px' }} className="text-gray-400" />
              </div>
              <Button onClick={generateQRCode} size="lg" className="rounded-full">
                <QrCode2Icon className="mr-2" />
                Generate Payment QR
              </Button>
            </div>
          ) : (
            <div className="text-center p-6">
              <div className="bg-white rounded-xl p-6 mb-6 flex items-center justify-center border border-gray-200">
                <img src={generatedQR || ""} alt="Payment QR Code" className="w-48 h-48" />
              </div>
              <div className="mb-4">
                <p className="text-lg font-medium">Your PayShap QR Code</p>
                <p className="text-sm text-gray-500">Other Absa users can scan this code to pay you</p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setShowQR(false)} className="flex-1">
                  <RefreshIcon className="mr-1" />
                  New Code
                </Button>
                <Button className="flex-1">
                  <ShareIcon className="mr-1" />
                  Share Code
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="phone" className="mt-4 space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <Input 
              type="tel" 
              placeholder="Enter phone number" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Amount (ZAR)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
              <Input 
                type="number" 
                style={{ paddingLeft: "2rem" }}
                className="text-left" 
                placeholder="0.00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Note (Optional)</label>
            <Input 
              placeholder="What's this for?" 
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Button 
            onClick={handlePayByPhone}
            disabled={!phoneNumber || !amount}
            className="w-full rounded-full"
          >
            <SendIcon className="mr-2" />
            Send Money
          </Button>

          <div className="pt-4">
            <p className="text-sm font-medium mb-2">Recent Recipients</p>
            <div className="grid grid-cols-4 gap-3">
              {['Sarah J', 'Michael P', 'Thabo M', 'Lerato K'].map((name, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="bg-gray-100 rounded-full h-12 w-12 flex items-center justify-center mb-1">
                    <span className="font-medium text-gray-700">{name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <span className="text-xs text-center">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="request" className="mt-4 space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Request From</label>
            <Input placeholder="Enter phone number or email" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Amount (ZAR)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
              <Input type="number" style={{ paddingLeft: "2rem" }} className="text-left" placeholder="0.00" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Reason (Optional)</label>
            <Input placeholder="What's this for?" />
          </div>

          <Button className="w-full rounded-full">
            <NotificationsIcon className="mr-2" />
            Request Money
          </Button>
        </TabsContent>

        <TabsContent value="merchant" className="mt-4 space-y-4">
          {!merchantQRVisible ? (
            <>
              <div className="flex mb-6 space-x-2">
                <div className="flex-1 text-center">
                  <div className="bg-gray-100 rounded-xl p-6 mb-4 flex items-center justify-center">
                    <QrCode2Icon style={{ width: '50px', height: '50px' }} className="text-gray-400" />
                  </div>
                  <p className="text-base font-medium">QR Code Payment</p>
                  <p className="text-xs text-gray-500">Generate a QR code for contactless payments</p>
                </div>
                <div className="flex-1 text-center">
                  <div className="bg-gray-100 rounded-xl p-6 mb-4 flex items-center justify-center">
                    <DevicesIcon style={{ width: '50px', height: '50px' }} className="text-gray-400" />
                  </div>
                  <p className="text-base font-medium">Tap on Phone</p>
                  <p className="text-xs text-gray-500">Accept contactless card payments</p>
                </div>
              </div>

              {showTapInfo ? (
                <div className="bg-blue-50 rounded-lg p-4 mb-6 relative">
                  <button 
                    onClick={() => setShowTapInfo(false)} 
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                    aria-label="Close information"
                  >
                    <CloseIcon style={{ width: '16px', height: '16px' }} />
                  </button>
                  <h4 className="font-medium text-primary flex items-center mb-2">
                    <InfoIcon className="mr-2" style={{ width: '18px', height: '18px' }} />
                    How Tap on Phone Works
                  </h4>
                  <p className="text-sm text-gray-700">
                    Tap on Phone allows businesses to accept payments from any contactless card or mobile wallet right from their 
                    NFC-enabled device. With no extra hardware required, businesses can take advantage of this on-the-go solution 
                    to enable quick and convenient payment options.
                  </p>
                </div>
              ) : (
                <button 
                  onClick={() => setShowTapInfo(true)}
                  className="flex items-center justify-center text-xs text-primary mb-6 bg-blue-50/50 p-2 rounded-lg w-full"
                >
                  <InfoIcon className="mr-1" style={{ width: '14px', height: '14px' }} />
                  Show "How Tap on Phone Works" info
                </button>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Business Name / Your Name</label>
                <Input 
                  placeholder="Enter business name" 
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Amount (ZAR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
                  <Input 
                    type="number" 
                    style={{ paddingLeft: "2rem" }}
                    className="text-left" 
                    placeholder="0.00" 
                    value={merchantAmount}
                    onChange={(e) => setMerchantAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Item Description (Optional)</label>
                <Input 
                  placeholder="What are you selling?" 
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                />
              </div>

              <Button 
                onClick={generateMerchantQR}
                disabled={!businessName || !merchantAmount}
                className="w-full rounded-full"
              >
                <QrCode2Icon className="mr-2" />
                Generate Payment QR
              </Button>
            </>
          ) : (
            <div className="text-center p-6">
              <div className="bg-white rounded-xl p-6 mb-6 flex items-center justify-center border border-gray-200 cursor-pointer relative" onClick={simulateQRScan}>
                <div dangerouslySetInnerHTML={{ __html: merchantQR }} className="w-48 h-48" />
                <div className="absolute bottom-2 right-2 text-xs bg-primary/10 text-primary rounded-md px-2 py-1">Tap to Test</div>
              </div>
              <div className="mb-4">
                <p className="text-lg font-medium">{businessName}</p>
                <p className="text-sm text-gray-500">Amount: R {parseFloat(merchantAmount).toFixed(2)}</p>
                {itemDescription && <p className="text-sm text-gray-500">For: {itemDescription}</p>}
                <div className="mt-2 flex items-center justify-center space-x-1">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-xs text-green-600">Works with both Absa and non-Absa accounts</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setMerchantQRVisible(false)} className="flex-1">
                  <RefreshIcon className="mr-1" />
                  New Code
                </Button>
                <Button className="flex-1">
                  <ShareIcon className="mr-1" />
                  Share Code
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Payment Methods */}
      <Card className="p-4">
        <h3 className="font-medium mb-3">Payment Methods</h3>
        <div className="flex justify-between items-center py-2 border-b">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
              <CreditCardIcon className="text-primary" />
            </div>
            <div>
              <p className="font-medium">Absa Gold Account</p>
              <p className="text-xs text-gray-500">••••••••3456</p>
            </div>
          </div>
          <div className="bg-green-100 text-green-600 rounded-full px-2 py-1 text-xs">Default</div>
        </div>
        <div className="flex justify-between items-center py-3">
          <Button variant="outline" size="sm" className="w-full">
            <AddIcon className="mr-1" />
            Add Payment Method
          </Button>
        </div>
      </Card>
    </div>
  );
}