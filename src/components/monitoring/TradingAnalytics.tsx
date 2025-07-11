import React, { useState, useEffect } from 'react'
import { 
  BarChart, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Coins, 
  Clock,
  RefreshCw,
  Filter,
  Calendar,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { 
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { monitoringService, TradingAnalytics as TradingAnalyticsData } from '../../services/monitoringService'
import toast from 'react-hot-toast'

interface TradingAnalyticsProps {
  refreshInterval?: number
  tokenSymbol?: string
}

const TradingAnalytics: React.FC<TradingAnalyticsProps> = ({
  refreshInterval = 10000,
  tokenSymbol = 'Tokens'
}) => {
  const { laps } = useSelector((state: RootState) => state.trading)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d' | 'all'>('24h')
  const [analytics, setAnalytics] = useState<TradingAnalyticsData | null>(null)

  // Fetch trading analytics from backend
  useEffect(() => {
    fetchAnalytics()
    
    // Set up auto-refresh
    const interval = setInterval(() => {
      fetchAnalytics()
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [refreshInterval])

  const fetchAnalytics = async () => {
    if (isRefreshing) return
    
    setIsRefreshing(true)
    try {
      const data = await monitoringService.getTradingAnalytics()
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to fetch trading analytics:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      await fetchAnalytics()
      toast.success('Trading analytics refreshed')
    } catch (error) {
      toast.error('Failed to refresh trading analytics')
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatCurrency = (value: number) => {
    return value.toFixed(6)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  if (!analytics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <BarChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Trading Analytics
            </h2>
          </div>
        </div>
        
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    )
  }

  // Prepare transaction type data for pie chart
  const transactionTypeData = [
    { name: 'Buys', value: analytics.buyCount },
    { name: 'Sells', value: analytics.sellCount },
    { name: 'Failed', value: analytics.failedTransactions }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Trading Analytics
          </h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
          
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex items-center px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Volume</span>
          </div>
          <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
            {formatCurrency(analytics.totalVolume)} SOL
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400">
            {analytics.totalTransactions} transactions
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Success Rate</span>
          </div>
          <div className="text-xl font-bold text-green-900 dark:text-green-100">
            {formatPercent(analytics.successRate)}
          </div>
          <div className="text-xs text-green-600 dark:text-green-400">
            {analytics.successfulTransactions} successful / {analytics.failedTransactions} failed
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Coins className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Profit/Loss</span>
          </div>
          <div className={`text-xl font-bold ${
            analytics.profitLoss >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {analytics.profitLoss >= 0 ? '+' : ''}{formatCurrency(analytics.profitLoss)} SOL
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400">
            Fees: {formatCurrency(analytics.totalFees)} SOL
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Avg. Slippage</span>
          </div>
          <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
            {formatPercent(analytics.averageSlippage)}
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-400">
            Avg. size: {formatCurrency(analytics.totalVolume / (analytics.successfulTransactions || 1))} SOL
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Volume Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart className="w-4 h-4 text-indigo-500" />
            <h3 className="font-medium text-gray-900 dark:text-white">
              Trading Volume
            </h3>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={analytics.volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
                <YAxis tick={{ fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    borderColor: '#374151',
                    color: '#F9FAFB'
                  }}
                />
                <Legend />
                <Bar dataKey="buyVolume" name="Buy Volume" fill="#3B82F6" />
                <Bar dataKey="sellVolume" name="Sell Volume" fill="#EF4444" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Count Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <h3 className="font-medium text-gray-900 dark:text-white">
              Transaction Count
            </h3>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={analytics.transactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
                <YAxis tick={{ fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    borderColor: '#374151',
                    color: '#F9FAFB'
                  }}
                />
                <Legend />
                <Bar dataKey="buys" name="Buys" fill="#10B981" />
                <Bar dataKey="sells" name="Sells" fill="#F97316" />
                <Bar dataKey="failed" name="Failed" fill="#F43F5E" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit/Loss Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="w-4 h-4 text-blue-500" />
            <h3 className="font-medium text-gray-900 dark:text-white">
              Profit/Loss
            </h3>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={analytics.profitLossData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
                <YAxis tick={{ fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    borderColor: '#374151',
                    color: '#F9FAFB'
                  }}
                />
                <Bar 
                  dataKey="profit" 
                  name="Profit/Loss" 
                  fill="#10B981"
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Type Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <PieChart className="w-4 h-4 text-purple-500" />
            <h3 className="font-medium text-gray-900 dark:text-white">
              Transaction Types
            </h3>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={transactionTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {transactionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    borderColor: '#374151',
                    color: '#F9FAFB'
                  }}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">
          Trading Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Buy/Sell Ratio:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {analytics.buyCount}:{analytics.sellCount} ({(analytics.buyCount / (analytics.sellCount || 1)).toFixed(2)})
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Average Transaction Size:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {formatCurrency(analytics.totalVolume / (analytics.successfulTransactions || 1))} SOL
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Fees Paid:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {formatCurrency(analytics.totalFees)} SOL
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Success Rate:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {formatPercent(analytics.successRate)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Average Slippage:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {formatPercent(analytics.averageSlippage)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Net Profit/Loss:</span>
              <span className={`font-medium ${
                analytics.profitLoss >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                <span className="flex items-center">
                  {analytics.profitLoss >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                  )}
                  {analytics.profitLoss >= 0 ? '+' : ''}{formatCurrency(analytics.profitLoss)} SOL
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TradingAnalytics