import { useState } from 'react';
import {
  MobileDialog,
  MobileDialogContent,
  MobileDialogDescription,
  MobileDialogFooter,
  MobileDialogHeader,
  MobileDialogTitle,
  MobileDialogTrigger,
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,  
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from '~/common/components/responsive';
import { Button } from '~/common/components/ui/button';
import { Input } from '~/common/components/ui/input';
import { Label } from '~/common/components/ui/label';

export function meta() {
  return [
    { title: "Mobile Dialog Test - SureCRM" },
    { name: "description", content: "Testing Mobile Dialog components" },
  ];
}

export default function TestMobileDialog() {
  const [basicOpen, setBasicOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [fullOpen, setFullOpen] = useState(false);
  const [responsiveOpen, setResponsiveOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mobile Dialog Component Test
          </h1>
          <p className="text-gray-600">
            Comprehensive testing of mobile-optimized dialog components
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="font-semibold text-blue-900 mb-2">Test Instructions</h2>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• On mobile: Dialogs appear as bottom sheets with swipe-to-close</li>
            <li>• On desktop: Dialogs appear as centered modals</li>
            <li>• Try swiping down to close on mobile devices</li>
            <li>• All dialogs have haptic feedback on mobile</li>
            <li>• Minimum 44px touch targets for accessibility</li>
          </ul>
        </div>

        {/* Test Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 1. Basic Mobile Dialog */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-3">Basic Mobile Dialog</h3>
            <p className="text-gray-600 text-sm mb-4">
              Simple dialog with title and close button
            </p>
            <MobileDialog open={basicOpen} onOpenChange={setBasicOpen}>
              <MobileDialogTrigger asChild>
                <Button className="w-full">Open Basic Dialog</Button>
              </MobileDialogTrigger>
              <MobileDialogContent>
                <MobileDialogHeader>
                  <MobileDialogTitle>Basic Dialog</MobileDialogTitle>
                  <MobileDialogDescription>
                    This is a basic mobile dialog with swipe-to-close functionality.
                    Try swiping down to dismiss!
                  </MobileDialogDescription>
                </MobileDialogHeader>
                <div className="py-4">
                  <p className="text-gray-600">
                    This dialog demonstrates the core mobile dialog functionality
                    with proper accessibility and touch interactions.
                  </p>
                </div>
              </MobileDialogContent>
            </MobileDialog>
          </div>

          {/* 2. Form Dialog */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-3">Form Dialog</h3>
            <p className="text-gray-600 text-sm mb-4">
              Dialog with form elements and footer buttons
            </p>
            <MobileDialog open={formOpen} onOpenChange={setFormOpen}>
              <MobileDialogTrigger asChild>
                <Button variant="outline" className="w-full">Open Form Dialog</Button>
              </MobileDialogTrigger>
              <MobileDialogContent size="lg">
                <MobileDialogHeader>
                  <MobileDialogTitle>Customer Information</MobileDialogTitle>
                  <MobileDialogDescription>
                    Enter customer details below
                  </MobileDialogDescription>
                </MobileDialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Enter full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Enter email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" placeholder="Enter phone number" />
                  </div>
                </div>
                <MobileDialogFooter>
                  <Button variant="outline" onClick={() => setFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setFormOpen(false)}>
                    Save Customer
                  </Button>
                </MobileDialogFooter>
              </MobileDialogContent>
            </MobileDialog>
          </div>

          {/* 3. Confirmation Dialog */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-3">Confirmation Dialog</h3>
            <p className="text-gray-600 text-sm mb-4">
              Small dialog for confirmations
            </p>
            <MobileDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <MobileDialogTrigger asChild>
                <Button variant="destructive" className="w-full">Delete Item</Button>
              </MobileDialogTrigger>
              <MobileDialogContent size="sm" showDragHandle={false}>
                <MobileDialogHeader>
                  <MobileDialogTitle>Confirm Deletion</MobileDialogTitle>
                  <MobileDialogDescription>
                    Are you sure you want to delete this item? 
                    This action cannot be undone.
                  </MobileDialogDescription>
                </MobileDialogHeader>
                <MobileDialogFooter>
                  <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={() => setConfirmOpen(false)}>
                    Delete
                  </Button>
                </MobileDialogFooter>
              </MobileDialogContent>
            </MobileDialog>
          </div>

          {/* 4. Full Size Dialog */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-3">Full Size Dialog</h3>
            <p className="text-gray-600 text-sm mb-4">
              Full screen dialog for complex content
            </p>
            <MobileDialog open={fullOpen} onOpenChange={setFullOpen}>
              <MobileDialogTrigger asChild>
                <Button variant="secondary" className="w-full">Open Full Dialog</Button>
              </MobileDialogTrigger>
              <MobileDialogContent size="full" swipeToClose={false}>
                <MobileDialogHeader>
                  <MobileDialogTitle>Settings</MobileDialogTitle>
                  <MobileDialogDescription>
                    Configure your application settings
                  </MobileDialogDescription>
                </MobileDialogHeader>
                <div className="flex-1 py-4 space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Notifications</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span>Email notifications</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span>Push notifications</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Privacy</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span>Share usage data</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span>Marketing emails</span>
                      </label>
                    </div>
                  </div>
                </div>
                <MobileDialogFooter>
                  <Button onClick={() => setFullOpen(false)}>
                    Save Settings
                  </Button>
                </MobileDialogFooter>
              </MobileDialogContent>
            </MobileDialog>
          </div>

          {/* 5. Responsive Dialog */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-3">Responsive Dialog</h3>
            <p className="text-gray-600 text-sm mb-4">
              Auto-switches between mobile and desktop modes
            </p>
            <ResponsiveDialog open={responsiveOpen} onOpenChange={setResponsiveOpen}>
              <ResponsiveDialogTrigger asChild>
                <Button className="w-full">Open Responsive Dialog</Button>
              </ResponsiveDialogTrigger>
              <ResponsiveDialogContent size="md">
                <ResponsiveDialogHeader>
                  <ResponsiveDialogTitle>Responsive Dialog</ResponsiveDialogTitle>
                  <ResponsiveDialogDescription>
                    This dialog automatically adapts to your screen size.
                    Resize your browser to see the difference!
                  </ResponsiveDialogDescription>
                </ResponsiveDialogHeader>
                <div className="py-4">
                  <p className="text-gray-600 mb-4">
                    On desktop (≥768px): Appears as a centered modal
                  </p>
                  <p className="text-gray-600">
                    On mobile (&lt;768px): Appears as a bottom sheet with swipe gesture
                  </p>
                </div>
                <ResponsiveDialogFooter>
                  <Button variant="outline" onClick={() => setResponsiveOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setResponsiveOpen(false)}>
                    Confirm
                  </Button>
                </ResponsiveDialogFooter>
              </ResponsiveDialogContent>
            </ResponsiveDialog>
          </div>

          {/* 6. Features Overview */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-3">Features Overview</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Swipe-to-dismiss on mobile</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Haptic feedback support</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>WCAG 2.5.5 AAA compliance</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Keyboard navigation</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Screen reader support</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Responsive breakpoints</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Tips */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">Mobile Testing Tips</h3>
          <ul className="text-yellow-800 space-y-1 text-sm">
            <li>• Try swiping down on the dialogs to close them</li>
            <li>• Feel for haptic feedback when interacting with buttons</li>
            <li>• Test keyboard navigation using Tab and Enter keys</li>
            <li>• Verify all touch targets are at least 44px in size</li>
            <li>• Test with screen reader for accessibility compliance</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 