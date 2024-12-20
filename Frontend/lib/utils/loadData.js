import axios from 'axios';

export async function fetchLoadData(date, interval = '5min') {
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date');
    }

    const response = await axios.get(
      `/api/load-data?date=${dateObj.toISOString()}&interval=${interval}`
    );
    
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    
    // Ensure load values are numbers
    return response.data.map(item => ({
      ...item,
      load: Number(item.load),
      time: item.time
    }));
  } catch (error) {
    console.error('Error fetching load data:', error);
    throw error;
  }
} 