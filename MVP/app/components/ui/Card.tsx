import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'static' | 'hover' | 'lift';
  className?: '';
  onClick?: () => void;
}

export default function Card({
  children,
  variant = 'static',
  className = '',
  onClick
}: CardProps) {
  const variantClasses = {
    static: 'card-static',
    hover: 'card card-hover',
    lift: 'card card-lift'
  };

  return (
    <div
      className={`${variantClasses[variant]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
