import { NavLink } from 'react-router-dom';
import { TrendingUp, Building2, DollarSign, Grid2X2, User, Shield } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export function BottomNav() {
  const user = useGameStore(s => s.user);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-4 pt-3 pb-5 z-50"
      style={{ background: 'var(--bg-base)', boxShadow: '-2px -4px 20px #0d0d0d, 0 -1px 6px #2a2a2a' }}
    >
      <NavLink to="/investing" className="flex flex-col items-center gap-1">
        {({ isActive }) => (
          <>
            <TrendingUp size={22} color={isActive ? '#FF6B00' : '#666'} />
            <span style={{ fontSize: 10, color: isActive ? '#FF6B00' : '#666' }}>Investing</span>
            {isActive && <div className="w-1 h-1 rounded-full bg-[#FF6B00]" />}
          </>
        )}
      </NavLink>

      <NavLink to="/business" className="flex flex-col items-center gap-1">
        {({ isActive }) => (
          <>
            <Building2 size={22} color={isActive ? '#FF6B00' : '#666'} />
            <span style={{ fontSize: 10, color: isActive ? '#FF6B00' : '#666' }}>Business</span>
            {isActive && <div className="w-1 h-1 rounded-full bg-[#FF6B00]" />}
          </>
        )}
      </NavLink>

      {/* Center earnings button — raised orange circle */}
      <NavLink to="/" end className="flex flex-col items-center gap-1 -mt-6">
        {({ isActive }) => (
          <>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={
                isActive
                  ? { background: 'linear-gradient(135deg, #FF8C00, #FF4500)', boxShadow: '4px 4px 14px rgba(255,107,0,0.6), -2px -2px 8px rgba(255,140,0,0.15), 0 0 30px rgba(255,107,0,0.25)' }
                  : { background: 'var(--bg-card)', boxShadow: '5px 5px 12px #0d0d0d, -4px -4px 10px #2b2b2b' }
              }
            >
              <DollarSign size={28} color={isActive ? '#fff' : '#555'} />
            </div>
            <span style={{ fontSize: 10, color: isActive ? '#FF6B00' : '#666' }}>Earnings</span>
          </>
        )}
      </NavLink>

      <NavLink to="/items" className="flex flex-col items-center gap-1">
        {({ isActive }) => (
          <>
            <Grid2X2 size={22} color={isActive ? '#FF6B00' : '#666'} />
            <span style={{ fontSize: 10, color: isActive ? '#FF6B00' : '#666' }}>Items</span>
            {isActive && <div className="w-1 h-1 rounded-full bg-[#FF6B00]" />}
          </>
        )}
      </NavLink>

      {user?.role === 'admin' && (
        <NavLink to="/admin" className="flex flex-col items-center gap-1">
          {({ isActive }) => (
            <>
              <Shield size={22} color={isActive ? '#06b6d4' : '#666'} />
              <span style={{ fontSize: 10, color: isActive ? '#06b6d4' : '#666' }}>Admin</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-[#06b6d4]" />}
            </>
          )}
        </NavLink>
      )}

      <NavLink to="/profile" className="flex flex-col items-center gap-1">
        {({ isActive }) => (
          <>
            <User size={22} color={isActive ? '#FF6B00' : '#666'} />
            <span style={{ fontSize: 10, color: isActive ? '#FF6B00' : '#666' }}>Profile</span>
            {isActive && <div className="w-1 h-1 rounded-full bg-[#FF6B00]" />}
          </>
        )}
      </NavLink>
    </nav>
  );
}
