'use client';

import React, { useState, useEffect } from 'react';
import { Expense, ExpenseFilters } from '@/types/expense';
import { storage } from '@/lib/storage';
import { calculateSummary, filterExpenses, downloadCSV, categoryIcons } from '@/lib/utils';
import SummaryCard from '@/components/SummaryCard';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import ExpenseChart from '@/components/ExpenseChart';

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load expenses from localStorage on mount
  useEffect(() => {
    const loadedExpenses = storage.getExpenses();
    setExpenses(loadedExpenses);
    setFilteredExpenses(loadedExpenses);
    setIsLoading(false);
  }, []);

  const handleAddOrUpdateExpense = (expense: Expense) => {
    let updatedExpenses: Expense[];

    if (editingExpense) {
      // Update existing expense
      updatedExpenses = storage.updateExpense(expense.id, expense);
      setEditingExpense(null);
    } else {
      // Add new expense
      updatedExpenses = storage.addExpense(expense);
    }

    setExpenses(updatedExpenses);
    setFilteredExpenses(updatedExpenses);

    // Scroll to top on mobile after adding/editing
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeleteExpense = (id: string) => {
    const updatedExpenses = storage.deleteExpense(id);
    setExpenses(updatedExpenses);
    setFilteredExpenses(updatedExpenses);
  };

  const handleFilterChange = (filters: ExpenseFilters) => {
    const filtered = filterExpenses(expenses, filters);
    setFilteredExpenses(filtered);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    // Scroll to form on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
      alert('No expenses to export');
      return;
    }
    downloadCSV(filteredExpenses, `expenses-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const summary = calculateSummary(expenses);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">💰</div>
          <p className="text-gray-600">Loading your expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Spending"
          value={summary.totalSpending}
          icon="💵"
          subtitle="All time"
        />
        <SummaryCard
          title="This Month"
          value={summary.monthlySpending}
          icon="📅"
          subtitle="Current month"
        />
        <SummaryCard
          title="Top Category"
          value={
            summary.topCategory
              ? `${categoryIcons[summary.topCategory.category]} ${summary.topCategory.category}`
              : 'N/A'
          }
          icon="📊"
          subtitle={
            summary.topCategory
              ? `$${summary.topCategory.amount.toFixed(2)}`
              : 'No expenses yet'
          }
        />
        <SummaryCard
          title="Daily Average"
          value={summary.averageDailySpending}
          icon="📈"
          subtitle="Last 30 days"
        />
      </div>

      {/* Expense Form */}
      <ExpenseForm
        onSubmit={handleAddOrUpdateExpense}
        editingExpense={editingExpense}
        onCancel={handleCancelEdit}
      />

      {/* Chart */}
      {expenses.length > 0 && <ExpenseChart categoryBreakdown={summary.categoryBreakdown} />}

      {/* Export Button */}
      {expenses.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleExportCSV}
            className="btn-primary flex items-center gap-2"
          >
            <span>📥</span>
            Export to CSV
          </button>
        </div>
      )}

      {/* Expense List */}
      <ExpenseList
        expenses={filteredExpenses}
        onEdit={handleEdit}
        onDelete={handleDeleteExpense}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}
