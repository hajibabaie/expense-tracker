import { Expense, ExpenseCategory, ExpenseSummary, ExpenseFilters } from '@/types/expense';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, differenceInDays } from 'date-fns';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function filterExpenses(expenses: Expense[], filters: ExpenseFilters): Expense[] {
  return expenses.filter((expense) => {
    const expenseDate = parseISO(expense.date);

    // Filter by date range
    if (filters.startDate && filters.endDate) {
      const start = parseISO(filters.startDate);
      const end = parseISO(filters.endDate);
      if (!isWithinInterval(expenseDate, { start, end })) {
        return false;
      }
    }

    // Filter by category
    if (filters.category && filters.category !== 'All' && expense.category !== filters.category) {
      return false;
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      return (
        expense.description.toLowerCase().includes(searchLower) ||
        expense.category.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });
}

export function calculateSummary(expenses: Expense[]): ExpenseSummary {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Calculate total spending
  const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate monthly spending
  const monthlyExpenses = expenses.filter((expense) => {
    const expenseDate = parseISO(expense.date);
    return isWithinInterval(expenseDate, { start: monthStart, end: monthEnd });
  });
  const monthlySpending = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate category breakdown
  const categoryBreakdown: Record<ExpenseCategory, number> = {
    Food: 0,
    Transportation: 0,
    Entertainment: 0,
    Shopping: 0,
    Bills: 0,
    Other: 0,
  };

  expenses.forEach((expense) => {
    categoryBreakdown[expense.category] += expense.amount;
  });

  // Find top category
  const topCategoryEntry = Object.entries(categoryBreakdown).reduce<{
    category: ExpenseCategory;
    amount: number;
  } | null>((max, [category, amount]) => {
    if (!max || amount > max.amount) {
      return { category: category as ExpenseCategory, amount };
    }
    return max;
  }, null);

  // Calculate average daily spending (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentExpenses = expenses.filter((expense) => {
    const expenseDate = parseISO(expense.date);
    return expenseDate >= thirtyDaysAgo;
  });
  const recentTotal = recentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averageDailySpending = recentTotal / 30;

  return {
    totalSpending,
    monthlySpending,
    categoryBreakdown,
    topCategory: topCategoryEntry && topCategoryEntry.amount > 0 ? topCategoryEntry : null,
    averageDailySpending,
  };
}

export function exportToCSV(expenses: Expense[]): string {
  const headers = ['Date', 'Category', 'Description', 'Amount'];
  const rows = expenses.map((expense) => [
    expense.date,
    expense.category,
    expense.description,
    expense.amount.toFixed(2),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

export function downloadCSV(expenses: Expense[], filename: string = 'expenses.csv'): void {
  const csvContent = exportToCSV(expenses);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const categoryColors: Record<ExpenseCategory, string> = {
  Food: '#10b981',
  Transportation: '#3b82f6',
  Entertainment: '#8b5cf6',
  Shopping: '#ec4899',
  Bills: '#f59e0b',
  Other: '#6b7280',
};

export const categoryIcons: Record<ExpenseCategory, string> = {
  Food: '🍔',
  Transportation: '🚗',
  Entertainment: '🎬',
  Shopping: '🛍️',
  Bills: '📄',
  Other: '📌',
};
