export interface TourSpot {
  name: string;
}

export interface District {
  name: string;
  tourSpots: TourSpot[];
}

export interface Division {
  name: string;
  districts: District[];
}

export const BANGLADESH_DIVISIONS: Division[] = [
  {
    name: 'Dhaka Division',
    districts: [
      {
        name: 'Dhaka',
        tourSpots: [
          { name: 'Lalbagh Fort' },
          { name: 'Ahsan Manzil' },
          { name: 'Sonargaon (Panam Nagar)' },
          { name: 'National Parliament Building' },
        ],
      },
      {
        name: 'Gazipur',
        tourSpots: [
          { name: 'Bhawal National Park' },
          { name: 'Bangabandhu Sheikh Mujib Safari Park' },
        ],
      },
      {
        name: 'Narayanganj',
        tourSpots: [
          { name: 'Sonargaon Folk Art and Crafts Museum' },
          { name: 'Taj Mahal Bangladesh' },
        ],
      },
      {
        name: 'Munshiganj',
        tourSpots: [
          { name: 'Idrakpur Fort' },
          { name: 'Bikrampur Vihara' },
          { name: 'Baba Adam Mosque' },
        ],
      },
      {
        name: 'Manikganj',
        tourSpots: [
          { name: 'Baliati Palace' },
          { name: 'Teota Zamindar Bari' },
        ],
      },
      {
        name: 'Narsingdi',
        tourSpots: [
          { name: 'Wari-Bateshwar Archaeological Site' },
          { name: 'Dream Holiday Park' },
        ],
      },
      {
        name: 'Tangail',
        tourSpots: [
          { name: 'Mohera Zamindar Bari' },
          { name: 'Atiya Mosque' },
          { name: 'Jamuna Resort' },
        ],
      },
      {
        name: 'Faridpur',
        tourSpots: [
          { name: 'Jasimuddin Heritage House' },
          { name: 'Mathurapur Deul' },
        ],
      },
      {
        name: 'Gopalganj',
        tourSpots: [
          { name: 'Bangabandhu Sheikh Mujibur Rahman Complex (Tungipara)' },
        ],
      },
      {
        name: 'Madaripur',
        tourSpots: [
          { name: 'Senapati Dighi' },
          { name: 'Raja Ram Mandir' },
        ],
      },
      {
        name: 'Shariatpur',
        tourSpots: [
          { name: 'Burir Hat Mosque' },
          { name: 'Modern Fantasy Kingdom' },
        ],
      },
      {
        name: 'Rajbari',
        tourSpots: [
          { name: 'Shah Pahlwan Dargah' },
          { name: 'Godai River Bank' },
        ],
      },
      {
        name: 'Kishoreganj',
        tourSpots: [
          { name: 'Nikli Haor' },
          { name: 'Jangalbari Fort' },
          { name: 'Solakia Eidgah' },
        ],
      },
    ],
  },
  {
    name: 'Chattogram Division',
    districts: [
      {
        name: 'Chattogram',
        tourSpots: [
          { name: 'Patenga Beach' },
          { name: "Foy's Lake" },
          { name: 'Naval Beach' },
          { name: 'Sitakunda Eco Park' },
        ],
      },
      {
        name: "Cox's Bazar",
        tourSpots: [
          { name: "Cox's Bazar Sea Beach" },
          { name: "Saint Martin's Island" },
          { name: 'Inani Beach' },
          { name: 'Himchari' },
        ],
      },
      {
        name: 'Rangamati',
        tourSpots: [
          { name: 'Kaptai Lake' },
          { name: 'Hanging Bridge' },
          { name: 'Shuvolong Waterfall' },
          { name: 'Rajban Vihara' },
        ],
      },
      {
        name: 'Bandarban',
        tourSpots: [
          { name: 'Nilgiri' },
          { name: 'Nilachal' },
          { name: 'Boga Lake' },
          { name: 'Keokradong' },
          { name: 'Buddha Dhatu Jadi' },
        ],
      },
      {
        name: 'Khagrachhari',
        tourSpots: [
          { name: 'Alutila Cave' },
          { name: 'Risang Waterfall' },
          { name: 'Sajek Valley' },
        ],
      },
      {
        name: 'Cumilla',
        tourSpots: [
          { name: 'Shalban Vihara' },
          { name: 'Mainamati Museum' },
          { name: 'Dharmasagar Dighi' },
          { name: 'BARD' },
        ],
      },
      {
        name: 'Feni',
        tourSpots: [
          { name: 'Muhuri Regulator' },
          { name: 'Bijoy Singha Dighi' },
        ],
      },
      {
        name: 'Noakhali',
        tourSpots: [
          { name: 'Nijhum Dwip' },
          { name: 'Musapur Regulator' },
        ],
      },
      {
        name: 'Lakshmipur',
        tourSpots: [
          { name: 'Ramgati Beach' },
          { name: 'Dalal Bazar Zamindar Bari' },
        ],
      },
      {
        name: 'Brahmanbaria',
        tourSpots: [
          { name: 'Arifail Mosque' },
          { name: 'Titas Gas Field' },
          { name: 'Bhadughar Mosque' },
        ],
      },
      {
        name: 'Chandpur',
        tourSpots: [
          { name: "Mini Cox's Bazar (Triveniketan)" },
          { name: 'Padma-Meghna River Junction' },
        ],
      },
    ],
  },
  {
    name: 'Sylhet Division',
    districts: [
      {
        name: 'Sylhet',
        tourSpots: [
          { name: 'Jaflong' },
          { name: 'Ratargul Swamp Forest' },
          { name: 'Hazrat Shah Jalal Shrine' },
          { name: 'Bichanakandi' },
        ],
      },
      {
        name: 'Moulvibazar',
        tourSpots: [
          { name: 'Sreemangal Tea Gardens' },
          { name: 'Lawachara National Park' },
          { name: 'Madhabkunda Waterfall' },
        ],
      },
      {
        name: 'Sunamganj',
        tourSpots: [
          { name: 'Tanguar Haor' },
          { name: 'Jadukata River' },
          { name: 'Shimul Bagan' },
          { name: 'Barek Tila' },
        ],
      },
      {
        name: 'Habiganj',
        tourSpots: [
          { name: 'Satchari National Park' },
          { name: 'Rema-Kalenga Wildlife Sanctuary' },
        ],
      },
    ],
  },
  {
    name: 'Rajshahi Division',
    districts: [
      {
        name: 'Rajshahi',
        tourSpots: [
          { name: 'Varendra Research Museum' },
          { name: 'Puthia Temple Complex' },
          { name: 'Padma Garden' },
        ],
      },
      {
        name: 'Bogura',
        tourSpots: [
          { name: 'Mahasthangarh' },
          { name: 'Behula Lakshindar Basanta Bati' },
          { name: 'Nawab Palace' },
        ],
      },
      {
        name: 'Naogaon',
        tourSpots: [
          { name: 'Paharpur Somapura Mahavihara' },
          { name: 'Kushumba Mosque' },
          { name: 'Jabai Beel' },
        ],
      },
      {
        name: 'Natore',
        tourSpots: [
          { name: 'Uttara Ganabhaban' },
          { name: 'Rani Bhabani Palace' },
          { name: 'Chalan Beel' },
        ],
      },
      {
        name: 'Pabna',
        tourSpots: [
          { name: 'Hardinge Bridge' },
          { name: 'Lalon Shah Bridge' },
          { name: 'Mental Hospital Heritage Site' },
        ],
      },
      {
        name: 'Sirajganj',
        tourSpots: [
          { name: 'Bangabandhu Eco Park' },
          { name: 'Rabindra Kachharibari (Shahjadpur)' },
        ],
      },
      {
        name: 'Chapai Nawabganj',
        tourSpots: [
          { name: 'Choto Sona Mosque' },
          { name: 'Gaur Ruins' },
        ],
      },
      {
        name: 'Joypurhat',
        tourSpots: [
          { name: 'Nandail Dighi' },
          { name: 'Laskarpur Mosque' },
        ],
      },
    ],
  },
  {
    name: 'Khulna Division',
    districts: [
      {
        name: 'Khulna',
        tourSpots: [
          { name: 'Sundarbans Mangrove Forest' },
          { name: 'Rupsha Bridge' },
        ],
      },
      {
        name: 'Bagerhat',
        tourSpots: [
          { name: 'Sixty Dome Mosque' },
          { name: 'Tomb of Khan Jahan Ali' },
        ],
      },
      {
        name: 'Satkhira',
        tourSpots: [
          { name: 'Sundarbans Entrance (Kalinagar/Munshiganj)' },
          { name: 'Tetulia Jami Mosque' },
        ],
      },
      {
        name: 'Jashore',
        tourSpots: [
          { name: 'Michael Madhusudan Dutt Birthplace (Sagardari)' },
          { name: 'Jessore Collectorate Park' },
        ],
      },
      {
        name: 'Jhenaidah',
        tourSpots: [
          { name: 'Naldanga Temple Complex' },
          { name: 'Pagla Kanai Tomb' },
        ],
      },
      {
        name: 'Magura',
        tourSpots: [
          { name: 'Siddheswari Temple' },
          { name: 'Raja Sitaram Ray Palace' },
        ],
      },
      {
        name: 'Narail',
        tourSpots: [
          { name: 'Chitra River' },
          { name: 'SM Sultan Complex' },
        ],
      },
      {
        name: 'Kushtia',
        tourSpots: [
          { name: 'Lalon Akhra (Cheuriya)' },
          { name: 'Rabindra Kuthibari (Shilaidaha)' },
        ],
      },
      {
        name: 'Chuadanga',
        tourSpots: [
          { name: 'Carew & Co. (Darshana)' },
          { name: 'Gholdari Mosque' },
        ],
      },
      {
        name: 'Meherpur',
        tourSpots: [
          { name: 'Mujibnagar Complex' },
          { name: 'Amjhupi Indigo Factory' },
        ],
      },
    ],
  },
  {
    name: 'Barishal Division',
    districts: [
      {
        name: 'Barishal',
        tourSpots: [
          { name: 'Floating Guava Market (Bhimruli)' },
          { name: 'Durga Sagar Dighi' },
          { name: 'Oxford Mission Church' },
        ],
      },
      {
        name: 'Patuakhali',
        tourSpots: [
          { name: 'Kuakata Sea Beach' },
          { name: 'Lebur Char' },
        ],
      },
      {
        name: 'Bhola',
        tourSpots: [
          { name: 'Monpura Island' },
          { name: 'Char Kukri Mukri' },
          { name: 'Jacob Tower (Char Fasson)' },
        ],
      },
      {
        name: 'Pirojpur',
        tourSpots: [
          { name: 'RayerKathi Landlord House' },
          { name: 'Boleshwar Riverfront' },
        ],
      },
      {
        name: 'Jhalokathi',
        tourSpots: [
          { name: 'Floating Guava Markets' },
          { name: 'Sujabad Fort' },
        ],
      },
      {
        name: 'Barguna',
        tourSpots: [
          { name: 'Bibi Chini Mosque' },
          { name: 'Taltali Eco Park' },
          { name: 'Sonar Char' },
        ],
      },
    ],
  },
  {
    name: 'Rangpur Division',
    districts: [
      {
        name: 'Rangpur',
        tourSpots: [
          { name: 'Tajhat Palace' },
          { name: 'Chikli Beel' },
          { name: 'Vinna Jagat' },
        ],
      },
      {
        name: 'Dinajpur',
        tourSpots: [
          { name: 'Kantajew Temple' },
          { name: 'Ramsagar Dighi' },
          { name: 'Shopnopuri Amusement Park' },
        ],
      },
      {
        name: 'Panchagarh',
        tourSpots: [
          { name: 'Tetulia (View of Kanchenjunga)' },
          { name: 'Rocks Museum' },
          { name: 'Banglabandha Zero Point' },
        ],
      },
      {
        name: 'Thakurgaon',
        tourSpots: [
          { name: 'Baliadangi Banyan Tree' },
          { name: 'Fun City Amusement Park' },
        ],
      },
      {
        name: 'Nilphamari',
        tourSpots: [
          { name: 'Nil Sagar Dighi' },
          { name: 'Saidpur Railway Workshop' },
        ],
      },
      {
        name: 'Gaibandha',
        tourSpots: [
          { name: 'Balasi Ghat' },
          { name: 'Bardhan Kuthi' },
        ],
      },
      {
        name: 'Kurigram',
        tourSpots: [
          { name: 'Dharla Bridge' },
          { name: 'Chilmari River Port' },
        ],
      },
      {
        name: 'Lalmonirhat',
        tourSpots: [
          { name: 'Teesta Barrage' },
          { name: 'Kakina Zamindar Bari' },
        ],
      },
    ],
  },
  {
    name: 'Mymensingh Division',
    districts: [
      {
        name: 'Mymensingh',
        tourSpots: [
          { name: 'Bangladesh Agricultural University Campus' },
          { name: 'Alexander Castle' },
          { name: 'Shashi Lodge' },
        ],
      },
      {
        name: 'Jamalpur',
        tourSpots: [
          { name: 'Lakiya Beel' },
          { name: 'Hazrat Shah Jamal Shrine' },
        ],
      },
      {
        name: 'Sherpur',
        tourSpots: [
          { name: 'Gajani Vacation Centre' },
          { name: 'Madhutila Eco Park' },
        ],
      },
      {
        name: 'Netrokona',
        tourSpots: [
          { name: 'Birishiri White Clay Hills' },
          { name: 'Birishiri Cultural Academy' },
        ],
      },
    ],
  },
];
