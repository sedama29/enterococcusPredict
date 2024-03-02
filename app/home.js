import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Image, Dimensions, Modal, TouchableOpacity, FlatList, ImageBackground } from 'react-native';
import axios from 'axios';
import { styles } from './style/style_home';
import Data90DaysView from './data/Data90DaysView';
import ContactDetailsView from './data/ContactDetailsView';
import GraphView from './Graph/GraphView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabView, SceneMap } from 'react-native-tab-view';
import MapImage1 from '../assets/images/map_images/JEF.jpg';
import MapImage2 from '../assets/images/map_images/GAL.jpg';
import MapImage3 from '../assets/images/map_images/BRA.jpg';
import MapImage4 from '../assets/images/map_images/NUE.jpg';
import MapImage5 from '../assets/images/map_images/CAM.jpg';
const initialLayout = { width: Dimensions.get('window').width };
import RNPickerSelect from 'react-native-picker-select';


const Home = () => {
  const [siteOptions, setSiteOptions] = useState([]);
  const [selectedSite, setSelectedSite] = useState();
  const [imageUrl, setImageUrl] = useState();
  const [coordsDict, setCoordsDict] = useState({});
  const [contactDetails, setContactDetails] = useState({});

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [observedData, setObservedData] = useState([]);
  const [predictedData, setPredictedData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [isCamModalVisible, setCamModalVisible] = useState(false);
  const [isPickerModalVisible, setPickerModalVisible] = useState(false);
  const [buttonLayout, setButtonLayout] = useState(null);


  const renderPickerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.pickerItem}
      onPress={() => {
        setSelectedSite(item.match(/\(([^)]+)\)/)?.[1]);
        setPickerModalVisible(false);
      }}>
      <Text style={styles.pickerText}>{item}</Text>
    </TouchableOpacity>
  )
  const [selectedImage, setSelectedImage] = useState(null);

  const touchAreas = [
    { x: [130, 150], y: [320, 340], image: MapImage5 },
    { x: [125, 145], y: [205, 225], image: MapImage4 },
    { x: [240, 260], y: [105, 125], image: MapImage3 },
    { x: [265, 285], y: [85, 105], image: MapImage2 },
    { x: [310, 330], y: [55, 75], image: MapImage1 },
  ];

  const handleMapPress = (evt) => {
    const { locationX, locationY } = evt.nativeEvent;
    for (const touchArea of touchAreas) {
      if (
        locationX >= touchArea.x[0] && locationX <= touchArea.x[1] &&
        locationY >= touchArea.y[0] && locationY <= touchArea.y[1]
      ) {
        setSelectedImage(touchArea.image);
        setImageModalVisible(false);
        setCamModalVisible(true);
        return;
      }
    }
  };

  // Specific touch areas for each image
  const specificTouchAreas = {
    MapImage1: [
      { x: [135, 155], y: [165, 185], site: 'JEF012' },
      { x: [180, 200], y: [142, 162], site: 'JEF009' },
      { x: [205, 225], y: [140, 160], site: 'JEF013' },
    ],
    MapImage2: [
      { x: [235, 255], y: [75, 95], site: 'GAL038' },
      { x: [168, 188], y: [133, 153], site: 'GAL037' },
      { x: [95, 115], y: [220, 240], site: 'GAL036' },
    ],
    MapImage3: [
      { x: [230, 250], y: [65, 85], site: 'BRA012' },
      { x: [215, 235], y: [85, 105], site: 'BRA011' },
      { x: [108, 128], y: [255, 275], site: 'BRA010' },
    ],
    MapImage4: [
      { x: [187, 207], y: [110, 130], site: 'NUE014' },
      { x: [165, 185], y: [180, 200], site: 'NUE015' },
      { x: [150, 170], y: [242, 262], site: 'NUE016' },
    ],
    MapImage5: [
      { x: [170, 190], y: [95, 115], site: 'CAM011' },
      { x: [178, 198], y: [150, 170], site: 'CAM030' },
      { x: [185, 205], y: [200, 220], site: 'CAM010' },
    ],
  };

  const handleCamPress = (evt) => {
    const { locationX, locationY } = evt.nativeEvent;

    // Determine the current image based on the selectedImage state
    let currentImageKey = null;
    if (selectedImage === MapImage1) {
      currentImageKey = 'MapImage1';
    } else if (selectedImage === MapImage2) {
      currentImageKey = 'MapImage2';
    }
    else if (selectedImage === MapImage3) {
      currentImageKey = 'MapImage3';
    }
    else if (selectedImage === MapImage4) {
      currentImageKey = 'MapImage4';
    }
    else if (selectedImage === MapImage5) {
      currentImageKey = 'MapImage5';
    }

    if (currentImageKey && specificTouchAreas[currentImageKey]) {
      const touchAreas = specificTouchAreas[currentImageKey];

      for (const touchArea of touchAreas) {
        if (
          locationX >= touchArea.x[0] && locationX <= touchArea.x[1] &&
          locationY >= touchArea.y[0] && locationY <= touchArea.y[1]
        ) {
          setSelectedSite(touchArea.site);
          setCamModalVisible(false);
          return;
        }
      }
    }

    // Common touch area (if needed)
    const commonTouchArea = {
      x: [270, 350],
      y: [270, 350],
    };

    if (
      locationX >= commonTouchArea.x[0] && locationX < commonTouchArea.x[1] &&
      locationY >= commonTouchArea.y[0] && locationY < commonTouchArea.y[1]
    ) {
      // Add any common action if required
      setCamModalVisible(false);
      setImageModalVisible(true);
    }
  };


  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState([
    { key: 'observed', title: `Observed (${observedData.length})` },
    { key: 'predicted', title: `Predicted (${predictedData.length})` },
  ]);

  const csvToJson = (csv) => {
    const lines = csv.split('\n');
    const result = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
      let obj = {};
      const currentline = lines[i].split(',');

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j];
      }

      result.push(obj);
    }
    return result;
  };

  const fetchCSVData = async (url) => {
    try {
      const response = await axios.get(url);
      return csvToJson(response.data);
    } catch (error) {
      console.error('Error fetching CSV data:', error);
      throw error;
    }
  };

  const fetchData = async () => {
    try {
      const observed = await fetchCSVData('https://enterococcus.today/waf/TX/others/observed.csv');
      const predicted = await fetchCSVData('https://enterococcus.today/waf/TX/others/predicted.csv');

      setObservedData(observed);
      setPredictedData(predicted);
      setTotalCount(observed.length + predicted.length);


      AsyncStorage.setItem('observedData', JSON.stringify(observed));
      AsyncStorage.setItem('predictedData', JSON.stringify(predicted));
      const today = new Date().toISOString().split('T')[0];
      AsyncStorage.setItem('lastFetchDate', today);
    } catch (error) {
      const storedObserved = await AsyncStorage.getItem('observedData');
      const storedPredicted = await AsyncStorage.getItem('predictedData');
      if (storedObserved) setObservedData(JSON.parse(storedObserved));
      if (storedPredicted) setPredictedData(JSON.parse(storedPredicted));
    }
  };

  useEffect(() => {
    const checkAndFetchData = async () => {
      const lastFetchDate = await AsyncStorage.getItem('lastFetchDate');
      const today = new Date().toISOString().split('T')[0];

      if (lastFetchDate !== today) {
        await fetchData();
      } else {
        const storedObserved = await AsyncStorage.getItem('observedData');
        const storedPredicted = await AsyncStorage.getItem('predictedData');
        let observedData = [];
        let predictedData = [];

        if (storedObserved) {
          observedData = JSON.parse(storedObserved);
          setObservedData(observedData);
        }
        if (storedPredicted) {
          predictedData = JSON.parse(storedPredicted);
          setPredictedData(predictedData);
        }
        setTotalCount(observedData.length + predictedData.length);
      }
    };

    checkAndFetchData();
  }, []);

  const ObservedTab = () => (
    <ScrollView>
      {observedData.map((item, idx) => (
        <Text key={idx} style={styles.bulletText}>
          • <Text style={styles.boldText}>{item.site_name} ({item.site_id}) :</Text>
          {' '}The observed count is {item.eCount} cfu/100ml on {item.date} and this count is {' '}
          <Text style={[styles.levelText, { color: item.level === 'MEDIUM' ? 'orange' : item.level === 'HIGH' ? 'red' : 'black' }]}>
            {item.level}
          </Text>
        </Text>
      ))}
    </ScrollView>
  );

  const PredictedTab = () => (
    <ScrollView>
      {predictedData.map((item, idx) => {
        const level = item.eCount < 104 ? '>35' : '>104';
        return (
          <Text key={idx} style={styles.bulletText}>
            • <Text style={styles.boldText}>{item.site_name} ({item.site_id}) :</Text>
            {' '}The count is predicted by {item.model_id} to be {' '}
            <Text style={{ color: level === '>35' ? 'orange' : 'red' }}>
              {level}
            </Text> cfu/100ml on {item.date}
          </Text>
        );
      })}
    </ScrollView>
  );

  useEffect(() => {
    setRoutes([
      { key: 'observed', title: `Observed (${observedData.length})` },
      { key: 'predicted', title: `Predicted (${predictedData.length})` },
    ]);
  }, [observedData, predictedData]);

  const showDataAlert = () => {
    setIsModalVisible(true);
  };

  const renderScene = SceneMap({
    observed: ObservedTab,
    predicted: PredictedTab,
  });


  useEffect(() => {
    const fetchData = async (url, storageKey, setDataFunction, postProcess = null) => {
      try {
        const response = await fetch(url);
        const text = await response.text();
        let data = JSON.parse(text);

        // Post-process data if needed (e.g., setting default site)
        if (postProcess) {
          data = postProcess(data);
        }

        setDataFunction(data);
        AsyncStorage.setItem(storageKey, JSON.stringify(data));
        const today = new Date().toISOString().split('T')[0];
        AsyncStorage.setItem(`lastFetchDate-${storageKey}`, today);
      } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        const storedData = await AsyncStorage.getItem(storageKey);
        if (storedData) {
          setDataFunction(JSON.parse(storedData));
        }
      }
    };

    const checkAndFetchData = async (url, storageKey, setDataFunction, postProcess) => {
      const lastFetchDate = await AsyncStorage.getItem(`lastFetchDate-${storageKey}`);
      const today = new Date().toISOString().split('T')[0];

      let data;
      if (lastFetchDate !== today) {
        try {
          const response = await fetch(url);
          const text = await response.text();
          data = JSON.parse(text);
          await AsyncStorage.setItem(storageKey, JSON.stringify(data));
          await AsyncStorage.setItem(`lastFetchDate-${storageKey}`, today);
        } catch (error) {
          console.error(`Error fetching data from ${url}:`, error);
          // Attempt to load from AsyncStorage if fetch fails
          const storedData = await AsyncStorage.getItem(storageKey);
          if (storedData) {
            data = JSON.parse(storedData);
          }
        }
      } else {
        const storedData = await AsyncStorage.getItem(storageKey);
        if (storedData) {
          data = JSON.parse(storedData);
        }
      }

      // Apply post-process (if available) and update the state
      if (data) {
        if (postProcess) {
          data = postProcess(data);
        }
        setDataFunction(data);
      }
    };

    // Function to select the first site as default
    const processSiteOptions = (siteArray) => {
      if (Array.isArray(siteArray) && siteArray.length > 0) {
        // Extract the site ID from the first item in the array and set it as the selected site
        const firstSiteId = siteArray[0].match(/\(([^)]+)\)/)?.[1];
        setSelectedSite(firstSiteId);
        return siteArray;
      } else {
        console.error('Fetched data is not an array or is empty:', siteArray);
        return [];
      }
    };

    checkAndFetchData('https://enterococcus.today/waf/TX/others/stations.txt', 'siteOptions', setSiteOptions, processSiteOptions);
    checkAndFetchData('https://enterococcus.today/waf/TX/others/beach_lat_lon.txt', 'coordsDict', setCoordsDict);
    checkAndFetchData('https://enterococcus.today/waf/TX/others/contact_details.json', 'contactDetails', setContactDetails);

  }, []);

  useEffect(() => {
    if (selectedSite) {
      const imageSrc = `https://enterococcus.today/waf/TX/others/beach_images/${selectedSite}.jpg`;
      setImageUrl(imageSrc);
    }
  }, [selectedSite]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={showDataAlert} style={styles.alertButton}>
        <Text style={styles.alertText}>({totalCount}) Alert!</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalView}>
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={initialLayout}

          />
          <TouchableOpacity
            style={styles.closeButton} processSiteOptions
            onPress={() => setIsModalVisible(false)}
          >
            <Text style={{ color: 'white' }}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>


      <Modal
        visible={isPickerModalVisible}
        onRequestClose={() => setPickerModalVisible(false)}
        transparent={true}
        animationType="fade"
      >
      <View style={[styles.modalContainer, {
          top: buttonLayout ? buttonLayout.y + buttonLayout.height : 0, // Position below the button
        }]}>
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1} // Maintain the background opacity
          onPressOut={() => setPickerModalVisible(false)} // Dismiss modal on pressing outside
        >
          <View style={styles.dropdownContainer} onStartShouldSetResponder={() => true}>
            <FlatList
              data={siteOptions}
              renderItem={renderPickerItem}
              keyExtractor={(item, index) => index.toString()}
              style={styles.dropdownList}
            />
          </View>
        </TouchableOpacity>
        </View>
      </Modal>


      <View style={styles.pickerAndDotsContainer}>
        <View style={styles.pickerContainer}>
          <TouchableOpacity
            onPress={() => setPickerModalVisible(true)}
            onLayout={(event) => {
              const layout = event.nativeEvent.layout;
              setButtonLayout(layout);
            }}
            style={styles.pickerButton}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
              <Text style={{ color: 'blue', padding: 5 }}>
                {selectedSite ? siteOptions.find(item => item.match(/\(([^)]+)\)/)?.[1] === selectedSite) : 'Select Site'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => setImageModalVisible(true)} style={styles.dotsButtonBackground}>
          <ImageBackground
            source={require('../assets/images/map_images/bg.jpg')}
            style={{ width: '100%', height: '100%' }} 
          >
          </ImageBackground>
        </TouchableOpacity>

      </View>

      <Text style={{ marginTop: 30, fontSize: 14, fontWeight: 'bold' }}>Enterococcus Counts</Text>
      {selectedSite && <GraphView siteId={selectedSite} />}


      <Text style={{ marginTop: 30, fontSize: 14, fontWeight: 'bold' }}>Data</Text>
      <View>
        <ScrollView contentContainerStyle={styles.container_data}>
          {selectedSite && <Data90DaysView siteId={selectedSite} />}
        </ScrollView>
      </View>

      <Text style={{ marginTop: 30, fontSize: 14, fontWeight: 'bold' }}>Location</Text>
      <View style={styles.container_location}>
        {selectedSite && coordsDict[selectedSite] && (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 10 }}>
            <Text style={{ fontSize: 12 }}>
              <Text style={{ fontWeight: 'bold' }}>Latitude: </Text>
              <Text>{coordsDict[selectedSite].lat}</Text>
            </Text>
            <Text style={{ fontSize: 12, paddingLeft: 50 }}>
              <Text style={{ fontWeight: 'bold' }}>Longitude: </Text>
              <Text>{coordsDict[selectedSite].long}</Text>
            </Text>
          </View>
        )}

        <View style={styles.container_image}>
          {imageUrl && <Image source={{ uri: imageUrl }} style={styles.imageStyle} />}
        </View>
      </View>

      <Text style={{ marginTop: 30, fontSize: 14, fontWeight: 'bold' }}>Contact</Text>
      <View>
        <ScrollView contentContainerStyle={styles.container_contact}>
          {selectedSite && <ContactDetailsView details={contactDetails[selectedSite]} />}
        </ScrollView>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isImageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalView_2}>
          <TouchableOpacity onPress={handleMapPress} style={{ width: '100%', height: '50%', justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('../assets/images/map_images/map_main.jpg')}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setImageModalVisible(false)} style={styles.closeButton_image}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>


      <Modal
        animationType="slide"
        transparent={true}
        visible={isCamModalVisible}
        onRequestClose={() => setCamModalVisible(false)}
      >
        <View style={styles.modalView_2}>
          <TouchableOpacity onPress={handleCamPress} style={{ width: '100%', height: '50%', justifyContent: 'center', alignItems: 'center' }}>
            {selectedImage && (
              <Image
                source={selectedImage}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton_image}
            onPress={() => setCamModalVisible(false)}
          >
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Home