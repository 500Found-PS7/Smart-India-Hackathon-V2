import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LoadingSpinner } from "./components/shared/LoadingSpinner";
import { ErrorDisplay } from "./components/shared/ErrorDisplay";
import { DateControls } from "./components/controls/DateControls";
import { TimeNavigation } from "./components/controls/TimeNavigation";
import { ViewControls } from "./components/controls/ViewControls";
import { LoadChart } from "./components/chart/LoadChart";
import { TableView } from "./components/tables/TableView";
import { LoadStats } from "./components/stats/LoadStats";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 }
  }
};

// Helper function to calculate average of array of numbers
const calculateAverage = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

// Helper function to format date for display
const formatDateForDisplay = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

export default function ChartComponent({ 
  startDate, 
  endDate, 
  viewType = '5min',
  onViewChange 
}) {
  const [data, setData] = useState([]);
  const [previousData, setPreviousData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(startDate);
  const [showTable, setShowTable] = useState(false);

  const formatDateForBackend = (date) => {
    const adjustedDate = new Date(date);
    
    const year = adjustedDate.getFullYear();
    const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
    const day = String(adjustedDate.getDate()).padStart(2, '0');
    const hours = String(adjustedDate.getHours()).padStart(2, '0');
    const minutes = String(adjustedDate.getMinutes()).padStart(2, '0');
    const seconds = String(adjustedDate.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  // Function to aggregate data based on view type
  const aggregateData = (rawData, viewType) => {
    if (!rawData || rawData.length === 0) return [];

    switch (viewType) {
      case '5min':
        return rawData.map(item => ({
          time: new Date(item.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }),
          load: parseFloat(item.value),
          timestamp: item.timestamp
        }));

      case 'hourly': {
        // Group data by hour and calculate averages
        const hourlyGroups = {};
        rawData.forEach(item => {
          const date = new Date(item.timestamp);
          const hourKey = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }).slice(0, 2) + ':00';
          
          if (!hourlyGroups[hourKey]) {
            hourlyGroups[hourKey] = [];
          }
          hourlyGroups[hourKey].push(parseFloat(item.value));
        });

        return Object.entries(hourlyGroups).map(([hour, values]) => ({
          time: hour,
          load: calculateAverage(values),
          timestamp: new Date(rawData[0].timestamp).setHours(parseInt(hour))
        })).sort((a, b) => a.timestamp - b.timestamp);
      }

      case 'weekly': {
        // Group data by day and calculate averages
        const dailyGroups = {};
        rawData.forEach(item => {
          const date = new Date(item.timestamp);
          const dateKey = formatDateForDisplay(date);
          
          if (!dailyGroups[dateKey]) {
            dailyGroups[dateKey] = [];
          }
          dailyGroups[dateKey].push(parseFloat(item.value));
        });

        return Object.entries(dailyGroups).map(([date, values]) => ({
          time: date,
          load: calculateAverage(values),
          timestamp: new Date(date).getTime()
        })).sort((a, b) => a.timestamp - b.timestamp);
      }

      case 'monthly': {
        // Group data by day and calculate averages
        const dailyGroups = {};
        rawData.forEach(item => {
          const date = new Date(item.timestamp);
          const dateKey = formatDateForDisplay(date);
          
          if (!dailyGroups[dateKey]) {
            dailyGroups[dateKey] = [];
          }
          dailyGroups[dateKey].push(parseFloat(item.value));
        });

        return Object.entries(dailyGroups).map(([date, values]) => ({
          time: date,
          load: calculateAverage(values),
          timestamp: new Date(date).getTime()
        })).sort((a, b) => a.timestamp - b.timestamp);
      }

      default:
        return rawData;
    }
  };

  const fetchPredictions = async (start, end) => {
    try {
      const startStr = formatDateForBackend(start);
      const endStr = formatDateForBackend(end);

      console.log('Sending request with dates:', {
        startDateTime: startStr,
        endDateTime: endStr
      });

      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDateTime: startStr,
          endDateTime: endStr
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API request failed: ${errorText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to get predictions');
      }

      // Aggregate the data based on view type
      return aggregateData(result.predictions, viewType);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      throw error;
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let start, end;
      
      switch (viewType) {
        case '5min':
          start = new Date(selectedDate);
          start.setHours(0, 0, 0, 0);
          end = new Date(selectedDate);
          end.setHours(23, 59, 59, 999);
          break;
          
        case 'hourly':
          start = new Date(selectedDate);
          start.setHours(0, 0, 0, 0);
          end = new Date(selectedDate);
          end.setHours(23, 59, 59, 999);
          break;
          
        case 'weekly':
          start = new Date(selectedDate);
          start.setDate(start.getDate() - start.getDay());
          start.setHours(0, 0, 0, 0);
          end = new Date(start);
          end.setDate(end.getDate() + 6);
          end.setHours(23, 59, 59, 999);
          break;
          
        case 'monthly':
          start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1, 0, 0, 0);
          end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59);
          break;
          
        default:
          throw new Error('Invalid view type');
      }

      // Fetch current period data
      const currentData = await fetchPredictions(start, end);
      setData(currentData);

      // Fetch previous period data for comparison
      const prevStart = new Date(start);
      const prevEnd = new Date(end);
      
      switch (viewType) {
        case '5min':
        case 'hourly':
          prevStart.setDate(prevStart.getDate() - 1);
          prevEnd.setDate(prevEnd.getDate() - 1);
          break;
        case 'weekly':
          prevStart.setDate(prevStart.getDate() - 7);
          prevEnd.setDate(prevEnd.getDate() - 7);
          break;
        case 'monthly':
          prevStart.setMonth(prevStart.getMonth() - 1);
          prevEnd.setMonth(prevEnd.getMonth() - 1);
          break;
      }

      const previousPeriodData = await fetchPredictions(prevStart, prevEnd);
      setPreviousData(previousPeriodData);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSelectedDate(startDate);
  }, [startDate]);

  useEffect(() => {
    if (selectedDate) {
      fetchData();
    }
  }, [selectedDate, viewType]);

  const handleTimeChange = (hours) => {
    const newDate = new Date(selectedDate);
    newDate.setHours(newDate.getHours() + hours);
    setSelectedDate(newDate);
  };

  const handleDateChange = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => fetchData()} />;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-4 text-white"
    >
      <DateControls 
        selectedDate={selectedDate} 
        onDateChange={setSelectedDate}
        onPrevious={() => handleDateChange(-1)}
        onNext={() => handleDateChange(1)}
      />

      <LoadStats 
        data={data}
        previousData={previousData}
        viewType={viewType}
      />

     

      <ViewControls 
        viewType={viewType}
        onViewChange={onViewChange}
        showTable={showTable}
        onToggleTable={() => setShowTable(!showTable)}
      />

      {showTable ? (
        <TableView 
          viewType={viewType} 
          data={data}
        />
      ) : (
        <LoadChart 
          data={data} 
          viewType={viewType} 
          itemVariants={itemVariants}
        />
      )}
    </motion.div>
  );
}