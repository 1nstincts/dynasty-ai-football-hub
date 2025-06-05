import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  Smartphone, 
  Download, 
  Zap,
  Bell,
  Lock,
  Wifi,
  HelpCircle,
  Check
} from 'lucide-react';
import { MobileAppConfig } from '../components/Mobile/MobileAppConfig';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const MobileApp: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={handleGoBack} className="mr-2">
          <ChevronDown className="h-4 w-4 mr-2 rotate-90" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Mobile Companion App</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <MobileAppConfig />
        </div>

        <div className="space-y-6">
          <div className="bg-sleeper-dark rounded-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Smartphone className="h-20 w-20 text-primary" />
                <div className="absolute -right-1 -bottom-1 bg-green-500 text-white p-1 rounded-full">
                  <Check className="h-4 w-4" />
                </div>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Dynasty AI Mobile</h2>
            <p className="text-sleeper-gray mb-4">
              Take your fantasy football experience on the go with our companion mobile app.
            </p>
            <div className="flex justify-center gap-2">
              <Button className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span>Download</span>
              </Button>
              <Button variant="outline">Learn More</Button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Mobile App Features</h2>
            <ul className="space-y-3">
              <li className="flex items-center">
                <div className="bg-sleeper-dark p-2 rounded-full mr-3">
                  <Zap className="h-5 w-5 text-yellow-500" />
                </div>
                <span>Real-time scoring and updates</span>
              </li>
              <li className="flex items-center">
                <div className="bg-sleeper-dark p-2 rounded-full mr-3">
                  <Bell className="h-5 w-5 text-blue-500" />
                </div>
                <span>Push notifications for important events</span>
              </li>
              <li className="flex items-center">
                <div className="bg-sleeper-dark p-2 rounded-full mr-3">
                  <Lock className="h-5 w-5 text-green-500" />
                </div>
                <span>Secure login with QR code or password</span>
              </li>
              <li className="flex items-center">
                <div className="bg-sleeper-dark p-2 rounded-full mr-3">
                  <Wifi className="h-5 w-5 text-purple-500" />
                </div>
                <span>Offline access to player data and rosters</span>
              </li>
            </ul>
          </div>

          <Separator />

          <div>
            <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I connect my mobile device?</AccordionTrigger>
                <AccordionContent>
                  You can connect your mobile device by generating a QR code in the Connect tab, then scanning it with the Dynasty AI Football mobile app. Alternatively, you can log in with your account credentials.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Is my data synced between devices?</AccordionTrigger>
                <AccordionContent>
                  Yes, all your league data, rosters, and settings are automatically synced between the web app and your mobile devices. You can manage what data is stored offline in the app settings.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Which platforms are supported?</AccordionTrigger>
                <AccordionContent>
                  The Dynasty AI Football mobile app is available for iOS (iPhone and iPad) and Android devices. It requires iOS 14+ or Android 8.0+.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>How do push notifications work?</AccordionTrigger>
                <AccordionContent>
                  Push notifications keep you updated about important events like trade offers, player injuries, and game updates. You can customize which notifications you receive in the app settings.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>Can I use the app without internet?</AccordionTrigger>
                <AccordionContent>
                  Yes, the app stores key data for offline access. You can view your rosters, player information, and recent matchups without an internet connection. Real-time updates and sync features require connectivity.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="bg-sleeper-dark rounded-md p-6">
            <div className="flex items-center mb-4">
              <HelpCircle className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-lg font-bold">Need Help?</h2>
            </div>
            <p className="text-sleeper-gray mb-4">
              Having trouble with the mobile app? Our support team is here to help.
            </p>
            <Button variant="outline" className="w-full">Contact Support</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileApp;