export interface CountryData {
  name: string;
  code: string;
  phoneCode: string;
  phoneLength: number;
  states: {
    name: string;
    cities: string[];
  }[];
}

const RAW_COUNTRIES: CountryData[] = [
  {
    name: 'India',
    code: 'IN',
    phoneCode: '+91',
    phoneLength: 10,
    states: [
      { name: 'Andhra Pradesh', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati', 'Kurnool', 'Rajahmundry', 'Kakinada', 'Anantapur'] },
      { name: 'Arunachal Pradesh', cities: ['Itanagar', 'Tawang', 'Pasighat', 'Ziro', 'Tezu', 'Naharlagun'] },
      { name: 'Assam', cities: ['Guwahati', 'Dibrugarh', 'Silchar', 'Tezpur', 'Jorhat', 'Nagaon', 'Tinsukia', 'Bongaigaon'] },
      { name: 'Bihar', cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Arrah', 'Begusarai', 'Munger'] },
      { name: 'Chandigarh', cities: ['Chandigarh'] },
      { name: 'Chhattisgarh', cities: ['Raipur', 'Bilaspur', 'Bhilai', 'Durg', 'Korba', 'Rajnandgaon', 'Jagdalpur'] },
      { name: 'Delhi', cities: ['New Delhi', 'Dwarka', 'Saket', 'Rohini', 'Vasant Kunj', 'Karol Bagh', 'Connaught Place', 'Chanakyapuri'] },
      { name: 'Goa', cities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'] },
      { name: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Anand', 'Junagadh'] },
      { name: 'Haryana', cities: ['Gurugram', 'Faridabad', 'Ambala', 'Panipat', 'Karnal', 'Rohtak', 'Hisar', 'Panchkula', 'Sonipat'] },
      { name: 'Himachal Pradesh', cities: ['Shimla', 'Manali', 'Dharamshala', 'Solan', 'Mandi', 'Kullu', 'Chamba', 'Hamirpur'] },
      { name: 'Jammu & Kashmir', cities: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Kathua', 'Samba'] },
      { name: 'Jharkhand', cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Hazaribagh', 'Giridih'] },
      { name: 'Karnataka', cities: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Davangere', 'Bellary', 'Shimoga', 'Tumakuru'] },
      { name: 'Kerala', cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Alappuzha', 'Palakkad', 'Kannur', 'Kottayam'] },
      { name: 'Ladakh', cities: ['Leh', 'Kargil'] },
      { name: 'Madhya Pradesh', cities: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam'] },
      { name: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Kalyan-Dombivli', 'Vasai-Virar', 'Aurangabad', 'Solapur', 'Navi Mumbai', 'Amravati', 'Kolhapur'] },
      { name: 'Manipur', cities: ['Imphal', 'Churachandpur', 'Thoubal', 'Senapati'] },
      { name: 'Meghalaya', cities: ['Shillong', 'Tura', 'Jowai', 'Cherrapunji'] },
      { name: 'Mizoram', cities: ['Aizawl', 'Lunglei', 'Champhai'] },
      { name: 'Nagaland', cities: ['Kohima', 'Dimapur', 'Mokokchung', 'Wokha'] },
      { name: 'Odisha', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur', 'Puri', 'Balasore', 'Brahmapur', 'Baripada'] },
      { name: 'Puducherry', cities: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'] },
      { name: 'Punjab', cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur', 'Pathankot'] },
      { name: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar', 'Bhilwara', 'Sikar'] },
      { name: 'Sikkim', cities: ['Gangtok', 'Namchi', 'Geyzing', 'Mangan'] },
      { name: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Vellore', 'Erode', 'Thoothukudi', 'Nagercoil'] },
      { name: 'Telangana', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Mahbubnagar'] },
      { name: 'Tripura', cities: ['Agartala', 'Dharmanagar', 'Udaipur', 'Kailasahar'] },
      { name: 'Uttarakhand', cities: ['Dehradun', 'Haridwar', 'Rishikesh', 'Haldwani', 'Rudrapur', 'Roorkee', 'Kashipur', 'Nainital'] },
      { name: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Noida', 'Ghaziabad', 'Varanasi', 'Agra', 'Prayagraj', 'Meerut', 'Bareilly', 'Aligarh', 'Moradabad', 'Gorakhpur', 'Jhansi', 'Mathura'] },
      { name: 'West Bengal', cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Kharagpur', 'Bardhaman', 'Darjeeling', 'Haldia', 'Malda'] }
    ]
  },
  {
    name: 'United States',
    code: 'US',
    phoneCode: '+1',
    phoneLength: 10,
    states: [
      { name: 'California', cities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento'] },
      { name: 'New York', cities: ['New York City', 'Buffalo', 'Rochester', 'Syracuse', 'Albany'] },
      { name: 'Texas', cities: ['Houston', 'Austin', 'Dallas', 'San Antonio', 'El Paso'] },
      { name: 'Florida', cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Tallahassee'] },
      { name: 'Washington', cities: ['Seattle', 'Spokane', 'Tacoma', 'Bellevue', 'Olympia'] }
    ]
  },
  {
    name: 'United Kingdom',
    code: 'GB',
    phoneCode: '+44',
    phoneLength: 10,
    states: [
      { name: 'England', cities: ['London', 'Birmingham', 'Manchester', 'Leeds', 'Liverpool'] },
      { name: 'Scotland', cities: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness'] },
      { name: 'Wales', cities: ['Cardiff', 'Swansea', 'Newport', 'Bangor', 'St Davids'] }
    ]
  },
  {
    name: 'Canada',
    code: 'CA',
    phoneCode: '+1',
    phoneLength: 10,
    states: [
      { name: 'Ontario', cities: ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton', 'Brampton'] },
      { name: 'Quebec', cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Sherbrooke'] },
      { name: 'British Columbia', cities: ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Kelowna'] }
    ]
  },
  {
    name: 'Australia',
    code: 'AU',
    phoneCode: '+61',
    phoneLength: 9,
    states: [
      { name: 'New South Wales', cities: ['Sydney', 'Newcastle', 'Wollongong', 'Albury', 'Maitland'] },
      { name: 'Victoria', cities: ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Shepparton'] },
      { name: 'Queensland', cities: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Townsville', 'Cairns'] }
    ]
  },
  {
    name: 'United Arab Emirates',
    code: 'AE',
    phoneCode: '+971',
    phoneLength: 9,
    states: [
      { name: 'Abu Dhabi', cities: ['Abu Dhabi City', 'Al Ain', 'Madinat Zayed'] },
      { name: 'Dubai', cities: ['Dubai City', 'Hatta', 'Jebel Ali'] },
      { name: 'Sharjah', cities: ['Sharjah City', 'Khor Fakkan', 'Kalba'] }
    ]
  }
];

// Sort states and cities alphabetically
RAW_COUNTRIES.forEach(country => {
  country.states.sort((a, b) => a.name.localeCompare(b.name));
  country.states.forEach(state => {
    state.cities.sort((a, b) => a.localeCompare(b));
  });
});

export const COUNTRIES = RAW_COUNTRIES;

