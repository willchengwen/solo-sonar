import React from 'react';

interface BookCoverProps {
  emoji?: string;
  gradient?: string;
  size?: 'small' | 'large';
  className?: string;
  coverImage?: string;
  alt?: string;
}

export default function BookCover({
  emoji = '📚',
  gradient = 'from-blue-500 to-indigo-600',
  size = 'small',
  className = '',
  coverImage,
  alt = ''
}: BookCoverProps) {
  const sizeClasses = size === 'large' ? 'book-cover-large' : 'book-cover-small';

  if (coverImage) {
    return (
      <img 
        src={coverImage} 
        alt={alt} 
        className={`${sizeClasses} ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClasses} bg-gradient-to-br ${gradient} flex items-center justify-center text-4xl sm:text-6xl ${className}`}>
      {emoji}
    </div>
  );
}
