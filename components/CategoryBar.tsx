
import React from 'react';
import { Category } from '../types';

interface CategoryBarProps {
  categories: Category[];
  selected: Category;
  onSelect: (cat: Category) => void;
}

const CategoryBar: React.FC<CategoryBarProps> = ({ categories, selected, onSelect }) => {
  return (
    <div className="w-full overflow-x-auto hide-scrollbar pl-4 pb-4 bg-background-light dark:bg-background-dark">
      <div className="flex gap-3 pr-4 min-w-max">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`flex h-9 items-center justify-center px-5 rounded-full transition-all duration-300 active:scale-95 ${
              selected === cat
                ? 'bg-primary shadow-lg shadow-primary/30 text-white font-semibold'
                : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-neutral-700 dark:text-gray-300 font-medium'
            }`}
          >
            <span className="text-sm">{cat}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;
