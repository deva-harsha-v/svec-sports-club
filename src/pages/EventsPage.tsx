import React from 'react';
import { TimelineCalendar } from '../components/events/TimelineCalendar';

export const EventsPage: React.FC = () => {
  return (
    <div className="py-6">
      <TimelineCalendar />
    </div>
  );
};
