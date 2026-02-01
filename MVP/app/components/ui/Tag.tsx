import React from 'react';

interface TagProps {
  children: React.ReactNode;
  variant?: 'default' | 'completed' | 'ongoing' | 'hiatus' | 'dropped';
  color?: string;
  borderColor?: string;
  className?: string;
  onClick?: () => void;
}

export default function Tag({
  children,
  variant = 'default',
  color,
  borderColor,
  className = '',
  onClick
}: TagProps) {
  const variantClasses = {
    default: '',
    completed: 'status-completed',
    ongoing: 'status-ongoing',
    hiatus: 'status-hiatus',
    dropped: 'status-dropped'
  };

  const baseClasses = 'tag';
  const colorClasses = variantClasses[variant];

  return (
    <span
      className={`${baseClasses} ${colorClasses} ${color} ${borderColor} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </span>
  );
}
