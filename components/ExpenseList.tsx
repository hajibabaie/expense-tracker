'use client';

import React, { useState } from 'react';
import { Expense, ExpenseCategory, ExpenseFilters } from '@/types/expense';
import { formatCurrency, categoryIcons } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onFilterChange: (filters: ExpenseFilters) => void;
}

const categories: (ExpenseCategory | 'All')[] = [
  'All',
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
];

export default function ExpenseList({ expenses, onEdit, onDelete, onFilterChange }: ExpenseListProps) {
  const [filters, setFilters] = useState<ExpenseFilters>({
    category: 'All',
    searchTerm: '',
  });

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleFilterChange = (newFilters: Partial<ExpenseFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const sortedExpenses = [...expenses].sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    return sortOrder === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Expense History</h2>
        <div className="text-sm text-gray-600">
          {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="label-text">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search expenses..."
              value={filters.searchTerm || ''}
              onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="category-filter" className="label-text">
              Filter by Category
            </label>
            <select
              id="category-filter"
              value={filters.category || 'All'}
              onChange={(e) =>
                handleFilterChange({
                  category: e.target.value as ExpenseCategory | 'All',
                })
              }
              className="select-field"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={toggleSortOrder}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Sort by date: {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'} ↕️
        </button>
      </div>

      {/* Expense List */}
      {sortedExpenses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-600 text-lg">No expenses found</p>
          <p className="text-gray-500 text-sm mt-2">Add your first expense to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedExpenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex items-center flex-1 min-w-0">
                <div className="text-3xl mr-4">{categoryIcons[expense.category]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{expense.description}</h3>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {expense.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {format(parseISO(expense.date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-4">
                <span className="text-xl font-bold text-gray-900 whitespace-nowrap">
                  {formatCurrency(expense.amount)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(expense)}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm px-3 py-1 rounded hover:bg-primary-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this expense?')) {
                        onDelete(expense.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-700 font-medium text-sm px-3 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
