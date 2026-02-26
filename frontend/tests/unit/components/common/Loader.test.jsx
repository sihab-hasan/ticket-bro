// src/pages/LoaderTest.jsx
import React, { useState } from 'react';
import { 
  Loader, 
  PageLoader, 
  SectionLoader, 
  InlineLoader, 
  FullScreenLoader,
  ContentLoader,
  EmptyState 
} from '@/components/shared/Loader';
import { MapPin, Calendar, Ticket } from 'lucide-react';

const LoaderTest = () => {
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="p-8 space-y-12">
      <h1 className="text-2xl font-bold mb-8">Loader Component Test</h1>
      
      {/* Basic Loaders */}
      <section>
        <h2 className="text-lg font-semibold mb-4">1. Basic Loaders</h2>
        <div className="grid grid-cols-3 gap-8">
          <div className="border p-4 rounded">
            <Loader size="sm" text="Small" />
          </div>
          <div className="border p-4 rounded">
            <Loader size="md" text="Medium" />
          </div>
          <div className="border p-4 rounded">
            <Loader size="lg" text="Large" />
          </div>
        </div>
      </section>

      {/* With City Parameter */}
      <section>
        <h2 className="text-lg font-semibold mb-4">2. With City Parameter</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="border p-4 rounded">
            <Loader text="Finding Events" city="New York" />
          </div>
          <div className="border p-4 rounded">
            <Loader text="Discovering" city="Los Angeles" size="lg" />
          </div>
        </div>
      </section>

      {/* With Container */}
      <section>
        <h2 className="text-lg font-semibold mb-4">3. With Container (Hero Style)</h2>
        <div className="border rounded overflow-hidden">
          <Loader 
            withContainer 
            text="Discovering Amazing Events" 
            city="Miami" 
            minHeight="min-h-[400px]"
          />
        </div>
      </section>

      {/* Section Loaders */}
      <section>
        <h2 className="text-lg font-semibold mb-4">4. Section Loaders</h2>
        <div className="space-y-4">
          <SectionLoader text="Loading recommendations" city="Chicago" height="h-40" />
          <SectionLoader text="Loading events" city="Boston" height="h-40" />
        </div>
      </section>

      {/* Inline Loaders */}
      <section>
        <h2 className="text-lg font-semibold mb-4">5. Inline Loaders</h2>
        <div className="flex items-center gap-4">
          <InlineLoader size="sm" text="Saving..." />
          <InlineLoader size="sm" text="Processing" />
          <InlineLoader size="sm" showBrand={false} />
          <button className="px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-2">
            <InlineLoader size="sm" showBrand={false} />
            <span>Loading...</span>
          </button>
        </div>
      </section>

      {/* Content Loader */}
      <section>
        <h2 className="text-lg font-semibold mb-4">6. Content Loader</h2>
        <ContentLoader text="Loading details" height="h-48" />
      </section>

      {/* With Subtitle */}
      <section>
        <h2 className="text-lg font-semibold mb-4">7. With Subtitle</h2>
        <div className="border p-8 rounded">
          <Loader 
            text="Processing Payment" 
            subtitle="Please don't close the window" 
            size="lg"
          />
        </div>
      </section>

      {/* With Action Button */}
      <section>
        <h2 className="text-lg font-semibold mb-4">8. With Action Button</h2>
        <div className="border p-8 rounded">
          <Loader 
            text="Failed to load" 
            subtitle="Something went wrong"
            actionButton={true}
            actionText="Try Again"
            onAction={() => alert('Retry clicked')}
            size="lg"
          />
        </div>
      </section>

      {/* Custom Branding */}
      <section>
        <h2 className="text-lg font-semibold mb-4">9. Custom Branding</h2>
        <div className="border p-8 rounded">
          <Loader 
            text="Loading App" 
            brandText="MyApp"
            size="lg"
          />
        </div>
      </section>

      {/* Empty States */}
      <section>
        <h2 className="text-lg font-semibold mb-4">10. Empty States</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="border p-4 rounded">
            <EmptyState
              icon={MapPin}
              title="No events found"
              message="Check back later for new events"
              city="Austin"
            />
          </div>
          <div className="border p-4 rounded">
            <EmptyState
              icon={Calendar}
              title="No bookings"
              message="You haven't booked any events yet"
              actionText="Browse Events"
              onAction={() => alert('Browse clicked')}
            />
          </div>
        </div>
      </section>

      {/* Interactive Test */}
      <section>
        <h2 className="text-lg font-semibold mb-4">11. Interactive Tests</h2>
        <div className="space-y-4">
          <button
            onClick={() => setShowFullScreen(true)}
            className="px-4 py-2 bg-brand-primary text-white rounded mr-4"
          >
            Show FullScreen Loader
          </button>
          
          <button
            onClick={() => setLoading(!loading)}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Toggle Loading State
          </button>

          {loading && (
            <div className="mt-4 p-4 border rounded">
              <SectionLoader text="Loading data..." city="Dallas" />
            </div>
          )}
        </div>
      </section>

      {/* Full Screen Modal */}
      {showFullScreen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md">
            <FullScreenLoader text="Processing" subtitle="Please wait..." />
            <button
              onClick={() => setShowFullScreen(false)}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoaderTest;