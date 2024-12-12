"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LineChart, Brain, AlertCircle, TrendingUp, Loader, Calendar, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Download, Share2 } from "lucide-react";
import { DataInsights } from "../../component/DataInsights";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { WeeklyTable } from "../../chart/components/tables/WeeklyTable";
import axios from 'axios';

// Helper function to safely convert to number and ensure it's toLocaleString-able
const safeNumber = (value) => {
  if (value === undefined || value === null) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// Helper function to safely format number with toLocaleString
const formatNumber = (value) => {
  const num = safeNumber(value);
  return {
    value: num,
    toString: () => num.toString(),
    toLocaleString: () => num.toLocaleString()
  };
};

// Helper function to prepare weekly data
const prepareWeeklyData = (data, selectedDate) => {
  const weekStart = startOfWeek(selectedDate);
  const weekEnd = endOfWeek(selectedDate);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  if (!data || data.length === 0) {
    return days.map(day => ({
      date: format(day, 'yyyy-MM-dd'),
      load: formatNumber(0)
    }));
  }

  // Create a map of all days in the week with initial zero values
  const weekMap = days.reduce((acc, day) => {
    acc[format(day, 'yyyy-MM-dd')] = {
      count: 0,
      load: 0
    };
    return acc;
  }, {});

  // Group data by date and calculate averages
  data.forEach(item => {
    const date = format(new Date(item.date), 'yyyy-MM-dd');
    if (weekMap[date]) {
      weekMap[date].count++;
      weekMap[date].load += item.load.value;
    }
  });

  // Calculate averages and format data
  return days.map(day => {
    const date = format(day, 'yyyy-MM-dd');
    const dayData = weekMap[date];
    return {
      date,
      load: formatNumber(dayData.count > 0 ? dayData.load / dayData.count : 0)
    };
  });
};

export default function AIInsightsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState("5min");
  const [loadData, setLoadData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    currentLoad: true,
    distribution: true,
    recommendations: true
  });

  // Effect to fetch data when date or view type changes
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        // Get the week start and end dates
        const weekStart = startOfWeek(selectedDate);
        const weekEnd = endOfWeek(selectedDate);

        const response = await axios.get(
          `/api/load-data?date=${selectedDate.toISOString()}&interval=${viewType}&weekStart=${weekStart.toISOString()}&weekEnd=${weekEnd.toISOString()}`
        );

        if (response.data.error) {
          throw new Error(response.data.error);
        }

        // Process the data with safe number conversion
        const processedData = Array.isArray(response.data) ? response.data.map(item => ({
          time: item.time || "00:00",
          load: formatNumber(item.load),
          brpl: formatNumber(item.brpl),
          bypl: formatNumber(item.bypl),
          ndpl: formatNumber(item.ndpl),
          ndmc: formatNumber(item.ndmc),
          mes: formatNumber(item.mes),
          date: item.date || format(selectedDate, 'yyyy-MM-dd')
        })) : [];

        // Ensure we have data for tables
        if (processedData.length === 0) {
          processedData.push({
            time: "00:00",
            load: formatNumber(0),
            brpl: formatNumber(0),
            bypl: formatNumber(0),
            ndpl: formatNumber(0),
            ndmc: formatNumber(0),
            mes: formatNumber(0),
            date: format(selectedDate, 'yyyy-MM-dd')
          });
        }

        setLoadData(processedData);
        
        // Prepare weekly data using the entire week's data
        const weekly = prepareWeeklyData(processedData, selectedDate);
        setWeeklyData(weekly);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to fetch load data");
        // Set default data structures for error state
        const defaultData = {
          time: "00:00",
          load: formatNumber(0),
          brpl: formatNumber(0),
          bypl: formatNumber(0),
          ndpl: formatNumber(0),
          ndmc: formatNumber(0),
          mes: formatNumber(0),
          date: format(selectedDate, 'yyyy-MM-dd')
        };
        setLoadData([defaultData]);
        setWeeklyData(prepareWeeklyData([], selectedDate));
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [selectedDate, viewType]);

  // Function to prepare load analysis data
  const prepareLoadAnalysis = () => {
    if (!loadData || loadData.length === 0) {
      return {
        type: "currentLoad",
        summary: {
          hourlyLoad: [0],
          data: loadData,
          weeklyData: weeklyData
        }
      };
    }
    
    // Get last 3 hours of data for current analysis
    const recentData = loadData.slice(-36); // 12 points per hour for 3 hours in 5min data
    
    return {
      type: "currentLoad",
      summary: {
        hourlyLoad: recentData.map(d => d.load.value),
        data: loadData,
        weeklyData: weeklyData
      }
    };
  };

  const handleDateChange = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const handleViewTypeChange = (type) => {
    setViewType(type);
    // Store the view type in localStorage to persist across components
    localStorage.setItem('dashboardViewType', type);
  };

  // Add useEffect to initialize view type from localStorage
  useEffect(() => {
    const savedViewType = localStorage.getItem('dashboardViewType');
    if (savedViewType) {
      setViewType(savedViewType);
    }
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleDownload = (section) => {
    // Implement download logic for the specific section
    console.log(`Downloading ${section} data...`);
  };

  const handleShare = (section) => {
    // Implement share logic for the specific section
    console.log(`Sharing ${section} data...`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-zinc-400">Analyzing load patterns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-4 bg-red-500/10 border-red-500/20">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-400">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Load Analysis Insights</h1>
        <p className="text-zinc-400">
          AI-powered analysis of your energy consumption patterns
        </p>
      </div>

      {/* Date and View Controls */}
      <Card className="p-4 bg-zinc-900/50 border-zinc-800/50">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleDateChange(-1)}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-zinc-400" />
            </button>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-white font-medium">
                {format(selectedDate, 'dd MMM yyyy')}
              </span>
            </div>
            <button
              onClick={() => handleDateChange(1)}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
          <div className="flex gap-2">
            {['5min', 'hourly'].map((type) => (
              <button
                key={type}
                onClick={() => handleViewTypeChange(type)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  viewType === type
                    ? 'bg-blue-500 text-white'
                    : 'text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {type === '5min' ? '5 Minutes' : 'Hourly'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-6">
        {/* Current Load Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 bg-zinc-900/50 border-zinc-800/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <LineChart className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-lg font-semibold text-white">Current Load Patterns</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  onClick={() => toggleSection('currentLoad')}
                >
                  {expandedSections.currentLoad ? 
                    <ChevronUp className="w-5 h-5 text-zinc-400" /> : 
                    <ChevronDown className="w-5 h-5 text-zinc-400" />
                  }
                </button>
                <button 
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  onClick={() => handleDownload('currentLoad')}
                >
                  <Download className="w-5 h-5 text-zinc-400" />
                </button>
                <button 
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  onClick={() => handleShare('currentLoad')}
                >
                  <Share2 className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
            </div>
            {expandedSections.currentLoad && (
              <div className="space-y-6">
                <DataInsights
                  data={prepareLoadAnalysis()}
                  type="currentLoad"
                  className="bg-black/20"
                />
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Weekly Overview</h3>
                  {weeklyData && weeklyData.length > 0 && (
                    <WeeklyTable data={weeklyData} />
                  )}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Distribution Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6 bg-zinc-900/50 border-zinc-800/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <h2 className="text-lg font-semibold text-white">Distribution Analysis</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  onClick={() => toggleSection('distribution')}
                >
                  {expandedSections.distribution ? 
                    <ChevronUp className="w-5 h-5 text-zinc-400" /> : 
                    <ChevronDown className="w-5 h-5 text-zinc-400" />
                  }
                </button>
                <button 
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  onClick={() => handleDownload('distribution')}
                >
                  <Download className="w-5 h-5 text-zinc-400" />
                </button>
                <button 
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  onClick={() => handleShare('distribution')}
                >
                  <Share2 className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
            </div>
            {expandedSections.distribution && (
              <div className="space-y-6">
                <DataInsights
                  data={{
                    type: "distribution",
                    summary: {
                      companies: {
                        brpl: {
                          average: formatNumber(loadData.reduce((sum, d) => sum + d.brpl.value, 0) / loadData.length),
                          peak: formatNumber(Math.max(...loadData.map(d => d.brpl.value)))
                        },
                        bypl: {
                          average: formatNumber(loadData.reduce((sum, d) => sum + d.bypl.value, 0) / loadData.length),
                          peak: formatNumber(Math.max(...loadData.map(d => d.bypl.value)))
                        },
                        ndpl: {
                          average: formatNumber(loadData.reduce((sum, d) => sum + d.ndpl.value, 0) / loadData.length),
                          peak: formatNumber(Math.max(...loadData.map(d => d.ndpl.value)))
                        }
                      },
                      timestamp: format(selectedDate, 'dd MMM yyyy'),
                      data: loadData,
                      weeklyData: weeklyData
                    }
                  }}
                  type="distribution"
                  className="bg-black/20"
                />
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Weekly Distribution</h3>
                  {weeklyData && weeklyData.length > 0 && (
                    <WeeklyTable data={weeklyData} />
                  )}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6 bg-zinc-900/50 border-zinc-800/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Brain className="w-5 h-5 text-green-500" />
                </div>
                <h2 className="text-lg font-semibold text-white">Smart Recommendations</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  onClick={() => toggleSection('recommendations')}
                >
                  {expandedSections.recommendations ? 
                    <ChevronUp className="w-5 h-5 text-zinc-400" /> : 
                    <ChevronDown className="w-5 h-5 text-zinc-400" />
                  }
                </button>
                <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-zinc-400" />
                </button>
                <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                  <Share2 className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
            </div>
            {expandedSections.recommendations && (
              <div className="space-y-6">
                <DataInsights
                  data={{
                    type: "recommendations",
                    summary: {
                      patterns: {
                        peak: {
                          load: formatNumber(Math.max(...loadData.map(d => d.load.value))),
                          time: loadData.find(d => d.load.value === Math.max(...loadData.map(d => d.load.value)))?.time || "00:00"
                        },
                        average: formatNumber(loadData.reduce((sum, d) => sum + d.load.value, 0) / loadData.length),
                        distribution: {
                          brpl: formatNumber(loadData.reduce((sum, d) => sum + d.brpl.value, 0) / loadData.length),
                          bypl: formatNumber(loadData.reduce((sum, d) => sum + d.bypl.value, 0) / loadData.length),
                          ndpl: formatNumber(loadData.reduce((sum, d) => sum + d.ndpl.value, 0) / loadData.length)
                        }
                      },
                      timeRange: viewType,
                      date: format(selectedDate, 'dd MMM yyyy'),
                      data: loadData,
                      weeklyData: weeklyData
                    }
                  }}
                  type="recommendations"
                  className="bg-black/20"
                />
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Weekly Trends</h3>
                  {weeklyData && weeklyData.length > 0 && (
                    <WeeklyTable data={weeklyData} />
                  )}
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 