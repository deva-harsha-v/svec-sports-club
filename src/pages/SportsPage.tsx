import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EditorialSportGrid } from '../components/sports/EditorialSportGrid';

export const SportsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="py-6">
      <EditorialSportGrid
        onNavigateToTournaments={(sportSlug) => {
          navigate(sportSlug ? `/tournaments` : '/tournaments');
        }}
      />
    </div>
  );
};
