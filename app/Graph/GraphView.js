import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback} from 'react-native';
import { VictoryChart, VictoryTheme, VictoryAxis, VictoryLine, VictoryArea, VictoryContainer, VictoryZoomContainer } from 'victory-native';
import axios from 'axios';
import * as d3 from 'd3';
import { styles } from '../style/style_graph_view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomZoomBackgroundContainer from './CustomZoomBackgroundContainer';


const chartPadding = { top: 10, bottom: 50, left: 50, right: 50 };


const GraphView = ({ siteId }) => {
  const [data, setData] = useState({});
  const [visiblePlots, setVisiblePlots] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [maxYValue, setMaxYValue] = useState(0); 


  const screenWidth = 400;
  const screenHeight = 300;
  const today = new Date();
  const fiveHoursInMs = 7 * 60 * 60 * 1000; // milliseconds in 5 hours
  const earlierToday = new Date(today - fiveHoursInMs);
  const laterToday = new Date(today.getTime() + fiveHoursInMs);

  const formatDate_2 = d3.timeFormat("%Y-%m-%d %H:%M:%S");
  const earlierTodayFormatted = formatDate_2(earlierToday);
  const laterTodayFormatted = formatDate_2(laterToday);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handlePlotToggle = (key, group = false) => {
    if (group) {
      // Toggle visibility for the group of Probality Space plots
      const isVisible = !(visiblePlots['Probality_Space_high'] && visiblePlots['Probality_Space_low'] && visiblePlots['Probality_Space']);
      setVisiblePlots(prevState => ({
        ...prevState,
        'Probality_Space_high': isVisible,
        'Probality_Space_low': isVisible,
        'Probality_Space': isVisible,
      }));
    } else {
      // Toggle visibility for individual plots
      setVisiblePlots(prevState => ({
        ...prevState,
        [key]: !prevState[key],
      }));
    }
  };


  const handleZoom = (domain) => {
    if (domain.x) {
      // Check if domain.x is within the data range
      const [minDate, maxDate] = [startDate, endDate]; // Your data's start and end dates
      if (domain.x[0] >= minDate && domain.x[1] <= maxDate) {
        setXDomain(domain.x);
      }
    }
  };


  const fetchData = async () => {
    if (siteId) {
      try {
        const response = await axios.get(`https://enterococcus.today/waf/TX/others/eCount_stat_app/${siteId}.csv`);

        // Parse the CSV data
        const parseDate = d3.timeParse("%Y-%m-%d");
        const parsedData = d3.csvParse(response.data, (row) => {
          const newRow = { date: parseDate(row.date) };
          Object.keys(row).forEach(key => {
            if (key !== 'date' && row[key] !== '') {
              const value = parseFloat(row[key]);
              if (!isNaN(value)) {
                newRow[key] = value;
              }
            }
          });
          return newRow;
        });

        const filteredData = parsedData.filter(d => d.date && Object.keys(d).every(k => !isNaN(d[k])));

        const minDate = d3.min(filteredData, d => d.date);
        const maxDate = d3.max(filteredData, d => d.date);
        setStartDate(minDate);
        setEndDate(maxDate);

        const transformedData = filteredData.reduce((acc, row) => {
          Object.keys(row).forEach(key => {
            if (key !== 'date') {
              if (!acc[key]) acc[key] = [];
              acc[key].push({ date: row.date, value: row[key] });
            }
          });
          return acc;
        }, {});

        const maxValue = d3.max(filteredData, d => {
          return d3.max(Object.keys(d).filter(key => key !== 'date'), key => d[key]);
        });
    
        setMaxYValue(maxValue);
    

        setData(transformedData);

        const initialVisibility = {};
        Object.keys(transformedData).forEach((key, index) => {
          initialVisibility[key] = index < 4; // Adjust as needed
        });
        setVisiblePlots(initialVisibility);

        // Update the last fetched date in AsyncStorage
        const today = new Date().toISOString().split('T')[0];
        await AsyncStorage.setItem(`lastFetchDate-${siteId}`, today);

      } catch (error) {
        console.error('Error fetching graph data:', error);
      }
    }
  };

  useEffect(() => {
    const checkDataAndUpdate = async () => {
      const lastFetchKey = `lastFetchDate-${siteId}`;
      const lastFetchDate = await AsyncStorage.getItem(lastFetchKey);
      const today = new Date().toISOString().split('T')[0];
        await fetchData();
        await AsyncStorage.setItem(lastFetchKey, today);
      
    };

    if (siteId) {
      checkDataAndUpdate();
    }
  }, [siteId]);

  const formatDate = d3.timeFormat("%d %b");




  // Generate areaPlotData conditionally based on the visibility of the grouped plots
  let areaPlotData = [];
  if (visiblePlots['Probality_Space_high'] && visiblePlots['Probality_Space_low'] && data['Probality_Space_high'] && data['Probality_Space_low']) {
    areaPlotData = data['Probality_Space_high'].map((high, index) => {
      const low = data['Probality_Space_low'][index];
      return { date: high.date, y: high.value, y0: low.value };
    });
  }

  let tickValues = [];
  if (Object.keys(data).length > 0) {
    const dates = data[Object.keys(data)[0]].map(d => d.date);
    tickValues = d3.timeWeek.every(1).range(d3.min(dates), d3.max(dates));
  }



  return (
    <ScrollView horizontal style={styles.container} contentContainerStyle={styles.contentContainer}>
       <View style={styles.legendToggleButton}>
        <TouchableOpacity onPress={toggleDropdown}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>⋮</Text>
        </TouchableOpacity>

        {dropdownVisible && (
      <Modal
        transparent={true}
        animationType="fade"
        visible={dropdownVisible}
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
          <View style={styles.dropdownOverlay}>
            <View style={styles.dropdownMenu}>
            <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    (visiblePlots['Probality_Space_high'] && visiblePlots['Probality_Space_low'] && visiblePlots['Probality_Space']) ? styles.dropdownItemSelected : null,
                  ]}
                  onPress={() => handlePlotToggle(null, true)}
                >
                  <Text style={styles.dropdownItemText}>Probality Space</Text>
                </TouchableOpacity>
                {Object.keys(data).filter(key => !['Probality_Space_high', 'Probality_Space_low', 'Probality_Space'].includes(key)).map(key => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.dropdownItem,
                      visiblePlots[key] ? styles.dropdownItemSelected : null,
                    ]}
                    onPress={() => handlePlotToggle(key)}
                  >
                    <Text style={styles.dropdownItemText}>{key}</Text>
                  </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    )}

      </View>


      {Object.keys(data).length > 0 && (
        <VictoryChart
          theme={VictoryTheme.material}
          domainPadding={{ x: 10, y: 10 }}
          padding={chartPadding}
          width={screenWidth}
          height={screenHeight}
          containerComponent={
            <CustomZoomBackgroundContainer
              zoomDimension="x"
              onZoom={handleZoom}
            />
          }
          domain={{ x: [startDate, endDate], y: [0, maxYValue+10] }} // Set the y-axis domain dynamically
        >

          <VictoryAxis
            scale="time"
            tickValues={tickValues}
            tickFormat={formatDate}
            label="Date"
            style={styles.axisStyles}
          />
          <VictoryAxis
            dependentAxis
            domain={[0, 150]}
            label="Highest Count (cfu/100 ml)"
            style={styles.axisStyles}
          />
          <VictoryArea
            data={areaPlotData}
            x="date"
            y="y"
            y0="y0"
            style={{ data: { fill: "lightblue", opacity: 0.5 } }}
          />
          <VictoryLine
            x={() => new Date(earlierTodayFormatted)}
            style={{ data: { stroke: 'black', strokeWidth: 1 } }}
          />

          {/* Vertical line for later today */}
          <VictoryLine
            x={() => new Date(laterTodayFormatted)}
            style={{ data: { stroke: 'black', strokeWidth: 1 } }}
          />
          {Object.keys(data).map((key, index) => visiblePlots[key] && (
            <VictoryLine
              key={key}
              data={data[key]}
              x="date"
              y="value"
              style={{
                data: {
                  stroke: key === 'Probality_Space_high' || key === 'Probality_Space_low' ? 'transparent' : d3.schemeCategory10[index % 10],
                  strokeDasharray: key === 'Probality_Space' ? '4, 4' : '0',
                }
              }}
            />
          ))}
        </VictoryChart>
      )}
    </ScrollView>
  );
};


export default GraphView;