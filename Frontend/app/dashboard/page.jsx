"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import ChartComponent from "../chart/ChartComponent";
import AdditionalInsightsChart from "../chart/AdditionalInsightsChart";
import { motion } from "framer-motion";
import { DateTimeRangePicker } from "@/components/ui/date-time-range";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import { globeConfig, sampleArcs } from "@/app/component/globeConfig";
import { 
  Battery, 
  Clock,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Globe as GlobeIcon
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, addHours } from "date-fns";
import { cn } from "@/lib/utils";
import { fetchLoadData } from "@/lib/utils/loadData";

// Dynamically import the Globe component with SSR disabled
const World = dynamic(
  () => import('@/components/ui/globe').then((mod) => mod.World),
  { ssr: false }
);

const DashboardCard = ({ title, value, icon: Icon, trend, trendValue }) => (
  <Card className="relative p-6 bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] border-0 overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-zinc-400">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-2">{value}</h3>
        {trend && (
          <div className="flex items-center mt-2">
            {trend === "up" ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-rose-500" />
            )}
            <span className={`text-sm font-medium ${trend === "up" ? "text-emerald-500" : "text-rose-500"}`}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
      <div className="p-3 rounded-xl bg-gradient-to-br from-[#2C2C2E] to-[#3C3C3E]">
        <Icon className="w-6 h-6 text-blue-400" />
      </div>
    </div>
  </Card>
);

const TimeDisplay = () => {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-zinc-400" />
        <span className="text-lg font-medium text-white">--:--:--</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-5 h-5 text-blue-400" />
      <span className="text-lg font-medium text-white">
        {format(time, 'HH:mm:ss')}
      </span>
    </div>
  );
};

export default function DashboardPage() {
  // Initialize dates properly
  const defaultDate = new Date(2023, 7, 10); // August 10, 2023
  const [selectedDate, setSelectedDate] = useState(() => defaultDate);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date(defaultDate);
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date(defaultDate);
    date.setHours(23, 59, 59, 999);
    return date;
  });
  const [viewType, setViewType] = useState('5min');
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedArea, setSelectedArea] = useState(null);
  const [dailyLoadData, setDailyLoadData] = useState({
    morning: { value: 0, change: 0 },
    afternoon: { value: 0, change: 0 },
    evening: { value: 0, change: 0 },
    night: { value: 0, change: 0 }
  });

  // Update date range based on view type
  useEffect(() => {
    const now = new Date();
    now.setMilliseconds(0); // Ensure consistent milliseconds
    
    switch(viewType) {
      case '5min':
        // Keep current selection
        break;
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setHours(0, 0, 0, 0);
        setStartDate(subDays(weekStart, 7));
        setEndDate(now);
        break;
      case 'monthly':
        setStartDate(startOfMonth(now));
        setEndDate(endOfMonth(now));
        break;
    }
  }, [viewType]);

  const handleStartDateChange = (date) => {
    if (date) {
      const newDate = new Date(date);
      newDate.setSeconds(0, 0); // Reset seconds and milliseconds
      setStartDate(newDate);
    }
  };

  const handleEndDateChange = (date) => {
    if (date) {
      const newDate = new Date(date);
      newDate.setSeconds(0, 0); // Reset seconds and milliseconds
      setEndDate(newDate);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveSection(sectionId);
  };

  // Function to calculate peak loads for different periods
  const calculateDailyPeaks = (data) => {
    if (!data || data.length === 0) {
      console.log('No data received');
      return;
    }

    console.log('Raw data:', data); // Debug log

    const timeRanges = {
      morning: { start: 6, end: 9 },
      afternoon: { start: 12, end: 15 },
      evening: { start: 18, end: 21 },
      night: { start: 22, end: 5 }
    };

    const peaks = Object.entries(timeRanges).reduce((acc, [period, range]) => {
      const periodData = data.filter(item => {
        // Parse time properly
        const [hours, minutes] = item.time.split(':').map(Number);
        const hour = hours;

        console.log(`Filtering ${period} data:`, { time: item.time, hour, range }); // Debug log

        if (period === 'night') {
          return hour >= range.start || hour <= range.end;
        }
        return hour >= range.start && hour <= range.end;
      });

      console.log(`${period} filtered data:`, periodData); // Debug log

      const loads = periodData.map(item => Number(item.load));
      const avgLoad = loads.length > 0 
        ? Math.round(loads.reduce((a, b) => a + b, 0) / loads.length)
        : 0;

      console.log(`${period} stats:`, { loads, avgLoad }); // Debug log

      return {
        ...acc,
        [period]: {
          value: avgLoad,
          change: calculateChange(avgLoad, period)
        }
      };
    }, {});

    console.log('Final peaks:', peaks); // Debug log
    setDailyLoadData(peaks);
  };

  // Calculate percentage change from previous day
  const calculateChange = (currentValue, period) => {
    // You can implement comparison with previous day's data here
    // For now, returning a sample change value
    const changes = {
      morning: 2.3,
      afternoon: -1.5,
      evening: 3.8,
      night: -0.7
    };
    return changes[period];
  };

  // Fetch and update daily load data
  useEffect(() => {
    async function fetchDailyData() {
      try {
        const currentDate = new Date();
        // Fetch today's data
        const data = await fetchLoadData(currentDate, '5min');
        console.log('Fetched data:', data); // Debug log
        calculateDailyPeaks(data);
      } catch (error) {
        console.error('Error fetching daily load data:', error);
      }
    }

    fetchDailyData();
    const interval = setInterval(fetchDailyData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="relative">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Dashboard Overview
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-zinc-400 font-medium">System Active</p>
            </div>
            <div className="w-px h-4 bg-zinc-800" />
            <TimeDisplay />
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-6">
          <Button 
            onClick={() => scrollToSection('overview')}
            className={cn(
              "bg-slate-900/80 hover:bg-slate-800/80 text-white transition-all duration-300",
              activeSection === 'overview' && "bg-blue-600/30 hover:bg-blue-600/40"
            )}
          >
            Overview
          </Button>
          <Button 
            onClick={() => scrollToSection('detailed-analysis')}
            className={cn(
              "bg-slate-900/80 hover:bg-slate-800/80 text-white transition-all duration-300",
              activeSection === 'detailed-analysis' && "bg-blue-600/30 hover:bg-blue-600/40"
            )}
          >
            Detailed Analysis
          </Button>
        </div>
      </div>

      {/* Overview Section */}
      <div id="overview">
        {/* Main Chart Section */}
        <Card className="mt-8 p-6 bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] border-0">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white">Current Load Distribution</h3>
            <div className="mt-4">
              <DateTimeRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
              />
            </div>
          </div>
          <ChartComponent 
            startDate={startDate}
            endDate={endDate}
            viewType={viewType}
            onViewChange={setViewType}
          />
        </Card>
      </div>


      {/* Detailed Analysis Section */}
      <div id="detailed-analysis" className="grid gap-6">
        <div className="grid gap-6 grid-cols-1">
          

          {/* Influencing Factors */}
          <Card className="p-6 bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] border-0">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white">Influencing Factors</h3>
              <p className="text-sm text-zinc-400 mt-1">Key factors affecting load patterns</p>
            </div>
            <AdditionalInsightsChart />
          </Card>
        </div>
      </div>
    </motion.div>
  );
} 